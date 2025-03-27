// src/react-entry.js
import { computed, signal, untracked } from "@preact/signals-react";
import { createDeepStateAPI } from "./common.js";
const { shallow, reify, computedProp } = createDeepStateAPI({
  signal,
  computed,
  untracked,
});
export { computedProp, reify, shallow };
