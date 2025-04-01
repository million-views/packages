// src/react-entry.js
import { batch, computed, signal, untracked } from "@preact/signals-react";
import { createDeepStateAPIv2 } from "./common.js";

const { shallow, reify } = createDeepStateAPIv2({
  signal,
  computed,
  untracked,
  batch,
});

// Re-export them
export { reify, shallow };
