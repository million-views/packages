<script>
  import { effect } from '@preact/signals-core';

  // Expect a "task" prop containing properties defined by DeepState.
  let { task } = $props();
  let { name, _state: state, requirements, _isEnabled: isEnabled } = task;
  const stateColors = {
    pending: 'lightgray',
    ongoing: 'lightblue',
    completed: 'lightgreen',
  };
</script>

<li
  style:opacity={$isEnabled ? 1 : 0.6}
  style:background-color={stateColors[$state]}
  style="margin-bottom: 5px; padding: 5px;"
>
  <select
    value={$state}
    disabled={!$isEnabled}
    onchange={(event) => (state.value = event.target.value)}
  >
    <option value="pending">Pending</option>
    <option value="ongoing">Ongoing</option>
    <option value="completed">Completed</option>
  </select>

  <strong>{name}</strong>

  {#if requirements.length > 0}
    - Requires:
    {#each requirements as req}
      <span key={req.id}>
        {req.requiredTaskId} ({req.requiredState})
      </span>
    {/each}
  {/if}
</li>
