<script>
  import { reify } from '@m5nv/deepstate/svelte';
  import Task from './task.svelte';
  import rawTasks from './tasks.js';
  // Extend raw tasks with initial state (DeepState will wrap values as signals).
  const tasksWithState = rawTasks.map((task) => ({
    ...task,
    state: 'pending',
  }));

  // Create a DeepState store with computed "isEnabled" for each task.
  const store = reify(
    { tasks: tasksWithState },
    {
      computedTasks: (s) =>
        s.tasks.map((task) => ({
          ...task,
          // Compute enabled status based on requirements.
          isEnabled: (() => {
            console.log('in isEnabled');
            if (!task.requirements || task.requirements.length === 0)
              return true;
            return task.requirements.every((req) => {
              const requiredTask = s.tasks.find(
                (t) => t.id === req.requiredTaskId,
              );
              return [req.requiredState, 'completed'].includes(
                requiredTask.state,
              );
            });
          })(),
        })),
    },
    false,
  );
</script>

<ol>
  {#each store.state.tasks as task (task.id)}
    <Task {task} />
  {/each}
</ol>
