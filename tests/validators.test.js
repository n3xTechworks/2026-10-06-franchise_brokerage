const test = require("node:test");
const assert = require("node:assert/strict");
const V = require("../assets/js/validators.js");

const bad = (fn, ...vals) => vals.forEach((v) => assert.equal(fn(v).valid, false, `expected invalid: ${JSON.stringify(v)}`));
const good = (fn, ...vals) => vals.forEach((v) => assert.equal(fn(v).valid, true, `expected valid: ${JSON.stringify(v)}`));

test("name: rejects empty, single character and numbers", () => {
  bad(V.name, "", "   ", "A", " a ", "John3", "123", "J0hn Smith", "Jane_Doe", "@@", "-", "'a");
  good(V.name, "Al", "Jane Doe", "Mary-Anne O'Neil", "José Álvarez", "Li Wei", "Dr. Smith");
});

test("name: messages are specific", () => {
  assert.match(V.name("A").message, /at least 2/);
  assert.match(V.name("Bob7").message, /numbers/);
});

test("email: rejects missing @, domain or TLD, accepts valid", () => {
  bad(V.email, "", "abc", "abc@", "@example.com", "abc@example", "abc@.com", "abc@example.", "a b@example.com", "a@@example.com", "john..doe@example.com", "abc@exa_mple.com", "abc@example.c", "Test@GMAIL.com", "NAME@company.com");
  good(V.email, "name@company.com", "first.last+tag@sub.example.co.uk", "a@b.io");
  assert.match(V.email("abc").message, /@/);
});

test("phone: digits only, 7-15 long", () => {
  bad(V.phone, "", "abcdefghij", "312555abcd", "(312) 555-0148", "+13125550148", "12345", "1234567890123456");
  good(V.phone, "3125550148", "1234567", "123456789012345");
  assert.match(V.phone("12ab34567").message, /digits/);
});

test("phone: digitsOnly strips letters and symbols", () => {
  assert.equal(V.digitsOnly("a1b2-c3 (4)"), "1234");
  assert.equal(V.digitsOnly(null), "");
});

test("select, message, amount, checked, required", () => {
  bad(V.select, "", "  "); good(V.select, "buy");
  bad(V.message, "", "short"); good(V.message, "This is a long enough message.");
  assert.equal(V.message("12345", 5).valid, true);
  bad(V.amount, "", "0", "-5", "12.5", "abc", "1,000"); good(V.amount, "250000");
  assert.equal(V.checked(false).valid, false); assert.equal(V.checked(true).valid, true);
  bad((v) => V.required(v, "enter your business name"), "", "  "); good(V.required, "Acme");
});
