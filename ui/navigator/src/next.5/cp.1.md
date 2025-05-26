# Navigator Component Continuation Prompt

We have been working on a Navigator component for React applications following
the MVC pattern:

- Model: navigationTree (route data from rr-builder)
- Controller: Navigator component (state management)
- View: Templates (UI rendering)

It is a micro-framework designed to quickly add site-wide/app-wide navigation
without reinventing the same design elements over and over. It is made
extensible and customization by using `templates`. It comes with 4 built-in
templates, and a collection of standard components.

I am attaching the code, the navigator API doc, and the template developer guide
for your reference. Make sure you thoroughly review the provided inputs before
modifying anything.

## Current Status

1. Navigator implemented (v1)
2. Build 4 templates with granular UI element customization
3. Documented the API and template development

## Issue to Fix

The templates aren't properly using navigation utilities from `useNavigator()`.
Instead of using the template's navigation utility functions like
`getItemsByTags()` to get data and populate the UI elements, they're assuming
the consumer of the template will be providing the data, which is incorrect. And
violates our principle of keeping templates as pure but specialized view/layout
components that know how to pupulate navigation related UI elements.

## Tasks for Continuation

1. Fix the templates to properly use utilities from useNavigator()
2. Remove any data related fields in the "ui-component-tree" component prop of
   the built-in templates, and instead use the functions return by useNavigator.
3. Verify templates follow the separation of concerns principles

The templates should access navigation model data only through the context
utilities, never directly manipulating the navigationTree themselves.

After you make the necessary changes to the built-in templates, update the
'Navigator Template Developer Guide' accordingly. By the way I rewrote it for it
to flow better. Consider using this is as the new base for improvements to the
"Template Develoer Guide"

---

That doesn't look right. Before I start integrating, I want to make sure that
`rr-builder` can actually generate a `navigationTree` such as the ones that you
generated. We are going to take a slight detour by making you create or rather
reverse engineer the variants of `routes.js` corresponding to the
`Enhanced Navigation Trees with Action Support` artifact. I have attached a
sample `routes-wr-wm.js` for you to see the original for a `navigationTree`.
Review it and then generate 8 variants (if I understand the test data you
generated correctly) of `routes`:

- dashboard-routes-simple.js
- dashboard-routes-complex.js
- docs-routes-simple.js
- docs-routes-complex.j
- ecommerce-routes-simple.js
- ecommerce-routes-complex.js
- news-routes-simple.js
- news-routes-complex.js

Leave notes in the generated files on features are needed to be supported by
`rr-builder` or your assumptions. If you pull this task off correctly then it
gives me confidence that you truly understand what we are trying to achieve, and
that you genuinely have read the README of `rr-builder`.
