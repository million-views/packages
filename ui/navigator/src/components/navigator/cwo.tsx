// file: cwo.tsx
// declarative if-elseif-else construct
import React, { Children, isValidElement } from "react";

// Define interfaces for props
interface ChooseProps {
  children: React.ReactNode;
}

interface WhenProps {
  condition: boolean | undefined;
  children: React.ReactNode;
}

interface OtherwiseProps {
  children: React.ReactNode;
}

// The <When> renders children if condition evaluates to true.
// Unlike <Otherwise>, <When> can be used as a standalone utility
// Note: <Choose> independently evals condition of When by reaching
// into its condition and children directly.
export function When(
  { condition, children }: WhenProps,
): React.ReactElement | null {
  if (!condition) {
    return null; // If condition is false, render nothing
  }
  return <>{children}</>; // If condition is true, render children
}

// Otherwise.tsx
interface OtherwiseProps {
  children: React.ReactNode;
}

// The <Otherwise> component doesn't render anything on its own.
// Its children are conditionally rendered by the <Choose> parent.
export function Otherwise({ children }: OtherwiseProps): React.ReactElement {
  // This component is primarily a descriptor for Choose.
  // It doesn't have its own conditional logic.
  // Actual rendering logic is in Choose
  return <>{children}</>;
}

// The <Choose> component
export function Choose({ children }: ChooseProps): React.ReactElement | null {
  let whenMet = false;
  let otherwiseBranch: React.ReactNode = null;
  let result: React.ReactNode = null;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      // Allow null, undefined, booleans, strings, numbers as children (they will be ignored by the logic)
      // This is standard React behavior for children.
      // If you want to be even stricter and only allow <When> and <Otherwise>,
      // you could throw an error here too for non-element children,
      // but typically allowing fragments or ignorable values is fine.
      return;
    }

    // Check the type of the direct child element
    if (child.type !== When && child.type !== Otherwise) {
      throw new Error(
        `<Choose> component only accepts <When> and <Otherwise> components as direct children. ` +
          `Received a child of type "${
            typeof child.type === "string"
              ? child.type
              : (child.type as React.FC)?.displayName ||
                (child.type as React.FC)?.name || JSON.stringify(child.type)
          }".`,
      );
    }

    // If a <When> condition has already been met, don't process further <When> blocks.
    // Still need to find <Otherwise> if it exists.
    if (whenMet && child.type !== Otherwise) {
      return;
    }
    if (child.type === When) {
      const whenElement = child as React.ReactElement<WhenProps>;
      if (!whenMet && whenElement.props.condition) {
        result = whenElement.props.children;
        whenMet = true;
      }
    } else if (child.type === Otherwise) {
      // Check if <Otherwise> has already been found, which would be a usage error
      if (otherwiseBranch) {
        throw new Error(
          `Only one <Otherwise> component is allowed within a <Choose> component.`,
        );
      }
      otherwiseBranch =
        (child as React.ReactElement<OtherwiseProps>).props.children;
    }
  });

  if (!whenMet && otherwiseBranch) {
    return <>{otherwiseBranch}</>;
  }

  return <>{result}</>;
}
