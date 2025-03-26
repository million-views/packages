<script module>
  // deepstateStore.js
  import { writable } from 'svelte/store';
  import { effect } from '@preact/signals-core';
  import { reify } from '@m5nv/deepstate/core';

  export function createSvelteStore(ds) {
    const { state, actions, __version, toJSON } = ds;
    const store = writable(state, (set) => {
      const stop = effect(() => {
        __version.value; // subscribe to changes via __version
        set(state);
      });
      return () => {
        stop();
      };
    });

    return {
      subscribe: store.subscribe,
      set: store.set,
      state,
      actions,
      toJSON,
    };
  }
</script>

<script>
  // Create a deep state store.
  const deepstate = reify(
    { count: 0 },
    { double: (s) => s.count * 2 },
    false,
  ).attach({
    on_click: (state) => {
      console.log(state.count, state.double);
      state.count++;
    },
  });
  const sveltestore = createSvelteStore(deepstate);
</script>

<h2>A better Svelte Store</h2>
<input type="number" bind:value={$sveltestore.count} />
<button on:click={sveltestore.actions.on_click}>count</button>
<h3>Is it working?</h3>
<code>{deepstate.state.count} * 2 = {$sveltestore.double}</code>

<pre>
  {JSON.stringify($sveltestore)}
</pre>

<hr />
<ul>
  <li>Notice that two-way binding <b>works!</b></li>
  <li>
    Fine-grained reactivity is possible by accessing the <i>state</i> property directly.
  </li>
  <li>
    You only need the Svelte store adapter if you want to attach actions to
    DeepState.
  </li>
</ul>
