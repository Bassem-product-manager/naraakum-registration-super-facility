const assert = require("assert");
const store = require("./service-markups-store.js");

const rule = store.normalizeMarkup({
  id: "",
  facilityCode: "fc-00001",
  facilityName: "Dr. Bassam Medical Center",
  mainServiceId: "home_care",
  mainServiceName: "Home Care",
  serviceId: "nutrition_care",
  serviceName: "Nutrition Care",
  pricingLevel: "self_pay",
  markupType: "flat amount",
  amount: "120"
});

assert.strictEqual(rule.facilityCode, "FC-00001");
assert.strictEqual(rule.mainServiceName, "Home Care");
assert.strictEqual(rule.markupType, "flat_amount");
assert.strictEqual(rule.amount, 120);
assert.strictEqual(store.markupTypeLabel(rule.markupType), "Flat Amount");
assert.strictEqual(store.pricingLevelLabel(rule.pricingLevel), "Self-Pay");
assert.strictEqual(store.formatAmount(rule), "120.00 SAR");
assert.strictEqual(store.mainServiceLabel(rule), "Home Care");

const percent = store.normalizeMarkup({
  markupType: "percentage",
  amount: "12.5"
});

assert.strictEqual(percent.markupType, "percentage");
assert.strictEqual(store.formatAmount(percent), "12.5%");

const invalid = store.validateMarkup(store.normalizeMarkup({
  facilityCode: "",
  serviceId: "",
  markupType: "flat_amount",
  amount: "0"
}));

assert.deepStrictEqual(Object.keys(invalid.errors).sort(), ["amount", "facilityService"]);

console.log("service markups store tests passed");
