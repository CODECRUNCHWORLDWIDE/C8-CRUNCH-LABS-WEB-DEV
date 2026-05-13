# Week 4 — Quiz

Ten questions. Lecture notes closed. Aim for 9/10.

---

**Q1.** How many language types does the ECMAScript Language Specification define in §6.1?

- A) Five
- B) Six
- C) Seven
- D) Eight

---

**Q2.** What does `typeof null` return in JavaScript?

- A) `"null"`
- B) `"undefined"`
- C) `"object"`
- D) `"NaN"`

---

**Q3.** Which of the following is **truthy**?

- A) `0`
- B) `""`
- C) `"0"`
- D) `null`

---

**Q4.** What is the result of `0 == false` and of `0 === false` in JavaScript?

- A) `true` and `true`
- B) `true` and `false`
- C) `false` and `false`
- D) `false` and `true`

---

**Q5.** A `let` declaration is referenced before the line on which it is declared. What happens?

- A) The reference returns `undefined`.
- B) The reference returns the eventual value (hoisting fills it in).
- C) A `ReferenceError` is thrown — the binding is in the temporal dead zone.
- D) The code is rewritten by the engine to move the declaration up.

---

**Q6.** Which best describes a closure?

- A) A function that has been frozen with `Object.freeze`.
- B) A function that references variables from its enclosing scope, keeping those variables alive as long as the function reference is reachable.
- C) A function that has been bundled by a module bundler.
- D) A function that runs immediately when its file is loaded.

---

**Q7.** What is the difference between an arrow function and a function expression with respect to `this`?

- A) There is no difference; `this` works identically.
- B) An arrow function has its own `this`, scoped to where the function is called.
- C) An arrow function does **not** have its own `this`; it inherits `this` from the surrounding lexical scope.
- D) An arrow function always binds `this` to `window`.

---

**Q8.** Which of these statements about `<script type="module">` is **false**?

- A) Module scripts run in strict mode automatically.
- B) Module scripts are deferred by default; they run after the DOM has parsed.
- C) Module scripts can be loaded from `file://` without any extra configuration.
- D) The top-level `this` inside a module is `undefined`, not `window`.

---

**Q9.** You write `localStorage.setItem('user', { name: 'Ada' })`. What is stored under the `user` key?

- A) An object with a `name` property of `'Ada'`.
- B) The string `"[object Object]"` — `setItem` coerces non-strings via `String(value)`.
- C) The string `'{"name":"Ada"}'` — `setItem` automatically serializes to JSON.
- D) Nothing — `setItem` throws because the value is not a string.

---

**Q10.** Which equality check correctly returns `true` when comparing `NaN` to `NaN`?

- A) `NaN === NaN`
- B) `NaN == NaN`
- C) `Number.isNaN(NaN) && Number.isNaN(NaN)`
- D) `Object.is(NaN, NaN)`

---

## Answer key

<details>
<summary>Click to reveal</summary>

1. **D** — Eight: `Undefined`, `Null`, `Boolean`, `String`, `Number`, `BigInt`, `Symbol`, `Object`. Per ECMA-262 §6.1.
2. **C** — `"object"`. A historical bug from the 1995 implementation, frozen in the spec to avoid breaking the web.
3. **C** — `"0"` is a non-empty string. The seven falsy values are `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN` (eight including `-0` as a distinct primitive; `ToBoolean` returns `false` for each).
4. **B** — `0 == false` is `true` (both coerce to `0` per `IsLooselyEqual`); `0 === false` is `false` (different types).
5. **C** — `ReferenceError`. `let` and `const` are in the **temporal dead zone** between the start of the scope and the line of declaration. Per ECMA-262 §13.3.1.
6. **B** — A closure is a function plus the variables it captured from its enclosing scope. Per ECMA-262 §10.2 (Function Environment Records), every function in JavaScript technically forms one; we name them when the captured variables outlive their enclosing call.
7. **C** — Arrow functions have no own `this`; they inherit lexically. This is the most useful difference between arrows and function expressions.
8. **C** — Module scripts cannot be loaded from `file://` without extra configuration; CORS rules apply, and the `file://` origin is rejected. An HTTP origin (Live Server, `python3 -m http.server`, etc.) is required.
9. **B** — The string `"[object Object]"`. `setItem` coerces its value via `String(value)` per the Web Storage spec; a plain object stringifies to `"[object Object]"`. You must call `JSON.stringify` yourself before writing.
10. **D** — `Object.is(NaN, NaN)` is `true`. `NaN === NaN` is `false` (the only value not strictly equal to itself). `Number.isNaN(NaN)` returns `true` but `Number.isNaN` is a unary predicate, not an equality operator; option C answers a different question. Per ECMA-262 §7.2.10 (`SameValue`), `Object.is` is the right tool.

</details>

If under 7, re-read [Lecture 1](./lecture-notes/01-types-control-flow-functions.md) and [Lecture 2](./lecture-notes/02-scope-closures-and-modules.md). If 9 or above, you are ready for the [homework](./homework.md).
