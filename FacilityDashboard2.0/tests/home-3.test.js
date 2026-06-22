const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "Home_3.html"), "utf8");

function includesAll(items) {
  for (const item of items) {
    assert(html.includes(item), `Expected Home_3.html to include: ${item}`);
  }
}

includesAll([
  "<title>Naraakum - Home 3</title>",
  "Please contact Naraakum and complete the agreement signing process.",
  "Once the agreement is completed, the remaining dashboard sections will be unlocked for your facility.",
  "Facility Information",
  "Messages",
  "Staff Messages",
  "System Messages",
  "Staff Management",
  "Staff List",
  "More",
  "menu-link-locked",
  "fi fi-rr-lock"
]);

assert(!html.includes("Orders List"), "Expected locked sections to not render inner dropdown items");
assert(!html.includes("Insurance Queue"), "Expected locked order submenu items to be removed");
assert(!html.includes("All Messages"), "Expected only allowed message items to remain");
assert(!html.includes("Patient Messages"), "Expected only allowed message items to remain");
assert(!html.includes("Payment Method"), "Expected only Facility Information under Facility Settings");
assert(!html.includes("Branches"), "Expected locked Facility Settings submenu items to be removed");

console.log("Home_3 locked dashboard checks passed");
