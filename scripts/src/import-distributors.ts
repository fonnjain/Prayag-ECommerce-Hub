import fs from "node:fs";
import { db, distributorsTable } from "@workspace/db";

const FILE = "/home/runner/workspace/attached_assets/Distributer_Upload_Sample_File_1785132002167.csv";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function main() {
  const text = fs.readFileSync(FILE, "utf8");
  const rows = parseCSV(text);
  const header = rows[0].map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);
  const col = {
    company: idx("Company Name"),
    contact: idx("Contact Person 1"),
    phone: idx("Contact Number 1"),
    email: idx("Email Address"),
    state: idx("State Name"),
    city: idx("City"),
    pincode: idx("Pincode"),
    gst: idx("GST"),
    district: idx("District"),
    status: idx("Status"),
  };
  const clean = (v: string | undefined) => (v ?? "").trim() || null;

  const values = rows.slice(1).flatMap((r) => {
    const businessName = clean(r[col.company]);
    if (!businessName) return [];
    return [{
      businessName,
      contactName: clean(r[col.contact]) ?? businessName,
      email: clean(r[col.email]) ?? "",
      phone: clean(r[col.phone]),
      city: clean(r[col.city]),
      state: clean(r[col.state]),
      pincode: clean(r[col.pincode]),
      gstNumber: clean(r[col.gst]),
      territory: clean(r[col.district]),
      status: (clean(r[col.status]) || "pending").toLowerCase() === "approved" ? "approved" : "pending",
    }];
  });

  console.log(`Parsed ${values.length} distributor rows`);
  const BATCH = 500;
  for (let i = 0; i < values.length; i += BATCH) {
    await db.insert(distributorsTable).values(values.slice(i, i + BATCH));
    console.log(`Inserted ${Math.min(i + BATCH, values.length)}/${values.length}`);
  }
  console.log("Done");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
