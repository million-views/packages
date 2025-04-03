<script>
  import { reify } from '@m5nv/deepstate/svelte';

  const store = reify({ count: 0, double: (state) => state.count * 2 });
  const { _count: count, _double: double } = store.state;
  const { state } = store;
</script>

<h2>With Deepstate</h2>
<input type="number" bind:value={state.count} />
<button onclick={() => (state.count += 1)}>count</button>
<h3>Is it working?</h3>
<code>{state.count} * 2 = {state.double} | proxy read (.get)</code>
<br />
<code>{$count} * 2 = {$double} | signal read (.value)</code>

<hr />
<aside>
  For 'attach'ed functions to trigger reactivity, unfortunately we have to
  revert to 'coarse' grained reactivity by falling back on Svelte's store
  mechanisms.
</aside>

<p>
  Visit <a href="https://www.npmjs.com/package/@m5nv/deepstate"
    >@m5nv/deepstate</a
  > to read the documentation
</p>
