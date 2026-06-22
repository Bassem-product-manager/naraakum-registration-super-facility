const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "index copy.html"), "utf8");

function includesAll(items) {
  for (const item of items) {
    assert(html.includes(item), `Expected index copy.html to include: ${item}`);
  }
}

includesAll([
  "menu-link-locked",
  "fi fi-rr-lock",
  "Facility Information",
  "Staff Messages",
  "System Messages",
  "Staff List",
  "More",
  "Please contact Naraakum and complete the agreement signing process.",
  "Once the agreement is completed, the remaining dashboard sections will be unlocked for your facility."
]);

assert(!html.includes("Orders List"), "Expected locked order submenu to be removed");
assert(!html.includes("Insurance Queue"), "Expected locked order submenu to be removed");
assert(!html.includes("All Messages"), "Expected only allowed message entries to remain");
assert(!html.includes("Patient Messages"), "Expected only allowed message entries to remain");
assert(!html.includes("Payment Method"), "Expected only Facility Information under Facility Settings");
assert(!html.includes("Roles &amp; Permissions"), "Expected Admin submenu to be removed");
assert(html.includes('id="menu-logout"'), "Expected Log Out item to remain in sidebar");
assert(html.includes('menu-link-locked" id="menu-logout"') || html.includes('logout-link menu-link-locked" id="menu-logout"'), "Expected Log Out to be locked");

console.log("index copy lock checks passed");
