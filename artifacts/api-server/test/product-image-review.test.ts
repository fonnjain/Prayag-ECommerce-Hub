import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { readFileSync, writeFileSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { pool } from "@workspace/db";
import {
  readProductImageOverrides,
  readProductImageReview,
  saveProductImageOverride,
} from "../src/lib/product-image-review";

const productImageOverrideLockId = 780_346_113;
const overridesPath = resolve(
  import.meta.dirname,
  "../../prayag/public/images/drive/product-image-overrides.json",
);
const originalOverridesRaw = readFileSync(overridesPath, "utf8");
const originalOverrides = JSON.parse(originalOverridesRaw) as Record<string, string[]>;
const workerPath = resolve(import.meta.dirname, "product-image-review-worker.ts");
const apiServerDirectory = resolve(import.meta.dirname, "..");

let reviewTarget: {
  sku: string;
  paths: [string, string];
};

type WorkerProcess = {
  child: ChildProcess;
  waitForLine: (prefix: string) => Promise<string>;
};

function startWorker(expectedVersion: string, paths: string[]): WorkerProcess {
  const child = spawn(
    process.execPath,
    ["--import", "tsx", workerPath, reviewTarget.sku, JSON.stringify(paths), expectedVersion],
    { cwd: apiServerDirectory, stdio: ["pipe", "pipe", "pipe"] },
  );
  let buffered = "";
  const lines: string[] = [];
  const waiters: Array<(line: string) => void> = [];

  child.stdout!.setEncoding("utf8");
  child.stdout!.on("data", (chunk: string) => {
    buffered += chunk;
    const completeLines = buffered.split("\n");
    buffered = completeLines.pop() ?? "";
    for (const line of completeLines) {
      const waiter = waiters.shift();
      if (waiter) waiter(line);
      else lines.push(line);
    }
  });

  return {
    child,
    waitForLine: async (prefix: string): Promise<string> => {
      while (true) {
        const line = lines.shift() ?? await new Promise<string>((resolveLine) => waiters.push(resolveLine));
        if (line.startsWith(prefix)) return line;
      }
    },
  };
}

function stopWorker(worker: WorkerProcess): void {
  if (!worker.child.killed) worker.child.kill("SIGTERM");
}

async function acquireTestLock() {
  const client = await pool.connect();
  await client.query("SELECT pg_advisory_lock($1::bigint)", [productImageOverrideLockId]);
  return client;
}

async function releaseTestLock(
  client: Awaited<ReturnType<typeof pool.connect>>,
  disconnected = false,
): Promise<void> {
  if (disconnected) {
    client.release(new Error("simulate disconnected API process"));
  } else {
    try {
      await client.query("SELECT pg_advisory_unlock($1::bigint)", [productImageOverrideLockId]);
    } finally {
      client.release();
    }
  }
}

before(async () => {
  const { rows } = await pool.query<{ sku: string }>(
    "SELECT sku FROM products WHERE sku IS NOT NULL",
  );
  const review = readProductImageReview(rows.map((row) => row.sku));
  const group = review.groups.find(
    (candidate) => candidate.sku && candidate.candidates.length >= 2,
  );

  assert.ok(group?.sku, "The catalogue must contain an unambiguous duplicate image group");
  assert.ok(group.candidates.length >= 2);
  reviewTarget = {
    sku: group.sku,
    paths: [group.candidates[0].path, group.candidates[1].path],
  };
});

afterEach(() => {
  writeFileSync(overridesPath, originalOverridesRaw, "utf8");
});

after(async () => {
  writeFileSync(overridesPath, originalOverridesRaw, "utf8");
  await pool.end();
});

test("rejects stale concurrent approvals and preserves exact candidate-path validation", async () => {
  const snapshot = readProductImageReview([reviewTarget.sku]);
  const lockHolder = await acquireTestLock();
  const workers = [
    startWorker(snapshot.version, [reviewTarget.paths[0]]),
    startWorker(snapshot.version, [reviewTarget.paths[1]]),
  ];
  let lockReleased = false;
  let savedPaths: string[] | undefined;

  try {
    await Promise.all(workers.map((worker) => worker.waitForLine("ready")));
    for (const worker of workers) worker.child.stdin!.write("go\n");
    await Promise.all(workers.map((worker) => worker.waitForLine("started")));
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
    await releaseTestLock(lockHolder);
    lockReleased = true;

    const results = await Promise.all(
      workers.map(async (worker) => JSON.parse((await worker.waitForLine("result:")).slice("result:".length)) as {
        type: "success" | "conflict" | "error";
        paths?: string[];
        message?: string;
      }),
    );

    const successful = results.filter((result) => result.type === "success");
    const conflicts = results.filter((result) => result.type === "conflict");

    assert.equal(successful.length, 1, "exactly one approval should win");
    assert.equal(conflicts.length, 1, "the stale approval should receive a conflict");
    savedPaths = successful[0].paths;
    assert.ok(savedPaths, "the winning approval should include its selected paths");
    assert.deepEqual(readProductImageOverrides(), {
      ...originalOverrides,
      [reviewTarget.sku]: savedPaths,
    });
  } finally {
    if (!lockReleased) await releaseTestLock(lockHolder);
    for (const worker of workers) stopWorker(worker);
  }

  const latest = readProductImageReview([reviewTarget.sku]);
  await assert.rejects(
    saveProductImageOverride(
      reviewTarget.sku,
      [`${reviewTarget.paths[0].replace(/\/[^/]+$/, "")}/not-a-candidate.webp`],
      latest.version,
    ),
    /Every approved image must be an exact candidate path/,
  );
  assert.deepEqual(readProductImageOverrides(), {
    ...originalOverrides,
    [reviewTarget.sku]: savedPaths,
  });
});

test("allows the next reviewer after the lock owner disconnects", async () => {
  const lockHolder = await acquireTestLock();
  const snapshot = readProductImageReview([reviewTarget.sku]);
  const worker = startWorker(snapshot.version, [reviewTarget.paths[0]]);
  let lockDisconnected = false;

  try {
    await worker.waitForLine("ready");
    worker.child.stdin!.write("go\n");
    await worker.waitForLine("started");

    const resultPromise = worker.waitForLine("result:");
    const resultBeforeDisconnect = await Promise.race([
      resultPromise.then((line) => ({ line })),
      new Promise<{ timedOut: true }>((resolveDelay) =>
        setTimeout(() => resolveDelay({ timedOut: true }), 150),
      ),
    ]);
    assert.ok("timedOut" in resultBeforeDisconnect, "save should wait for the advisory lock");

    await releaseTestLock(lockHolder, true);
    lockDisconnected = true;
    const result = JSON.parse(
      ("line" in resultBeforeDisconnect ? resultBeforeDisconnect.line : await resultPromise).slice("result:".length),
    ) as { type: string; paths?: string[]; message?: string };
    assert.equal(result.type, "success", result.message);
    assert.deepEqual(result.paths, [reviewTarget.paths[0]]);
    assert.deepEqual(readProductImageOverrides(), {
      ...originalOverrides,
      [reviewTarget.sku]: [reviewTarget.paths[0]],
    });
  } finally {
    if (!lockDisconnected) await releaseTestLock(lockHolder);
    stopWorker(worker);
  }
});