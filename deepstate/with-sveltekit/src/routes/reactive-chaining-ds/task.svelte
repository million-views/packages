<script>
  // Expect a "task" prop containing properties defined by DeepState.
  let { name, state = $bindable(), requirements, isEnabled } = $props();

  const stateColors = {
    pending: 'lightgray',
    ongoing: 'lightblue',
    completed: 'lightgreen',
  };

  $inspect(`${name}, isEnabled is ${isEnabled}`);
</script>

<li
  style:opacity={isEnabled ? 1 : 0.7}
  style:background-color={stateColors[state]}
  style="margin-bottom: 5px; padding: 5px;"
>
  <!-- Two-way binding using Svelte's binding with the proxy read. -->
  <select bind:value={state}>
    <option value="pending">Pending</option>
    <option value="ongoing">Ongoing</option>
    <option value="completed">Completed</option>
  </select>

  <strong>{name}</strong>

  {#if requirements && requirements.length > 0}
    - Requires:
    {#each requirements as req (req.id)}
      <span>
        {req.requiredTaskId} ({req.requiredState})
      </span>
    {/each}
  {/if}
</li>
