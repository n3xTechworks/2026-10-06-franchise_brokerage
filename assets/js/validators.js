/* Pure validation rules — shared by the browser (window.Validators) and the Node unit tests. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Validators = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var NAME_RE = /^\p{L}[\p{L}\p{M}'’.\- ]*\p{L}$|^\p{L}\p{L}$/u;
  var EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

  function ok() { return { valid: true, message: "" }; }
  function fail(message) { return { valid: false, message: message }; }
  function str(v) { return v == null ? "" : String(v).trim(); }

  function name(value) {
    var v = str(value).replace(/\s+/g, " ");
    if (!v) return fail("Please enter your name.");
    if (/\d/.test(v)) return fail("Name cannot contain numbers.");
    if (v.length < 2) return fail("Name must be at least 2 characters.");
    if (!NAME_RE.test(v)) return fail("Name can only contain letters, spaces, hyphens and apostrophes.");
    return ok();
  }

  function email(value) {
    var v = str(value);
    if (!v) return fail("Please enter your email address.");
    if (v.indexOf("@") === -1) return fail("Email must include an \"@\" symbol.");
    if (/[A-Z]/.test(v)) return fail("Email must be in lowercase letters, e.g. name@gmail.com.");
    if (!EMAIL_RE.test(v) || /\.\./.test(v) || /^\.|\.@/.test(v)) return fail("Please enter a valid email, e.g. name@company.com.");
    return ok();
  }

  function phone(value) {
    var v = str(value);
    if (!v) return fail("Please enter your phone number.");
    if (/[^\d]/.test(v)) return fail("Phone number can only contain digits (0-9).");
    if (v.length < 7 || v.length > 15) return fail("Phone number must be between 7 and 15 digits.");
    return ok();
  }

  function required(value, label) {
    return str(value) ? ok() : fail("Please " + (label || "fill in this field") + ".");
  }

  function select(value) { return str(value) ? ok() : fail("Please choose an option."); }

  function message(value, min) {
    var v = str(value), m = min || 10;
    if (!v) return fail("Please enter your message.");
    if (v.length < m) return fail("Message must be at least " + m + " characters.");
    return ok();
  }

  function amount(value) {
    var v = str(value);
    if (!v) return fail("Please enter an amount.");
    if (!/^\d+$/.test(v) || Number(v) <= 0) return fail("Enter a whole number greater than 0 (digits only).");
    return ok();
  }

  function checked(value) { return value ? ok() : fail("Please tick this box to continue."); }

  /* Strip anything that is not a digit (used to block letters while typing in phone fields). */
  function digitsOnly(value) { return String(value == null ? "" : value).replace(/\D+/g, ""); }

  return { name: name, email: email, phone: phone, required: required, select: select,
           message: message, amount: amount, checked: checked, digitsOnly: digitsOnly };
});
