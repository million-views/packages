<script>
  /// Experiments from a reddit thread
  /// https://www.reddit.com/r/sveltejs/comments/11bdd84/svelte_stores_vs_preact_signals_are_they_the_same/

  import rawTasks from './tasks';
  import Task from './task.svelte';
  import { signal, computed, effect } from '@preact/signals-core';

  const tasksWithState = rawTasks.map((task) => ({
    ...task,
    state: signal('pending'),
  }));

  const tasks = tasksWithState.map((task) => ({
    ...task,
    isEnabled: computed(() => {
      if (!task.requirements || task.requirements.length === 0) return true;

      // The task is enabled if all its requirements are met.
      // That is, all the required task are in the required state or completed.
      return task.requirements.every((req) => {
        const requiredTask = tasksWithState.find(
          ({ id }) => id === req.requiredTaskId,
        );

        return [req.requiredState, 'completed'].includes(
          requiredTask.state.value,
        );
      });
    }),
  }));

  // effect(() => {
  //   tasks.forEach((task) => {
  //     if (!task.isEnabled.value) {
  //       task.state.value = 'pending';
  //     }
  //   });
  // });
</script>

<ol>
  {#each tasks as { name, state, isEnabled, requirements }}
    <Task {name} {state} {isEnabled} {requirements} />
  {/each}
</ol>
