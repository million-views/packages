/**
 * vite-plugin-run-task: invoke user defined task on file/folder changes.
 *
 * This plugin allows users to tap into Vite plugin's `configResolved`
 * and `handleHotUpdate` hooks and execute a task to be run when one or
 * more files/folders matching a specification is saved.
 *
 * User defined task can optionally return an event payload that will be
 * sent to clients regarding the nature of the change; the task should
 * return  *false* if it has no updates or is not interested in hmr.
 */

import path from "node:path";
import { minimatch } from "minimatch";

const match = (watch, file, root) => {
  return watch.some((pattern) => {
    pattern = path.resolve(root, pattern).replaceAll("\\", "/");
    return minimatch(file, pattern);
  });
};

export default function ({ watch, task }) {
  if (!Array.isArray(watch)) {
    throw TypeError(`watch expects an Array of strings; ${watch} is not that!`);
  }

  // Minimatch requires forward slashes in glob expressions
  watch = watch.map((path) => path.replaceAll("\\", "/"));

  return {
    name: "vite-plugin-run-task",

    configResolved(resolvedConfig) {
      task(resolvedConfig, "configResolved");
    },

    handleHotUpdate(context) {
      const { file, server } = context;
      const { root } = server.config;
      let modules = context.modules;
      if (match(watch, file, root)) {
        const followup = task(context, "hotUpdate");

        // followup must have 'type' key to qualify as payload for `send`
        if (followup && Object.hasOwn(followup, "type")) {
          server.ws.send(followup);
        }

        // return empty module list since we handled things manually
        modules = [];
      }

      return modules;
    },
  };
}
