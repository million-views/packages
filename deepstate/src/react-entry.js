// src/react-entry.js
import { computed, signal, untracked } from "@preact/signals-react";
import { createDeepStateAPI } from "./common.js";
const { shallow, reify } = createDeepStateAPI({
  signal,
  computed,
  untracked,
});
export { reify, shallow };
