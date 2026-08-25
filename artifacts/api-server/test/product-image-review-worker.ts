import { ProductImageApprovalConflict, saveProductImageOverride } from "../src/lib/product-image-review";

const [, , sku, pathsJson, expectedVersion] = process.argv;
const paths = JSON.parse(pathsJson) as string[];

process.stdout.write("ready\n");
process.stdin.once("data", async () => {
  process.stdout.write("started\n");
  try {
    if (!expectedVersion) throw new Error("Missing expected approval version");
    const approval = await saveProductImageOverride(sku, paths, expectedVersion);
    process.stdout.write(`result:${JSON.stringify({ type: "success", paths: approval.paths })}\n`);
  } catch (error) {
    process.stdout.write(
      `result:${JSON.stringify({
        type: error instanceof ProductImageApprovalConflict ? "conflict" : "error",
        message: error instanceof Error ? error.message : String(error),
      })}\n`,
    );
  }
});