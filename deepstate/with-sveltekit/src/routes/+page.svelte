<script>
  import { reify } from '@m5nv/deepstate/core';

  const store = reify({ count: 0 }, { double: (state) => state.count * 2 });
</script>

<h1>Welcome to SvelteKit</h1>
<input type="number" bind:value={store.state.count} />
<button onclick={() => (store.state.count += 1)}>count</button>
<h3>Is it working?</h3>
<code>{store.state.count} * 2 = {store.state.double}</code>
<p>
  Visit <a href="https://www.npmjs.com/package/@m5nv/deepstate"
    >@m5nv/deepstate</a
  > to read the documentation
</p>
