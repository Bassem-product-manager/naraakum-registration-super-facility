const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadNormalizer(fileName, functionName) {
  const htmlPath = path.join(__dirname, "..", "Super admin", "providers", fileName);
  const html = fs.readFileSync(htmlPath, "utf8");
  const start = html.indexOf(`function ${functionName}(f)`);
  const end = html.indexOf(`${functionName}(facility);`, start);

  assert.ok(start >= 0, `${functionName} function should exist`);
  assert.ok(end > start, `${functionName} function end marker should exist`);

  const source = html.slice(start, end);
  const context = {
    todayISO: () => "2026-06-21",
    SERVICE_CATALOG: []
  };

  vm.createContext(context);
  vm.runInContext(source, context);

  return context[functionName];
}

const normalizePharmacyData = loadNormalizer("pharm-details.html", "normalizePharmacyData");

const pharmacy = {
  submittedAt: "2026-01-20",
  documents: [
    { name: "Owner / Owners ID", status: "approved", uploadedAt: "2026-01-20", fileName: "owner.pdf" },
    { name: "Commercial Registration (CR)", uploadedAt: "2026-01-21", fileName: "cr.pdf" },
    { name: "Bank IBAN Letter", status: "rejected", uploadedAt: "2026-01-22", fileName: "bank.pdf", rejectionReason: "Blurred" }
  ],
  branches: [
    {
      id: "BR-001",
      documents: [
        { name: "Commercial Registration (CR)", uploadedAt: "2026-01-23", fileName: "branch-cr.pdf" }
      ]
    }
  ]
};

normalizePharmacyData(pharmacy);

const byName = Object.fromEntries(pharmacy.documents.map((doc) => [doc.name, doc]));
assert.strictEqual(byName["Owner / Owners ID"].status, "approved");
assert.strictEqual(byName["Commercial Registration (CR)"].status, "pending");
assert.strictEqual(byName["Bank Account Letter"].status, "rejected");
assert.strictEqual(byName["Suppliers File"].status, "missing");
assert.strictEqual(byName["Suppliers File"].fileName, "");
assert.strictEqual(pharmacy.branches[0].documents[0].status, "pending");

const normalizeFacilityData = loadNormalizer("facility-details.html", "normalizeFacilityData");
const facility = {
  submittedAt: "2026-01-20",
  documents: [
    { name: "Owner / Owners ID", status: "approved", uploadedAt: "2026-01-20", fileName: "owner.pdf" },
    { name: "Commercial Registration (CR)", uploadedAt: "2026-01-21", fileName: "cr.pdf" }
  ],
  branches: [
    {
      id: "BR-001",
      documents: [
        { name: "Commercial Registration (CR)", uploadedAt: "2026-01-23", fileName: "branch-cr.pdf" }
      ]
    }
  ]
};

normalizeFacilityData(facility);

const facilityByName = Object.fromEntries(facility.documents.map((doc) => [doc.name, doc]));
assert.strictEqual(facilityByName["Owner / Owners ID"].status, "approved");
assert.strictEqual(facilityByName["Commercial Registration (CR)"].status, "pending");
assert.strictEqual(facilityByName["Bank Account Letter"].status, "missing");
assert.strictEqual(facilityByName["Bank Account Letter"].fileName, "");
assert.strictEqual(facility.branches[0].documents[0].status, "pending");

console.log("provider document normalization tests passed");
