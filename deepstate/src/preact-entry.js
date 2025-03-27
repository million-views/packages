// src/preact-entry.js
import { computed, signal, untracked } from "@preact/signals";
import { createDeepStateAPI } from "./common.js";

const { shallow, reify, computedProp } = createDeepStateAPI({
  signal,
  computed,
  untracked,
});
export { computedProp, reify, shallow };
