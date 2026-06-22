const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "orders", "create-order.html"), "utf8");

function includesAll(items) {
  for (const item of items) {
    assert(html.includes(item), `Expected create-order.html to include: ${item}`);
  }
}

includesAll([
  "vc_consultation",
  "Dentistry",
  "Ear_Nose",
  "8 Hours / 1 Day Package",
  "12 Hours / 1 Month Package",
  "9 Sessions Package",
  "Comprehensive Checkup Package",
  "Diabetes Package",
  "Complete Blood Count Package",
  "pharmacy",
  "My Prescription Records",
  "Abdullah Al Rajhi (4 Records)",
  "Blood-sugar",
  "Blood Pressure",
  "Physical Activity",
  "BMC Hospital Doctors",
  "Dr. Riyadh Hamad Al-Malhi",
  "Dr. Sara Ahmed",
  "doctorAvailabilityBySpecialty",
  "vc_consultation:\"all\"",
  "All Specialties",
  "data-action=\"filter-specialty-select\"",
  "getDoctorsForSpecialty",
  ".nk-product-img{height:76px",
  "data-action=\"select-doctor-slot\"",
  "data-action=\"select-package-tab\"",
  "data-action=\"select-pharmacy-tab\"",
  "Medicines",
  "My Prescription Records",
  "renderPackageCards",
  "renderServiceTabs",
  "renderRemoteFollowupService",
  "data-action=\"open-package-details\"",
  "data-action=\"add-package-to-cart\"",
  "fi fi-rr-shopping-cart",
  "Package Details",
  "Lab Tests",
  "Select follow-up type to view packages.",
  "nk-remote-type-icon",
  "nk-plan-tag",
  "Recommended",
  "Weekly review of readings and symptoms",
  "Care coordinator notes for the next provider visit",
  "Physical Activity",
  "Activity progression review",
  "renderCaregiverService",
  "type:\"select\"",
  "type:\"product\"",
  "type:\"record\"",
  "type:\"followup\""
]);

const renderMatches = html.match(/function renderServicePanel\(/g) || [];
assert.strictEqual(renderMatches.length, 1, "Expected exactly one renderServicePanel function");
assert(!html.includes("legacyRenderServicePanel"), "Expected legacy service renderer to be removed");
assert(!html.includes('data-action="select-specialty"'), "Expected specialty control to render as filter buttons, not a dropdown");
assert(!html.includes('data-action="filter-specialty"'), "Expected specialty chips to be replaced by one select filter");
assert(!html.includes(" - ${opt.name}"), "Expected specialty filter template to render code only");
assert(!html.includes("Select Package"), "Expected package cards to use cart icon buttons instead of Select Package text");
assert(!html.includes("Starts from 20.00 SAR"), "Expected starts-from copy to be removed from package cards");
assert(!html.includes(".nk-doctor-grid{display:grid;grid-template-columns:repeat(2"), "Expected doctor cards to be vertical, not a two-column grid");
assert(!html.includes("id:`vc_${sp.value}`"), "Expected virtual consultation specialties to filter doctors instead of adding checkbox services");

console.log("create-order content checks passed");
