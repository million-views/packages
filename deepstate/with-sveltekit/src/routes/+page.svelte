<script>
  const state = {
    count: 0,
    double: (state) => state.count * 2,
  };
</script>

<h2>Plain Svelte Reactivity (no runes)</h2>
<input type="number" bind:value={state.count} />
<button onclick={() => (state.count += 1)}>count</button>
<h3>Is it working?</h3>
<code>{state.count} * 2 = {state.double(state)}</code>
<br />

<p>
  Svelte provides fine grained reactivity by itself, even without having to use
  runes. In this example, we can see that a plain object can be used without
  much fuss to obtain "reactivity"; the only bit of twiddling we had to do was
  to call the computed function instead of accessing it as a variable.
</p>
