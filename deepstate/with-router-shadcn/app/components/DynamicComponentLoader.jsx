// DynamicComponentLoader.jsx
import React, { Suspense } from 'react';

// This will create a mapping of all components in the `./examples` directory
const components = import.meta.glob('./examples/*.jsx', { eager: false });

// console.log ({components});

const DynamicComponentLoader = ({ filename }) => {
  // console.log ('filename: ', filename);

  const path = `./examples/${filename}.jsx`;

  // console.log('path: ', path);

  if (!(path in components)) {
    return <div>Component not found: {filename}</div>;
  }

  const Component = React.lazy(components[path]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
};

export default DynamicComponentLoader;
