# Lecture 1 — Types, Control Flow, Functions

> **Outcome:** You can name the eight ECMAScript types, list the seven falsy values, decide between `==` and `===` from the spec's perspective, write a function in three forms — declaration, expression, arrow — and explain how the call stack walks them. By the end of this lecture you read a one-page JavaScript file the way you now read a one-page CSS file: with no surprises.

## 1. What JavaScript actually is

JavaScript is a language. Like English, it has dialects. Unlike English, it has a single normative specification: **ECMA-262 — the ECMAScript Language Specification**, maintained by Technical Committee 39 (TC39) at ECMA International, with annual releases since 2015. The current edition at the time of writing is the **15th edition, published June 2024**. The next edition publishes in June 2025.

Everywhere we say "JavaScript" in these notes, we mean ECMAScript-the-language. "JavaScript" is a Mozilla trademark for an implementation; the language Brendan Eich wrote in 10 days in May 1995 became the ECMA-262 standard in June 1997, and the spec is what we cite when the answer to "why does the language do that?" actually matters.

The spec is free, online, and surprisingly readable once you accept its conventions. Bookmark it: <https://tc39.es/ecma262/>. We will cite section numbers in this lecture and the next. You do not need to read the spec end-to-end. You should be able to find a section when you need one.

JavaScript runs in three main places: **browsers** (this week's only environment), **Node.js / Bun / Deno** (server-side runtimes, Week 7 onward), and **embedded engines** (everywhere from Adobe Photoshop's scripting to your car's infotainment system). The language is the same; the host environments add their own APIs. The browser adds the **DOM** (Week 5), `fetch` (Week 8), `localStorage` (this week), and several hundred other things. Node adds `fs`, `path`, `process`. Same language; different libraries.

---

## 2. The eight types

> **The single concept JavaScript's type system is built around: the spec defines exactly eight types, divided into seven primitives and one object type. Every value you will ever encounter in JavaScript is one of these eight, and `typeof` will tell you which — with one famous lie.**

Per ECMA-262 §6.1, the **language types** are:

| Type | Example values | `typeof` returns |
|------|----------------|------------------|
| `Undefined` | `undefined` | `"undefined"` |
| `Null` | `null` | `"object"` *(historical bug)* |
| `Boolean` | `true`, `false` | `"boolean"` |
| `String` | `"hello"`, `'a'`, `` `template` `` | `"string"` |
| `Number` | `42`, `3.14`, `Infinity`, `NaN`, `-0` | `"number"` |
| `BigInt` | `42n`, `9007199254740993n` | `"bigint"` |
| `Symbol` | `Symbol()`, `Symbol("description")` | `"symbol"` |
| `Object` | `{}`, `[]`, `function () {}`, `new Date()` | `"object"` *(or `"function"`)* |

Seven primitives and one object type. That is it. There are no `int`, no `float`, no `char`, no `byte`, no `dictionary`. There is no separate `Array` type — arrays are objects with integer keys and a `length` property; per §10.4.2 they are "exotic objects" but `typeof []` returns `"object"`, the same as `{}`.

### `typeof null === 'object'` is a bug, not a feature

The single most-cited oddity of the language. In the original 1995 implementation, values were tagged with a low-bits type indicator; the type tag for "object" was `000`. The value `null` was the all-zero pointer, which collided with the object tag. By the time anyone noticed, fixing it would have broken every page on the web. The spec froze the behavior. The proposal to fix it (`typeof null === 'null'`) failed; the cost of breaking sites was too high.

The practical answer: never use `typeof` to check for `null`. Use `=== null` directly.

```js
// Wrong: typeof null is "object"
if (typeof user === 'object') { /* might be null! */ }

// Right: check for null explicitly
if (user !== null && typeof user === 'object') { /* a real object */ }
```

### Primitives are immutable; objects are not

A primitive value cannot be changed in place. When you write `"hello".toUpperCase()`, you do not modify the string `"hello"` — you create a new string `"HELLO"` and discard it (unless you assign it). Primitives compare by value: `"hello" === "hello"` is `true` because the values are identical.

Objects are stored once in memory and referenced by their address. Two distinct object literals are not equal even if they look the same:

```js
{} === {}            // false — two different objects, two different references
const a = {}; const b = a; a === b   // true — same reference
```

This is the same model as Python's `==` versus `is`, or Java's `.equals()` versus `==`. JavaScript's `===` is closer to Java's `==`: it checks reference identity for objects, value equality for primitives.

---

## 3. The seven falsy values

> **Every JavaScript value is either truthy or falsy. The falsy ones are a memorizable list. Everything else — every non-empty string, every non-zero number, every object including `[]` and `{}` — is truthy.**

The falsy values, per ECMA-262 §7.1.2 (the `ToBoolean` abstract operation):

1. `false`
2. `0`
3. `-0` *(technically distinct from `0` but coerces to the same boolean)*
4. `0n` *(the BigInt zero)*
5. `""` *(the empty string)*
6. `null`
7. `undefined`
8. `NaN`

That is the entire list. Memorize it.

The most-tripped-on items:

- `"0"` is **truthy**. It is a non-empty string. The fact that it would parse to `0` is irrelevant; `ToBoolean` does not call `ToNumber`.
- `"false"` is **truthy**. It is a non-empty string. Strings are not parsed.
- `[]` is **truthy**. It is an object. Length zero, but still an object reference.
- `{}` is **truthy**. Same reason.

The truthiness of `[]` and `{}` is the canonical bug-source for developers coming from Python (where empty containers are falsy) or PHP (where `"0"` is falsy). JavaScript is not those languages.

### The five places truthiness shows up

Per ECMA-262 §13.10.1 and following, `ToBoolean` is called in these positions:

1. The condition of an `if` statement.
2. The condition of a `while`, `do...while`, or `for` loop.
3. The condition of the ternary `?:` operator.
4. The operand of the logical NOT (`!`) operator.
5. The operands of `&&` and `||` (short-circuit evaluation).

Anywhere else, no implicit `ToBoolean` happens. `0 + true` is `1` (because `ToNumber(true)` is `1`), but `if (x) {}` calls `ToBoolean(x)`.

---

## 4. `==` versus `===` — strict versus abstract equality

> **The rule, stated up front: prefer `===`. Reach for `==` only when you want to treat `null` and `undefined` as equivalent. Some style guides ban `==` entirely; that is a reasonable position.**

### `===` (strict equality, §7.2.16)

Returns `true` if and only if:

1. Both operands have the same type, AND
2. Both operands have the same value.

With two exceptions worth noting:

- `NaN === NaN` is `false`. `NaN` is the only value in the language not equal to itself. To check for `NaN`, use `Number.isNaN(x)`.
- `+0 === -0` is `true`, even though they are technically distinct in the spec. To distinguish them, use `Object.is(+0, -0)`, which returns `false`.

### `==` (abstract equality, §7.2.15)

Performs type coercion before comparing. The full algorithm is twelve numbered steps. The cases that bite:

```js
0 == ''           // true  — both coerce to 0 via ToNumber
0 == '0'          // true  — '0' coerces to 0
'' == '0'         // false — both are strings, compared as strings, '' !== '0'
0 == false        // true  — false coerces to 0
null == undefined // true  — special case in the algorithm (step 2)
null == 0         // false — null is only loosely equal to undefined
[] == false       // true  — [] coerces via ToPrimitive to '', then to 0
[] == ![]         // true  — !` is true→false→0; [] is ''→0; 0==0
```

The last one — `[] == ![]` — is the canonical reason to avoid `==`. It is not a bug. The spec defines exactly this behavior. It is also useless behavior to actually want.

### The one case for `==`: nullish checks

```js
if (value == null) {
  // value is null OR undefined
}
```

This is shorter than `value === null || value === undefined`. Many style guides allow it. Most teams that ban `==` add an exception for this pattern. (Or they reach for the **nullish coalescing operator** `??`, introduced in ES2020, which we will see Tuesday.)

---

## 5. Variables — `var`, `let`, `const`

JavaScript has three keywords for declaring a variable. The choice between them is no longer a style question; the spec defines them with different scope rules, different hoisting behavior, and different mutability.

### `const` — your default

```js
const PI = 3.14159;
const user = { name: 'Ada' };
```

A `const` binding cannot be reassigned. The value it points to **can** be mutated if it is an object:

```js
const user = { name: 'Ada' };
user.name = 'Grace';   // legal: mutating the object
user = { name: 'Grace' };  // TypeError: assignment to constant
```

`const` is **block-scoped** (the block being any `{}` — an `if`, a `for`, a function body, a bare block). It is hoisted in the sense that the binding is known to its scope before the declaration line, but accessing it before the `const` line throws `ReferenceError` (the **temporal dead zone**, §13.3.1).

### `let` — when you must reassign

```js
let count = 0;
count = count + 1;     // legal
```

`let` is also block-scoped and also has a temporal dead zone. It exists for the cases where `const` will not do — loop counters, accumulator variables, values that genuinely change.

A reasonable rule: **declare with `const`. If the linter or the type checker tells you it needs to be `let`, change it.** This trains the habit of immutability-first.

### `var` — for reading legacy code

```js
var legacy = 1;
```

`var` is **function-scoped**, not block-scoped. A `var` declared inside an `if` block leaks out of the block:

```js
if (true) {
  var x = 1;
}
console.log(x);  // 1 — x escaped the block
```

`var` is also hoisted with an initial value of `undefined` — meaning you can reference it before the declaration line and get `undefined` rather than `ReferenceError`. This is the famous "hoisting" behavior; it confuses every learner; it is also why `let` and `const` exist.

You will read `var` in legacy code. Do not write it.

---

## 6. The browser console — your REPL all week

Open DevTools (`Cmd+Option+J` / `Ctrl+Shift+J`). The Console panel is a **REPL** — read, evaluate, print, loop. Every line you type runs immediately in the page's JavaScript environment. The console has been there since DevTools shipped; it is the most under-used tool in a frontend developer's belt.

```text
┌──────────────────────────────────────────────────┐
│ ●●●    https://example.test/                     │
├──────────────────────────────────────────────────┤
│                                                  │
│   Console                                        │
│   > 1 + 1                                        │
│   < 2                                            │
│   > typeof null                                  │
│   < 'object'                                     │
│   > [1, 2, 3].map(n => n * 2)                    │
│   < (3) [2, 4, 6]                                │
│   >                                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

Things you can type:

- Any expression: `2 + 2`, `'hello'.toUpperCase()`, `[1,2,3].reduce((a,b) => a+b)`.
- Any statement: `const x = 5;`. (Console-declared variables persist for the page's lifetime.)
- A function declaration. Then call the function from the next line.
- A breakpoint via `debugger;` in your script — the console pauses execution and lets you walk the call stack.

This week, treat the console as your scratchpad. Every assertion in this lecture, type it into the console and watch the result.

---

## 7. Control flow

JavaScript has the control-flow statements you would expect from a C-family language, with a couple of additions.

### `if` / `else if` / `else`

```js
if (user.age >= 18) {
  console.log('adult');
} else if (user.age >= 13) {
  console.log('teen');
} else {
  console.log('child');
}
```

The condition is evaluated through `ToBoolean`. Per the falsy-value list above, `if (0)` is `false`, `if ([])` is `true`, and so on.

### The ternary `?:`

```js
const label = user.age >= 18 ? 'adult' : 'minor';
```

A ternary is an **expression**, not a statement; it returns a value. Use it for short binary choices. Avoid nesting ternaries more than one deep; readers will thank you.

### `switch`

```js
switch (status) {
  case 'pending':
    return 'In progress';
  case 'shipped':
  case 'delivered':
    return 'On its way or here';
  default:
    return 'Unknown';
}
```

`switch` uses `===` for case comparison (per §14.12.4), so the type matters. Fall-through is allowed when you omit `break`; it is a common bug-source. Use `switch` when you have three or more discrete values to dispatch on; a chain of `if/else if` is fine for two or three.

### Short-circuit evaluation

```js
const name = user.displayName || 'Anonymous';     // logical OR
const port = config.port ?? 3000;                  // nullish coalescing
user.isAdmin && deletePost(post);                  // logical AND as a guard
```

- `||` returns the first truthy operand, else the last.
- `&&` returns the first falsy operand, else the last.
- `??` (ES2020) returns the first operand that is not `null` or `undefined`. Useful when `0` and `""` are valid values you do not want to fall through.

The difference between `||` and `??` matters. `0 || 'default'` returns `'default'` (because `0` is falsy). `0 ?? 'default'` returns `0` (because `0` is not nullish).

---

## 8. Loops

### `for` — the C-style loop

```js
for (let i = 0; i < items.length; i++) {
  console.log(items[i]);
}
```

Three parts: initializer, condition, update. Useful when you need the index, or when you are walking a sparse array, or when you need to break partway through.

### `for...of` — iterating values

```js
for (const item of items) {
  console.log(item);
}
```

Iterates the **values** of any iterable (arrays, strings, maps, sets, generators). The cleanest loop for "do something with each item." Pair it with `entries()` if you also need the index: `for (const [i, item] of items.entries())`.

### `for...in` — iterating keys (use sparingly)

```js
for (const key in object) {
  console.log(key, object[key]);
}
```

Iterates the **enumerable string-keyed properties** of an object, including inherited ones. The order is implementation-defined for older code (though modern engines now follow a defined order per §7.3.22). Avoid `for...in` on arrays — it iterates string keys in implementation order, which is not the same as iterating indices in numeric order.

### `while` and `do...while`

```js
while (queue.length > 0) {
  process(queue.shift());
}
```

`while` for "repeat until done." `do...while` for "do once, then repeat." Both rare in practice; `for...of` covers most cases.

### Array methods — often a better loop

Modern JavaScript prefers the higher-order array methods over `for` loops for transformation. We cover these in detail next week, but the headlines:

```js
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);
numbers.forEach(n => console.log(n));
```

`map`, `filter`, `reduce`, and `forEach` are the "for loop replacements" you will write daily. They are spec methods (§23.1.3), not syntactic sugar.

---

## 9. Functions — the three forms

Per §15, JavaScript has three syntactic forms for a function. They behave differently in three respects: **hoisting**, **`this` binding**, and the presence of an **`arguments`** object.

### Form 1 — function declaration

```js
function greet(name) {
  return `Hello, ${name}`;
}
```

A function declaration is **hoisted** to the top of its enclosing function or module scope, **with its body**. You can call it before the line where it appears:

```js
greet('Ada');   // 'Hello, Ada' — works!

function greet(name) {
  return `Hello, ${name}`;
}
```

This is the only form where the body is hoisted, not just the name.

### Form 2 — function expression

```js
const greet = function (name) {
  return `Hello, ${name}`;
};
```

A function expression is **assigned**, not hoisted. You can only call it after the line where it is assigned. The function itself may or may not be named (`const greet = function greet(name) { ... }`); a named expression is useful only for recursion within the function or for stack-trace clarity.

### Form 3 — arrow function expression

```js
const greet = (name) => `Hello, ${name}`;
const add = (a, b) => a + b;
const noop = () => {};
const wrapper = () => ({ key: 'value' });  // parens around object literal!
```

Arrow functions are expressions, like Form 2 — not hoisted. They differ from Form 2 in three ways:

1. **No `this` of their own.** An arrow function inherits `this` from the surrounding lexical scope. This is the single most useful property of arrows: a callback inside a class method or an event handler no longer needs `.bind(this)`.
2. **No `arguments` object.** Use rest parameters (`...args`) instead.
3. **Cannot be used as constructors.** `new (() => {})()` throws `TypeError`.

The shorthand body — `(name) => name.toUpperCase()` — implicitly returns the expression. With a block body, you must write `return` explicitly: `(name) => { return name.toUpperCase(); }`.

### Which form when

A reasonable rule:

- **Methods on objects and classes** — declarations or shorthand methods. `class Foo { greet() {} }`.
- **Top-level utilities** — declarations, so they hoist if a callsite appears earlier in the file.
- **Callbacks** — arrows. The single-expression syntax is unbeatable, and the lexical `this` is usually what you want.
- **Long arrows with side effects** — promote to a declaration. Readability beats brevity.

---

## 10. The call stack

Every function call pushes a **stack frame** onto the call stack — a small record of where the call came from, what its local variables are, and where to return when it finishes. When the function returns (or throws), its frame pops.

```js
function outer() {
  return inner();
}
function inner() {
  return 42;
}

outer();
```

The call stack at the moment `inner` returns:

```text
   ┌──────────────────┐
   │ inner()          │  ← top of stack
   ├──────────────────┤
   │ outer()          │
   ├──────────────────┤
   │ <global>         │  ← bottom
   └──────────────────┘
```

When `inner` returns `42`, its frame pops. Control returns to `outer`, which returns `42` to the global frame. The stack empties.

You will see this stack in DevTools. Set a `debugger;` statement in any function; the Sources panel shows the live stack on the right. Open it now if you are reading this on a laptop. Walk it. The stack is not a metaphor.

The stack also has a limit. Recursive functions without a base case hit `Maximum call stack size exceeded` — typically around 10,000 frames in V8. (Per the spec, the limit is implementation-defined; per the browser, it is around 10–15 thousand.)

---

## 11. The accessibility check, integrated

JavaScript itself is not directly accessible or inaccessible — but the patterns you write with it have accessibility consequences. Three things to keep in mind this week, before we cover the DOM next week:

### 1. The page must work without JavaScript

Per WCAG 2.2 SC 4.1.2 (Name, Role, Value), every interactive control must have an accessible name and role. The HTML you wrote in Week 1 already provides this. Do not replace `<button>` with `<div onclick>` "to remove the default styling." The default styling is removable with CSS; the accessibility is removable with JavaScript, and removing it is a regression.

### 2. Focus must remain visible after JS runs

If your JavaScript moves focus (`element.focus()`), the focus must be visible to a sighted keyboard user. The `:focus-visible` rule you wrote in Week 2 handles this for native controls; for custom controls (Week 5), you will write the rule explicitly.

### 3. Time-sensitive JS must respect user preference

If your JavaScript animates anything (a list reorder, a transition, a toast), it should respect `prefers-reduced-motion`. We cover the JavaScript side of this in Week 9; the CSS side you wrote in Week 2.

---

## 12. Self-check

Without re-reading:

1. Name the eight ECMAScript types.
2. List the seven falsy values.
3. What does `typeof null` return, and why?
4. The rule for choosing between `==` and `===`, in one sentence.
5. Which variable declaration is your default, and why?
6. What is the temporal dead zone?
7. Name the three forms of a function, and the property that distinguishes them most.
8. Why does an arrow function not have its own `this`?

If you missed two or more, re-read the section. If you missed zero, type each answer into the console as a one-liner and verify.

---

## Further reading

- **ECMA-262 — §6 Types**: <https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values>
- **ECMA-262 — §7.1.2 ToBoolean**: <https://tc39.es/ecma262/#sec-toboolean>
- **ECMA-262 — §7.2.15 IsLooselyEqual** (the `==` algorithm): <https://tc39.es/ecma262/#sec-islooselyequal>
- **ECMA-262 — §7.2.16 IsStrictlyEqual** (the `===` algorithm): <https://tc39.es/ecma262/#sec-isstrictlyequal>
- **MDN — Equality comparisons and sameness**: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness>
- **You Don't Know JS Yet — Get Started**: <https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/get-started>

Next: [Lecture 2 — Scope, Closures, and Modules](./02-scope-closures-and-modules.md).
