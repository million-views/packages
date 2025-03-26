<script module>
  import { writable } from 'svelte/store';
  import { reify } from '@m5nv/deepstate/core'; // for Svelte/CLI environment

  export function createDeepStateStore(
    initial,
    computedFns,
    permissive = false,
  ) {
    const { state, attach } = reify(initial, computedFns, permissive);
    const { subscribe, set } = writable(state);
    const actions = {};

    function attachWithUpdate(newActions) {
      // Wrap each action so that after it runs, we trigger an update.
      for (const key in newActions) {
        actions[key] = (...args) => {
          const result = newActions[key](state, ...args);
          set(state); // trigger Svelte reactivity
          return result;
        };
      }
      attach(actions);
      return { subscribe, actions };
    }

    return { subscribe, attach: attachWithUpdate };
  }
</script>

<script>
  // Create a deep state store. Note: escape hatch prefix is configured (say "_")
  const deepStore = createDeepStateStore(
    { count: 0 },
    { double: (s) => s.count * 2 },
    false,
  ).attach({
    on_click: (state) => {
      console.log(state.count, state.double);
      state.count++;
    },
  });
</script>

<h1>Welcome to SvelteKit</h1>
<!-- Bind the store's value to an input. Svelte reactivity works via $deepStore -->
<input type="number" bind:value={$deepStore.count} />
<button on:click={deepStore.actions.on_click}>count</button>
<h3>Is it working?</h3>
<code>{$deepStore.count} * 2 = {$deepStore.double}</code>
