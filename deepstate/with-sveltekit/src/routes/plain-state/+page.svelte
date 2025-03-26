<script>
  const state = {
    count: 0,
    double: (state) => state.count * 2,
  };
</script>

<h1>Welcome to SvelteKit</h1>
<input type="number" value={state.count} />
<button onclick={() => (state.count += 1)}>count</button>
<h3>Is it working?</h3>
<code>{state.count} * 2 = {state.double(state)}</code>
<br />

<p>
  Visit <a href="https://www.npmjs.com/package/@m5nv/deepstate"
    >@m5nv/deepstate</a
  > to read the documentation
</p>
