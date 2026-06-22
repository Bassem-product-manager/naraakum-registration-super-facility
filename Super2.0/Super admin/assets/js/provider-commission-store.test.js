const assert = require("assert");
const store = require("./provider-commission-store.js");

const percentRule = store.normalizeRule({
  providerType: "Facility",
  providerCode: "fc-00001",
  mode: "percent",
  value: "12.5",
  appliesTo: "all_orders",
  status: "active"
});

assert.strictEqual(percentRule.providerType, "facility");
assert.strictEqual(percentRule.providerCode, "FC-00001");
assert.strictEqual(percentRule.mode, "percent");
assert.strictEqual(percentRule.value, 12.5);
assert.strictEqual(store.formatRuleSummary(percentRule), "12.5%");
assert.strictEqual(store.calculateCommission(400, percentRule), 50);

const fixedRule = store.normalizeRule({
  providerType: "pharmacy",
  providerCode: "PH-00002",
  mode: "fixed",
  value: "18"
});

assert.strictEqual(store.formatRuleSummary(fixedRule), "Fixed 18.00 SAR");
assert.strictEqual(store.calculateCommission(400, fixedRule), 18);

const blankRule = store.normalizeRule({
  providerType: "individual",
  providerCode: "DR-00003",
  mode: "fixed",
  value: ""
});

assert.strictEqual(blankRule.value, 0);
assert.strictEqual(store.formatRuleSummary(blankRule), "Not set");

console.log("provider commission store tests passed");
