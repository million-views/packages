import { effect } from "@preact/signals-core";
import { reify } from "@m5nv/deepstate/core";

/// Quick Sanity Test
/// Run as:
/// 1. DEEPSTATE_MODE=SPA node src/test.js
/// 2. DEEPSTATE_MODE=SSR node src/test.js
///
/// The behaviours are different in each mode. Read the README.md
/// for more details.
const { state: counter } = reify(
  { count: 0, double: (self) => self.count * 2 },
);

// check that we received a reified state
console.log(counter);

// Lazy computation triggers on access: Logs 0
console.log("Initial:", counter.double);

// Despite updating the `count` signal on which the `double` signal depends,
// `double` does not yet update because nothing has used its value. In a terminal
// environment, we can't really know that.
counter.count = 1;

// Reading the value of `double` triggers it to be re-computed:
console.log("not-from-effect: ", counter.double); // Logs: 2

// this effect will leak on exit
effect(() => console.log("in-effect: ", counter.double));
effect(() => console.log("in-effect-to-triple: ", counter.count * 3));
console.log("not-from-effect: ", counter.double); // Logs: 2 because counter.count has not changed

// the effect should run now
counter.count += 1;

//--------
const { state: demo } = reify(
  {
    name: "Jane",
    surname: "Doe",
    fullName: (self) => `${self.name} ${self.surname}`,
  },
);

// Logs name every time it changes:
const dispose = effect(() => console.log(demo.fullName));
// Logs: "Jane Doe"

// Updating `name` updates `fullName`, which triggers the effect again:
demo.name = "John";
// Logs: "John Doe"

// demo destructure loses reactivity; this does nothing.
let { name } = demo;
name = "Mary";

// if you want to maintain reactivity after destructuring, access the
// underlying signal in your destructuring by prefixing the signal name with `$`
let { $name } = demo;

// this will run the effect again since we are reading a signal's value
$name.value = "Mary"; // should produce a log output

// Destroy effect and subscriptions:
dispose();

// Updating `name` does not run the effect because it has been disposed.
// It also doesn't re-compute `fullName` now that nothing is observing it.
$name.value = "John"; // should not produce a log output

// Just to test that the other effect still runs but not the demo effect
counter.count += 1; // should produce a log output

// wait for all effects to run; not required but just to be sure.
await new Promise((resolve) => setTimeout(resolve, 250));
