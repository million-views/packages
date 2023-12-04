# Vite Plugin Hook Task
A simple plugin to **side run** a `function` during `build` and `serve`
phases of Vite, by implementing `configResolved` and `handleHotUpdate`
hooks and delegate follow up to a user defined task.

The user defined task is invoked whenever a change is detected in 
files/folder matching a specified pattern.

> If your need is to run a shell command/process then this plugin
> is not for you. Checkout [awesome vite repo][1.1] to find plugins that
> may fit your bill.

The plugin was created to be able to build a CSS library using `lightningcss`
while using Astro for its documentation. It exists because the act of
building a main artefact (i.e the CSS library in this instance) should
not be masked by the quirks or capabilities of the framework used to
document that artefact. 

We think this idea rings true for a few [other use cases][1.2] where
creating well defined tasks to produce an artefact is better than hacking
package.json with additional steps that are either chained to execute
in sequence or have the developer issue additional commands to produce
the artefact.


## Quick start

### Install `vite-plugin-run-task`
```bash
$ npm install @m5nv/vite-plugin-run-task
```

## How to use it and why
To understand why we need this plugin, let's setup the stage to provide
some context. 

We are developing `kis.css` library, and we have decided to use Astro
to document it and use it to style the documentation. We want to see the
changes to the content of the documentation and changes to the style as
we develop `kis.css`, both simultaneously and iteratively.

This is a classic chicken and egg problem. 

Astro does a beautiful job in hot reloading the content (it manages). We
need a way to **hot** build `kis.css` as we make changes to it in the
`src` folder - which as a reminder is our main character.

Here is how we solve it.

### Create a task to build `kis.css` and bundle it using `lightningcss`
```js
// kis-builder.js
import browserslist from 'browserslist';
import { browserslistToTargets, bundle } from 'lightningcss';

const browsers = browserslist(process.env.npm_package_browserslist);
const targets = browserslistToTargets(browsers);

export default function(context, event) {
  let file, timestamp, server, command;
  if (event == 'hotUpdate') {
    ({file, timestamp, server} = context);
    command = server.config.command;
  } else {
    command = context.command;
    timestamp= Date.now();
  }

  if (!(command === 'build' || event === 'hotUpdate')) {
    return;
  }

  console.log(`${event}, ${command}, ${file} | building kis.css`);

  let { code, warnings } = bundle({
    targets,
    filename: path.resolve('src/kis.css'),
    minify: false
  });

  if (code) {
    let codeStream = fs.createWriteStream("public/kis.css");
    codeStream.write(code);
    codeStream.end();
  }

  if (warnings.length) {
    console.table(warnings);
  }

  let followup = false;
  if (event === 'hotUpdate') {
    // see vite hmrPayload.d.ts for event type and payload content
    return {
      type: 'update',
      updates: [{path: '/kis.css', timestamp }]
    };
  }

  return followup;
}
```

### Piggyback on Astro's config to invoke our task using this plugin
```js
import { defineConfig } from 'astro/config';
import runTask from '@m5nv/vite-plugin-run-task'
import task from './kis-builder';

// https://astro.build/config
export default defineConfig({
  site: "https://kiscss.github.io",
  vite: {
    plugins: [ runTask({ watch: ['src/**/*.css'], task}) ],
  }
});
```

## References
<!-- referenced -->
[1.1]: <https://github.com/vitejs/awesome-vite#plugins> (Awesome Vite)
[1.2]: <https://github.com/vitejs/vite/discussions/8364> (Issue, unresolved - plugin to hot reload static assets)
<!-- unreferenced -->
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [Lightning CSS](https://lightningcss.dev/bundling.html)
- [Configuring Astro](https://docs.astro.build/en/guides/configuring-astro/)
