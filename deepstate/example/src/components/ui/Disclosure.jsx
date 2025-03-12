import { h } from "preact";
import { useState } from "preact/hooks";

// General purpose Disclosure component with "as" prop support
export function Disclosure({
  as: Component = "div",
  children,
  defaultOpen = false,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Create a context value containing state and togglers
  const context = {
    isOpen,
    toggle: () => setIsOpen((prev) => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };

  // Apply data-state and data-open attributes based on isOpen
  const disclosureProps = {
    ...props,
    className,
    "data-state": isOpen ? "open" : "closed",
    "data-open": isOpen || undefined, // Only add data-open when true
  };

  return (
    <Component {...disclosureProps}>
      {typeof children === "function" ? children(context) : children}
    </Component>
  );
}

// Disclosure.Button component for toggling disclosure state
Disclosure.Button = function DisclosureButton({
  as: Component = "button",
  children,
  className,
  onClick,
  ...props
}) {
  // Properly combine the group class with any existing className
  const buttonClassName = className ? `group ${className}` : "group";

  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      className={buttonClassName}
      {...props}
    >
      {children}
    </Component>
  );
};

// Disclosure.Panel component for content that shows/hides
Disclosure.Panel = function DisclosurePanel({
  as: Component = "div",
  children,
  className,
  ...props
}) {
  return (
    <Component
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};
