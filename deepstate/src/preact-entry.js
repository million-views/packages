// src/preact-entry.js
import { computed, signal, untracked } from "@preact/signals";
import { createDeepStateAPI } from "./common.js";

const { shallow, reify } = createDeepStateAPI({
  signal,
  computed,
  untracked,
});
export { reify, shallow };
