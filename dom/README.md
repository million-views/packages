# Dom (@m5nv/dom)

**A nano‑jQuery–like DOM manipulation library for evergreen browsers.**

---

## Overview

@m5nv/dom is a zero‑dependency library that wraps most commonly used native DOM
APIs in a chainable, jQuery‑like fluent API. Event binding, class manipulation
(add, remove, toggle, has), attribute handling, CSS styling, and DOM traversal
can be achieved with much less code without loss of performance or code
comprehension.

### Why

The [Document Object Model][dom] is like a castle. You might know it exists and
have _seen_ it in action using your favorite frameworks. The hard truth is you
don't know it well enough until you explore it on your own.

Frameworks are like tour buses with tour guides—they keep you on the trodden
path. On the flip side, exploring the DOM using its API can get tiring. You know
the roads to take to get to the parts of the DOM you want to interact with—up
close. This library is designed to be your bicycle, helping you get there faster
without the baggage or the guardrails offered by frameworks.

[dom]: https://en.wikipedia.org/wiki/Document_Object_Model

## Concepts

### Selectors

A **selector** in @m5nv/dom is a value used to specify which DOM elements to
wrap into a chainable collection. The library supports several types of
selectors:

- **CSS Selectors (String):**\
  Pass a CSS selector string (e.g., `"#myId"`, `".my-class"`, `"div > p"`) to
  internally use `document.querySelectorAll` to select elements.

- **DOM Node:**\
  Pass a single DOM node (e.g., the result of `document.getElementById("myId")`)
  to wrap that specific element.

- **NodeList or Array of Nodes:**\
  Pass a NodeList (e.g., from `document.querySelectorAll`) or an array of DOM
  nodes, and each node will be wrapped.

- **Global Objects:**\
  Pass the global `window` or `document` objects to work with them directly.

By abstracting selectors, @m5nv/dom enables you to interact with any set of
elements in a consistent, chainable way.

## Features

- **Minimal Footprint:**\
  Minimal code with no loss in performance.

- **Chainable API:**\
  Write fluent code that reads naturally—no more nesting callbacks or cumbersome
  syntax.

## Installation

### npm

```bash
npm install @m5nv/dom
```

## Usage

Import the default export (recommended aliases: `$` or `dom`):

```js
import $ from "@m5nv/dom";
```

### Example: Selecting Elements & Event Binding

```js
// Bind a click event to a button
$("#myButton").on("click", () => console.log("Button clicked!"));

// Toggle a class on an element
$("#myPanel").toggleClass("active");
```

## Equivalence Examples

### 1. Element Selection & Event Binding

**Native DOM:**

```js
const btn = document.getElementById("myButton");
btn.addEventListener("click", () => console.log("Clicked!"));
```

**@m5nv/dom:**

```js
$("#myButton").on("click", () => console.log("Clicked!"));
```

### 2. Class Manipulation

**Native DOM:**

```js
document.querySelector(".item").classList.add("active");
document.querySelector(".item").classList.toggle("active");
const has = document.querySelector(".item").classList.contains("active");
```

**@m5nv/dom:**

```js
$(".item").addClass("active");
$(".item").toggleClass("active");
const has = $(".item").hasClass("active");
```

### 3. DOM Traversal

**Native DOM:**

```js
const parent = document.getElementById("child").parentNode;
```

**@m5nv/dom:**

```js
$("#child").parent();
```

## API Reference

When you call `dom(selector)`, you receive an object with the following methods:

### Selection & Traversal

- **`dom(sel)`**\
  Wraps a CSS selector, DOM node, or NodeList into a chainable object.

- **`find(selector)`**\
  Returns a new wrapped collection of descendant elements.

- **`closest(selector)`**\
  Returns the nearest ancestor matching the selector.

- **`next()`**\
  Returns the next sibling element.

- **`parent()`**\
  Returns the parent node.

### Event Binding

- **`on(event, callback)`**\
  Binds an event listener to all selected elements.

### Iteration

- **`each(callback)`**\
  Iterates over each element, passing `(index, element)` to the callback.

### Class Manipulation

- **`addClass(className)`**\
  Adds the specified class to all elements.

- **`removeClass(className)`**\
  Removes the specified class from all elements.

- **`toggleClass(className)`**\
  Toggles the class on all elements.

- **`hasClass(className)`**\
  Returns a boolean indicating if the first element has the specified class.

### Attributes & CSS

- **`attr(name, value?)`**\
  Gets or sets an attribute. (If `value` is omitted, returns the attribute on
  the first element.)

- **`css(property, value)`**\
  Sets an inline CSS style on all elements.

## Contributing

Contributions to improve @m5nv/dom are welcome. Please submit issues or pull
requests on our GitHub repository.

## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.

---

Happy DOM-ing!
