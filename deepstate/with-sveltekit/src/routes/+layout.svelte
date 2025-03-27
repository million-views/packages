<script>
  let { children } = $props();
</script>

<h1>Welcome to DeepState with SvelteKit</h1>

<nav>
  <a href="/">Plain Svelte</a>
  <a href="/with-deepstate">Deepstate</a>
  <a href="/with-store">Naive Svelte Store</a>
  <a href="/with-effect-store">Ideal Svelte Store</a>
  <a href="/reactive-chaining">Reactive Chaining</a>
  <a href="/reactive-chaining-ds">Reactive Chaining with DeepState</a>
</nav>

{@render children()}

<style>
  nav {
    display: inline-flex;
    gap: 1rem;
  }
</style>
