// src/core.js uses @preact/signals-core
import { computed, signal, untracked } from "@preact/signals-core";
import { createDeepStateAPI } from "./common.js";

// Create the DeepState API using signals-core
const { shallow, reify } = createDeepStateAPI({
  signal,
  computed,
  untracked,
});

// Re-export them
export { reify, shallow };
