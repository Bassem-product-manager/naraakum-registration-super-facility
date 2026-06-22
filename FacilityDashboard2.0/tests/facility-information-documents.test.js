const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(
  path.join(__dirname, "..", "settings", "facility-information.html"),
  "utf8"
);

function includesAll(items) {
  for (const item of items) {
    assert(html.includes(item), `Expected facility-information.html to include: ${item}`);
  }
}

includesAll([
  "Facility Branches",
  "fi-branches-strip",
  "facilityBranchesStrip",
  "data-branch-id",
  "Main Branch",
  "Downtown Branch",
  "+966 54 887 7493",
  "+966 55 119 2238",
  "formatSaudiPhone",
  "mergeBranchDefaults",
  "applyBranchDetails",
  "selectedBranch = branch",
  "id=\"facilityNameEn\"",
  "id=\"facilityLicenseNumber\"",
  "id=\"ownerPhoneNumber\"",
  "id=\"addressCity\"",
  "id=\"addressStreet\"",
  "value=\"BMC Hospital\"",
  ".fi-form-card .form-control",
  "height: 44px",
  "phone-prefix\">+966",
  "inputmode=\"tel\"",
  "placeholder=\"54 887 7493\"",
  "Uploaded Documents",
  "documentsGrid",
  "renderBranchDocuments",
  "mainBranchDocuments",
  "branchCrDocument",
  "Owner / Owners ID",
  "Commercial Registration (CR)",
  "Bank Account Letter",
  "Suppliers File",
  "Branch Document",
  "branchDocumentName",
  "updateBranchDocument",
  "CR Number",
  "branchCrNumber",
  "CR-10004511",
  "data-document-kind=\"commercial-registration\"",
  "fi-document-badge is-approved",
  "ov-action-row",
  "fi2ResetPassword"
]);

assert(!html.includes("Eligible"), "Expected facility documents not to include Eligible status");
assert(!html.includes("is-eligible"), "Expected facility documents not to include eligible badge class");
assert(!html.includes("Recently uploaded"), "Expected facility documents not to include Recently uploaded status");
assert(!html.includes("fi-map-frame"), "Expected facility information page to remove embedded map frame");
assert(!html.includes("facilityMap"), "Expected facility information page to remove the map iframe");
assert(!html.includes("Open in Google Maps"), "Expected facility information page to remove Google Maps link");
assert(!html.includes("https://www.google.com/maps?q=24.7136,46.6753&z=14&output=embed"), "Expected facility information page to remove Google Maps embed URL");
assert(!html.includes("Facility Location"), "Expected facility information page to remove Facility Location text");
assert(!html.includes("Riyadh, Saudi Arabia"), "Expected facility information page to remove static Riyadh location text");
assert(!html.includes("Add New Branch"), "Expected facility information page to omit Add New Branch action from branch switcher");
assert(!html.includes("Selected branch:"), "Expected facility information page to remove selected branch summary text");
assert(!html.includes("selectedBranchSummary"), "Expected facility information page to remove selected branch summary node");
assert(!html.includes("fi-selected-branch"), "Expected facility information page to remove selected branch summary styles");
assert(!html.includes("phone-flag"), "Expected phone input to use a single clean prefix instead of split flag/code cells");
assert(!html.includes("Address Proof"), "Expected uploaded documents not to use the old generic address proof item");
assert(!html.includes("Tax Registration Certificate"), "Expected uploaded documents not to use the old generic tax item");
assert(!html.includes("Owner Identity Document"), "Expected uploaded documents to use Owner / Owners ID label");
assert(html.includes('String(branch.id) === "1"'), "Expected main branch to keep its full document set");
assert(html.includes("[branchCrDocument(branch)]"), "Expected non-main branches to show only branch CR document");
assert(!html.includes('<div class="ov-item"><div class="l">Reset Password</div><button class="btn btn-primary btn-40" id="fi2ResetPassword"'), "Expected reset password action to be moved out of the regular overview item grid cell");
assert(html.includes('button class="fi-doc-btn is-subtle" type="button" disabled aria-disabled="true">Approved</button>'), "Expected approved submitted documents to render a disabled washed action");
assert(html.includes('<button class="fi-doc-btn is-primary" type="button">Re-upload</button>'), "Expected not approved submitted documents to keep a clickable re-upload action");
assert(html.includes('const documentAction = (doc) => doc.status === "Approved"'), "Expected branch document rendering to derive actions from approval status");

console.log("facility information branch binding checks passed");
