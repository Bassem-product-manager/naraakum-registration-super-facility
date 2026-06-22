const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function includesAll(items) {
  for (const item of items) {
    assert(html.includes(item), `Expected index.html to include: ${item}`);
  }
}

includesAll([
  "branch-switcher",
  "branchSwitcher",
  "Main Branch",
  "Branch 1",
  "Branch 2",
  "data-status=\"active\"",
  "data-status=\"suspended\"",
  "data-status=\"banned\"",
  "branchStatusBadge",
  "branchAccessNotice",
  "Please contact your Naraakum admin to reactivate this branch.",
  "menu-link-locked",
  "fi fi-rr-lock",
  "data-allowed-when-locked"
]);

assert(!html.includes("homeSearchInput"), "Expected home search input to be removed");
assert(!html.includes("btnHomeSearch"), "Expected home search button to be removed");
assert(!html.includes("home-filter-modal"), "Expected home filter modal to be removed");
assert(!html.includes("fltBranch"), "Expected branch filtering modal field to be removed");

const notificationsIndex = html.indexOf("notifcation-box");
const branchSwitcherIndex = html.indexOf("id=\"branchSwitcher\"");
const clockIndex = html.indexOf("id=\"ksaClock\"");
assert(
  notificationsIndex !== -1 && branchSwitcherIndex > notificationsIndex,
  "Expected branch switcher to appear after notifications"
);
assert(
  clockIndex !== -1 && branchSwitcherIndex < clockIndex,
  "Expected branch switcher to appear before the KSA clock"
);

console.log("home branch status checks passed");
