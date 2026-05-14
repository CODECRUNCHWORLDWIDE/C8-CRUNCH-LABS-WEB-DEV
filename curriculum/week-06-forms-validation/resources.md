# Week 6 — Resources

Every resource here is **free** and **publicly accessible**.

## Primary sources

- **WHATWG HTML Living Standard — §4.10 Forms** — the normative spec for the `<form>` element and every form-associated control. The one source of truth when a browser surprises you. <https://html.spec.whatwg.org/multipage/forms.html>
- **HTML Living Standard — §4.10.5 The `input` element** — every input type, the attributes each accepts, the validity flags each produces. <https://html.spec.whatwg.org/multipage/input.html>
- **HTML Living Standard — §4.10.18 Form control infrastructure** — the abstract behaviors every control inherits: mutability, the value sanitization algorithm, default value, dirty value. <https://html.spec.whatwg.org/multipage/form-control-infrastructure.html>
- **HTML Living Standard — §4.10.18.7 Autofill** — the canonical list of `autocomplete` tokens and the rules the browser follows when filling. <https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill>
- **HTML Living Standard — §4.10.21 Constraints** — the Constraint Validation API in normative form: `ValidityState`, `checkValidity`, `reportValidity`, the submission algorithm. <https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints>
- **W3C WAI-ARIA 1.2 — §6.6.7 `aria-invalid`** — the normative definition of the state every invalid form control should carry. <https://www.w3.org/TR/wai-aria-1.2/#aria-invalid>
- **W3C WAI-ARIA 1.2 — §6.6.6 `aria-errormessage`** — the newer alternative to `aria-describedby` for error association. <https://www.w3.org/TR/wai-aria-1.2/#aria-errormessage>
- **W3C Web Content Accessibility Guidelines (WCAG) 2.2 — §3.3 Input Assistance** — the testable Success Criteria for forms. Six criteria, each one a one-page Understanding document. <https://www.w3.org/WAI/WCAG22/Understanding/input-assistance>

## MDN reference (the friendly index)

- **MDN — HTML forms guide** — the friendly tour. Start here if the spec sections above are too dense. <https://developer.mozilla.org/en-US/docs/Learn/Forms>
- **MDN — `<form>`** — every attribute on the form element. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form>
- **MDN — `<input>`** — the long index of every input type with examples. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input>
- **MDN — `<input type="email">`** — the type-by-type pages are excellent. Read at least `email`, `tel`, `url`, `number`, `date`, `password`, and `search`. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email>
- **MDN — `<label>`** — the labeling element. Read the "Accessibility concerns" section twice. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label>
- **MDN — `<fieldset>`** — the grouping element. Required for radio groups. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset>
- **MDN — Client-side form validation** — the friendly tutorial on the Constraint Validation API. <https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation>
- **MDN — `ValidityState`** — every flag, with examples. <https://developer.mozilla.org/en-US/docs/Web/API/ValidityState>
- **MDN — `HTMLFormElement.checkValidity()`** — the method that runs the constraints. <https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/checkValidity>
- **MDN — `HTMLInputElement.setCustomValidity()`** — register a custom validity message that integrates with the platform. <https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity>
- **MDN — `FormData`** — read a form's entries as iterable key-value pairs. <https://developer.mozilla.org/en-US/docs/Web/API/FormData>

## Labeling and grouping

- **MDN — Labels and form-control accessibility** — every labeling option with the screen-reader implications. <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#accessibility_concerns>
- **WebAIM — Creating accessible forms** — the canonical practical guide. Read in full once; bookmark for reference. <https://webaim.org/techniques/forms/>
- **WebAIM — Advanced form labeling** — when `<label>` is not enough: `aria-labelledby`, `aria-describedby`, group labels. <https://webaim.org/techniques/forms/advanced>
- **GOV.UK Design System — Form labels** — a battle-tested specification from a government accessibility team. Their guidance is conservative and correct. <https://design-system.service.gov.uk/components/text-input/>
- **Inclusive Components — Inclusive Inputs by Heydon Pickering** — every input type, with the accessibility trade-offs of each. <https://inclusive-components.design/>

## HTML5 constraint validation

- **MDN — Constraint validation** — the JS interface around the HTML5 constraint attributes. <https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation>
- **MDN — `:valid` and `:invalid`** — the CSS pseudo-classes for the constraint state. <https://developer.mozilla.org/en-US/docs/Web/CSS/:valid>
- **MDN — `:user-valid` and `:user-invalid`** — the newer pseudo-classes (shipped in every browser since 2023) that only match after the user has interacted. The fix for the "form is red before the user has typed anything" UX bug. <https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid>
- **MDN — `:required` and `:optional`** — pseudo-classes that match by attribute, not by state. <https://developer.mozilla.org/en-US/docs/Web/CSS/:required>
- **MDN — `pattern` attribute** — the regex constraint. <https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern>
- **MDN — `inputmode` attribute** — the soft-keyboard hint. Not a constraint, but adjacent: tells touch keyboards which key set to show. <https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode>

## Error messaging and the accessibility model

- **W3C WAI Tutorials — Form validation errors** — the canonical tutorial on accessible error messaging. <https://www.w3.org/WAI/tutorials/forms/notifications/>
- **WAI-ARIA Authoring Practices — Form patterns** — the patterns for grouped controls, comboboxes, and error summaries. <https://www.w3.org/WAI/ARIA/apg/patterns/>
- **GOV.UK Design System — Error summary** — the canonical pattern for an error summary at the top of a form. Battle-tested in production. <https://design-system.service.gov.uk/components/error-summary/>
- **GOV.UK Design System — Error message** — single-field error messaging. <https://design-system.service.gov.uk/components/error-message/>
- **Sara Soueidan — A guide to designing accessible, WCAG-conformant focus indicators** — the focus-on-error pattern in depth. <https://www.sarasoueidan.com/blog/focus-indicators/>
- **Sara Soueidan — A guide to accessible form validation** — comprehensive walkthrough; covers `aria-invalid`, `aria-describedby`, `aria-errormessage`, live regions, and timing. <https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/>
- **TPGi — Short note on the difference between `aria-describedby` and `aria-errormessage`** — when to use which. <https://www.tpgi.com/short-note-on-aria-errormessage/>
- **Adrian Roselli — Avoid `aria-errormessage`** — a counterpoint with browser-support details. Read alongside the TPGi note. <https://adrianroselli.com/2023/05/avoid-aria-errormessage.html>

## Autofill

- **MDN — `autocomplete` attribute** — every token, with the field types each one applies to. <https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete>
- **HTML Living Standard — Autofill token list** — the normative list (the source of MDN's table). <https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill-field>
- **Chrome — Help users get the most out of autofill** — the implementation guide from the browser team. Pragmatic and concrete. <https://web.dev/learn/forms/autofill>
- **Apple — Enabling password autofill on an HTML input element** — Safari's password-autofill rules. Especially relevant for `new-password` versus `current-password`. <https://developer.apple.com/documentation/security/password_autofill/enabling_password_autofill_on_an_html_input_element>

## Submission and `FormData`

- **MDN — `SubmitEvent`** — the event the form fires; carries the `submitter` property for forms with multiple submit buttons. <https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent>
- **MDN — `FormData`** — the iterable key-value pair interface for a form's entries. <https://developer.mozilla.org/en-US/docs/Web/API/FormData>
- **MDN — `FormDataEvent`** — the event for synthesizing or rewriting submitted data. Less common, but worth knowing exists. <https://developer.mozilla.org/en-US/docs/Web/API/FormDataEvent>

## Multi-step and progress patterns

- **GOV.UK Design System — Multi-step forms (the "service pattern")** — the canonical multi-step shape, with focus management and error patterns. <https://design-system.service.gov.uk/patterns/gather-information/>
- **NN/g — Web form design** — Nielsen Norman Group's research-backed form guidelines. <https://www.nngroup.com/articles/web-form-design/>
- **Adam Silver — Form Design Patterns** — a book on form design. The free chapters on "A Registration Form" and "An Inbox" are excellent. <https://www.smashingmagazine.com/printed-books/form-design-patterns/>
- **WAI-ARIA Authoring Practices — `aria-current`** — the way to indicate "current step" in a multi-step process. <https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/>

## WCAG (the testable criteria)

- **WCAG 2.2 — Quick Reference** — the filterable index. Filter by Guideline 3.3 (Input Assistance). <https://www.w3.org/WAI/WCAG22/quickref/>
- **WCAG 2.2 — Success Criterion 1.3.1 Info and Relationships** — the structural criterion that requires every input have a programmatic label. Level A. <https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html>
- **WCAG 2.2 — Success Criterion 1.3.5 Identify Input Purpose** — every input collecting user information has a programmatically determinable purpose. Use `autocomplete` to satisfy this. Level AA. <https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html>
- **WCAG 2.2 — Success Criterion 3.3.1 Error Identification** — if an input error is automatically detected, the item in error is identified and the error is described to the user. Level A. <https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html>
- **WCAG 2.2 — Success Criterion 3.3.2 Labels or Instructions** — labels or instructions are provided when content requires user input. Level A. <https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html>
- **WCAG 2.2 — Success Criterion 3.3.3 Error Suggestion** — if an input error is detected and suggestions for correction are known, the suggestions are provided to the user. Level AA. <https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html>
- **WCAG 2.2 — Success Criterion 3.3.4 Error Prevention (Legal, Financial, Data)** — for pages that cause legal commitments, financial transactions, or modifications to user-controllable data, the submission is reversible, checked, or confirmable. Level AA. <https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html>
- **WCAG 2.2 — Success Criterion 3.3.7 Redundant Entry** — new in 2.2: information previously entered in the process is either auto-populated or available for selection. Level A. <https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html>
- **WCAG 2.2 — Success Criterion 3.3.8 Accessible Authentication (Minimum)** — new in 2.2: no cognitive function test is required for authentication unless an alternative is available. Level AA. <https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html>
- **WCAG 2.2 — Success Criterion 4.1.2 Name, Role, Value** — every form control has a programmatically determinable name, role, and value. Level A. <https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html>

## Talks and longer reads

- **"Designing better inline validation UX" — Mihael Tomić** — pragmatic UX research on when to validate (on blur, on submit, never on every keystroke). <https://uxmovement.com/forms/why-inline-validation-is-the-form-validation-of-choice/>
- **"The problem with `aria-required`" — Steve Faulkner** — short note on why `required` is usually enough and `aria-required` is rarely the right addition. <https://www.tpgi.com/required-attribute-requirements/>
- **"Inline validation is broken" — Adam Silver** — a critique of the "validate after every keystroke" pattern. The case for validating on blur. <https://adamsilver.io/blog/inline-validation-is-problematic/>
- **"Form fields should not be marked required by default" — Adam Silver** — short, opinionated, correct. <https://adamsilver.io/blog/form-fields-should-not-be-marked-as-required-by-default/>
- **"How to report errors in forms: 10 design guidelines" — NN/g** — research-backed; ten short rules. <https://www.nngroup.com/articles/errors-forms-design-guidelines/>
- **"Why I prefer making accessible websites with anchor tags" — Léonie Watson** — adjacent topic, but the framing on user expectations applies to every form pattern this week. <https://tink.uk/why-i-prefer-making-accessible-websites-with-anchor-tags/>
- **"The browser is a form" — Dave Rupert** — a meditation on how forms are the fundamental unit of the interactive web. <https://daverupert.com/2020/06/the-browser-is-a-form/>

## Testing tools

- **axe DevTools (browser extension)** — automated accessibility audit. Catches missing labels, missing `aria-describedby` on invalid fields, low-contrast errors. <https://www.deque.com/axe/devtools/>
- **WAVE (browser extension)** — WebAIM's visual accessibility checker; good for "where are my errors visually?" <https://wave.webaim.org/extension/>
- **Lighthouse — Accessibility audit** — built into Chrome DevTools; subset of axe. <https://developer.chrome.com/docs/lighthouse/accessibility/>
- **HTML Validator** — paste your HTML or pass a URL; zero errors is the bar. <https://validator.w3.org/nu/>
- **Firefox — Accessibility Inspector** — the best visualization of the accessibility tree. Confirm every input has a name. <https://firefox-source-docs.mozilla.org/devtools-user/accessibility_inspector/>

## Screen readers (all free)

- **Apple — VoiceOver getting-started guide** — the macOS / iOS screen reader. `Cmd+F5` to toggle. <https://support.apple.com/guide/voiceover/welcome/mac>
- **NV Access — NVDA user guide** — open-source Windows screen reader. Download free. <https://www.nvaccess.org/files/nvda/documentation/userGuide.html>
- **Deque University — Screen reader testing keystrokes** — cheat sheet for VoiceOver, NVDA, and JAWS. The "forms mode" keystrokes are essential reading for this week. <https://dequeuniversity.com/screenreaders/>
- **WebAIM — Form-control accessibility cheat sheet** — short, focused on how each screen reader announces each control type. <https://webaim.org/techniques/forms/screen_reader>

## Practice grounds

- **a11y Coffee — Forms** — bite-sized lesson on form accessibility. <https://a11y.coffee/forms/>
- **A11ycasts — Rob Dodson (Google)** — short YouTube series; the "Inert" and "Labels" episodes are relevant. <https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g>
- **The A11y Project — Forms checklist** — a pragmatic single-page checklist. <https://www.a11yproject.com/checklist/>
- **MDN — Test your skills: Forms** — short interactive exercises. <https://developer.mozilla.org/en-US/docs/Learn/Forms/Test_your_skills:_Form_validation>

## Glossary

| Term | One-line definition |
|------|---------------------|
| **Form-associated element** | An element that participates in form submission. Per HTML Living Standard §4.10.18 — `<input>`, `<select>`, `<textarea>`, `<button>`, `<output>`, `<object>`, `<fieldset>`, and custom elements that opt in. |
| **Constraint Validation API** | The platform's interface for validating form fields. Per HTML Living Standard §4.10.21. Includes `ValidityState`, `checkValidity`, `reportValidity`, `setCustomValidity`, and the `invalid` event. |
| **`ValidityState`** | An object on every form control that exposes ten boolean flags — `valueMissing`, `typeMismatch`, `patternMismatch`, `tooShort`, `tooLong`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch`, `badInput`, `customError`. Plus a derived `valid` flag (true when all ten are false). |
| **`setCustomValidity`** | A method on every form control that registers a non-empty error message, setting the `customError` flag. Passing an empty string clears the custom error. |
| **`checkValidity()`** | Returns `true` if every field's `ValidityState.valid` is true; fires an `invalid` event on each field that fails. Does not show the native bubble. |
| **`reportValidity()`** | Same as `checkValidity` plus it triggers the browser's native error bubble on the first invalid field. |
| **`:user-invalid`** | A CSS pseudo-class (shipped in every browser since 2023) that only matches an invalid field *after* the user has interacted with it. The fix for "everything is red when the page loads." |
| **`aria-invalid`** | A WAI-ARIA state on a form control indicating it has an invalid value. Set to `"true"` when invalid; remove or set to `"false"` when valid. |
| **`aria-describedby`** | A WAI-ARIA property pointing to one or more elements whose text describes the current element. Used for the inline error message and any helper text. |
| **`aria-errormessage`** | A newer WAI-ARIA property specifically for the error message. Browser support is incomplete in 2026; prefer `aria-describedby` with `aria-invalid="true"` for now. |
| **Error summary** | A region at the top of a form listing every error, with anchor links to each invalid field. The GOV.UK Design System's canonical pattern. |
| **Live region** | An element with `aria-live` set to `"polite"` or `"assertive"`. Announces changes to assistive technology without focus moving to it. Used for async validation results. |
| **Autofill token** | A value in the `autocomplete` attribute drawn from the HTML Living Standard's normative list — `given-name`, `family-name`, `email`, `tel`, `street-address`, `cc-number`, etc. |
| **`FormData`** | An iterable key-value pair interface constructed from a form (`new FormData(form)`). Iterate with `for (const [key, value] of formData)`. |
| **`SubmitEvent.submitter`** | The button that triggered the submission. Useful when a form has multiple submit buttons with different behaviors. |
| **WCAG SC 3.3.1** | *Error Identification.* If an input error is automatically detected, the item in error is identified and the error is described to the user in text. Level A. |
| **WCAG SC 3.3.2** | *Labels or Instructions.* Labels or instructions are provided when content requires user input. Level A. |
| **WCAG SC 3.3.3** | *Error Suggestion.* If an error is detected and suggestions are known, they are provided to the user. Level AA. |
| **WCAG SC 1.3.5** | *Identify Input Purpose.* The purpose of each input field collecting user information is programmatically determinable — satisfied by the `autocomplete` attribute. Level AA. |
| **The five rules of form labeling** | 1: Every input has a label. 2: The label is visible. 3: The label is programmatically associated. 4: Placeholder text is never the label. 5: Group related controls in a `<fieldset>` with a `<legend>`. |
