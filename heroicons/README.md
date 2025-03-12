# Hero Icons by Tailwind

A temporary fork of @heroicons to make them work in @preactjs projects.

The plan is to submit a PR. Only `build.js` script was modified.

This package is not published anywhere and there are no plans to either.

To use these icons in your code, checkout out copy `heroicons/preact` folder
into your project. And then in your `package.json` add it as a dependency using
file url.

```json
  "dependencies": {
...
    "@heroicons/preact": "file:./<releative-path-to/heroicons/preact"
...
  }
```

After installation, you can use these icons as you would in a React project.
Just replace `react` with `preact`:

```jsx
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/preact/24/outline";
```
