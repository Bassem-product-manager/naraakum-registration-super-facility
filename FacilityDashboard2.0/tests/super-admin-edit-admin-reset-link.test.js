const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(
  path.join(
    "D:",
    "New_Bassem",
    "New One",
    "Super _remote",
    "Super",
    "Super",
    "Super admin",
    "admin",
    "EditAdmin.html"
  ),
  "utf8"
);

[
  "password-action-row",
  "adminResetPassword",
  "fi fi-rr-paper-plane",
  "<span>Send Reset Link</span>",
  "adminResetHint",
  "Reset link sent"
].forEach((item) => {
  assert(html.includes(item), `Expected Super admin EditAdmin.html to include: ${item}`);
});

assert(
  !html.includes('<div class="col-12 col-md-6">\r\n                    <label class="fsize-12 text-grey">Reset Password</label>'),
  "Expected reset password action not to occupy a regular half-width form column"
);

console.log("super admin edit admin reset link checks passed");
