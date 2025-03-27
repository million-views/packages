// src/core.js uses @preact/signals-core
import { computed, signal, untracked } from "@preact/signals-core";
import { createDeepStateAPI } from "./common.js";

// Create the DeepState API using signals-core
const { shallow, reify, computedProp } = createDeepStateAPI({
  signal,
  computed,
  untracked,
}, "_");

// Re-export them
export { computedProp, reify, shallow };
