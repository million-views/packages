<script module>
  import { writable } from 'svelte/store';
  import { reify } from '@m5nv/deepstate/svelte'; // for Svelte/CLI environment

  export function createDeepStateStore(initial, permissive = false) {
    const { state, attach } = reify(initial, { permissive });
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
  const deepStore = createDeepStateStore({
    count: 0,
    double: (s) => s.count * 2,
  }).attach({
    on_click: (state) => {
      console.log(state.count, state.double);
      state.count++;
    },
  });
</script>

<h2>Naive Svelte Store</h2>
<!-- Bind the store's value to an input. Svelte reactivity works via $deepStore -->
<input type="number" bind:value={$deepStore.count} />
<button on:click={deepStore.actions.on_click}>count</button>
<h3>Is it working?</h3>
<code>{$deepStore.count} * 2 = {$deepStore.double}</code>

<p>
  Mutations that happen using deepstate's actions do not trigger reactivity in
  svelte (for complex reasons in how Svelte itself tries to do reactivity). This
  is a naive attempt to get back reactivity by wrapping deepstate in a writable
  to make Svelte understand that an action mutated the state.
</p>
<hr />
<ul>
  <li>
    Notice that two way binding doesn't work. That's because we are unable to
    expose a set method on the store effectively making it a readable (for
    svelte)
  </li>
  <li>Don't use this - it's broken.</li>
</ul>
