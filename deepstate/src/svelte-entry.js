// src/core.js uses @preact/signals-core
import { computed, signal, untracked } from "@preact/signals-core";
import { createDeepStateAPIv2 } from "./common.js";

const { shallow, reify } = createDeepStateAPIv2({
  signal,
  computed,
  untracked,
  batch,
});

// Re-export them
export { reify, shallow };
