import React, { createContext, useContext, useState } from "react";

// Create a disclosure context
const DisclosureContext = createContext(null);

export function Disclosure({
  as: Component = "div",
  children,
  defaultOpen = false,
  className,
  ...props
}) {
  // Use useState hook for state management
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Create actions for state management
  const actions = {
    toggle: () => setIsOpen(prev => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };

  // Create context value
  const context = { isOpen, ...actions };

  // Get derived props including data attributes
  const derivedProps = {
    ...props,
    className,
    "data-state": isOpen ? "open" : "closed",
    "data-open": isOpen || undefined,
  };

  return (
    <DisclosureContext.Provider value={context}>
      <Component {...derivedProps}>
        {typeof children === "function"
          ? children({ isOpen, ...actions })
          : children}
      </Component>
    </DisclosureContext.Provider>
  );
}

// Button that controls the disclosure state
Disclosure.Button = function DisclosureButton({
  as: Component = "button",
  children,
  className,
  ...props
}) {
  const context = useContext(DisclosureContext);

  if (!context) {
    console.error("Disclosure.Button must be used within a Disclosure component");
    return null;
  }

  const { isOpen, toggle } = context;

  const buttonClassName = className ? `group ${className}` : "group";

  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      className={buttonClassName}
      onClick={toggle}
      aria-expanded={isOpen}
      data-state={isOpen ? "open" : "closed"}
      data-open={isOpen || undefined}
      {...props}
    >
      {children}
    </Component>
  );
};

// Panel that is shown/hidden based on disclosure state
Disclosure.Panel = function DisclosurePanel({
  as: Component = "div",
  children,
  className,
  forceMount,
  ...props
}) {
  const context = useContext(DisclosureContext);

  if (!context) {
    console.error("Disclosure.Panel must be used within a Disclosure component");
    return null;
  }

  const { isOpen } = context;

  if (!isOpen && !forceMount) {
    return null;
  }

  const style = !isOpen && forceMount ? { display: "none" } : undefined;

  return (
    <Component
      className={className}
      data-state={isOpen ? "open" : "closed"}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};
