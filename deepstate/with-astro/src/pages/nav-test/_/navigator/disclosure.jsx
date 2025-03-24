import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { useSignal } from "@preact/signals";

// Create a disclosure context
const DisclosureContext = createContext(null);

export function Disclosure({
  as: Component = "div",
  children,
  defaultOpen = false,
  className,
  ...props
}) {
  // Use useSignal hook for state management
  const isOpen = useSignal(defaultOpen);

  // Create actions for state management
  const actions = {
    toggle: () => isOpen.value = !isOpen.value,
    open: () => isOpen.value = true,
    close: () => isOpen.value = false,
  };

  // Create context value
  const context = { isOpen, ...actions };

  // Get derived props including data attributes
  const derivedProps = {
    ...props,
    className,
    "data-state": isOpen.value ? "open" : "closed",
    "data-open": isOpen.value || undefined,
  };

  return (
    <DisclosureContext.Provider value={context}>
      <Component {...derivedProps}>
        {typeof children === "function"
          ? children({ isOpen: isOpen.value, ...actions })
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
    console.error(
      "Disclosure.Button must be used within a Disclosure component",
    );
    return null;
  }

  const { isOpen, toggle } = context;

  // Combine classes, ensuring 'group' is included for group variants
  const buttonClassName = className ? `group ${className}` : "group";

  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      className={buttonClassName}
      onClick={toggle}
      aria-expanded={isOpen.value}
      data-state={isOpen.value ? "open" : "closed"}
      data-open={isOpen.value || undefined}
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
  ...props
}) {
  const context = useContext(DisclosureContext);

  if (!context) {
    console.error(
      "Disclosure.Panel must be used within a Disclosure component",
    );
    return null;
  }

  const { isOpen } = context;

  // If closed and forceMount is not set, don't render anything
  if (!isOpen.value && !props.forceMount) {
    return null;
  }

  // Allow the caller to control visibility if forceMount is true
  const style = !isOpen.value && props.forceMount
    ? { display: "none" }
    : undefined;

  delete props.forceMount; // Clean up our custom prop

  return (
    <Component
      className={className}
      data-state={isOpen.value ? "open" : "closed"}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};
