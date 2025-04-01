<script>
  import { reify } from '@m5nv/deepstate/svelte';
  import Task from './task.svelte';
  import rawTasks from './tasks.js';

  const isEnabled = (self, root) => {
    if (!self.requirements || self.requirements.length === 0) return true;
    return self.requirements.every((req) => {
      const requiredTask = root.tasks.find((t) => t.id === req.requiredTaskId);
      return (
        requiredTask &&
        [req.requiredState, 'completed'].includes(requiredTask.state)
      );
    });
  };

  const tasksWithState = rawTasks.map((task) => ({
    ...task,
    state: task.state || 'pending',
    isEnabled,
  }));

  const store = reify({ tasks: tasksWithState });
</script>

<ol>
  {#each store.state.tasks as task (task.id)}
    <Task {task} />
  {/each}
</ol>
