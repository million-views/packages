import clsx from "clsx";
import { cloneElement, toChildArray } from "preact";

export const Button = (props) => {
  const {
    className,
    variant = "default",
    size = "default",
    children,
    ref,
    ...restProps
  } = props;

  // Map variants to daisyUI classes
  const variantClasses = {
    default: "btn-primary",
    destructive: "btn-error",
    outline: "btn-outline",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    link: "btn-link",
  };

  // Map sizes to daisyUI classes
  const sizeClasses = {
    default: "",
    sm: "btn-sm",
    lg: "btn-lg",
    icon: "btn-square", // For icon buttons
  };

  // Special case for icon buttons to maintain sizing
  const isIconButton = size === "icon";

  return (
    <button
      className={clsx(
        "btn",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      ref={ref}
      {...restProps}
    >
      {children}
    </button>
  );
};

// Sheet (Drawer in DaisyUI)
export function Sheet({ children, open, onOpenChange }) {
  return (
    <div className={clsx("drawer", open && "drawer-open")}>
      <input
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(e) => onOpenChange?.(e.target.checked)}
      />
      {children}
    </div>
  );
}

export function SheetContent({ children, side = "right", className }) {
  const sideClass = side === "left" ? "drawer-side" : "drawer-end drawer-side";

  return (
    <div className={clsx(sideClass, className)}>
      <div className="drawer-overlay" onClick={() => onOpenChange?.(false)}>
      </div>
      <div className="min-h-full bg-base-100 p-4 shadow-lg">
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, children }) {
  return <div className={clsx("mb-4", className)}>{children}</div>;
}

export function SheetTitle({ className, children }) {
  return <h3 className={clsx("text-lg font-bold", className)}>{children}</h3>;
}

export function SheetClose({ className, children, ...props }) {
  return (
    <button className={clsx("btn btn-ghost btn-sm", className)} {...props}>
      {children}
    </button>
  );
}

// Updated dropdown menu
export function DropdownMenu({ open, onOpenChange, children }) {
  return (
    <div className="dropdown">
      {toChildArray(children).map((child) => {
        if (child.type === DropdownMenuTrigger) {
          return cloneElement(child, { open, onOpenChange });
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({ asChild, children, open, onOpenChange }) {
  const handleClick = (e) => {
    e.preventDefault();
    onOpenChange?.(!open);
  };

  if (asChild) {
    return cloneElement(toChildArray(children)[0], {
      onClick: handleClick,
      "data-dropdown-open": open ? "true" : "false",
    });
  }

  return (
    <button
      className="btn"
      onClick={handleClick}
      data-dropdown-open={open ? "true" : "false"}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ align = "center", className, children }) {
  const alignClass = {
    start: "dropdown-start",
    center: "",
    end: "dropdown-end",
  };

  return (
    <ul
      className={clsx(
        "dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-52",
        alignClass[align],
        className,
      )}
    >
      {children}
    </ul>
  );
}

export function DropdownMenuItem({ className, onClick, children }) {
  return (
    <li>
      <a
        className={clsx("", className)}
        onClick={(e) => {
          e.preventDefault();
          onClick?.(e);
        }}
      >
        {children}
      </a>
    </li>
  );
}

// Tooltip
export function TooltipProvider({ children }) {
  return <>{children}</>;
}

export function Tooltip({ children }) {
  return <>{children}</>;
}

export function TooltipTrigger({ asChild, children }) {
  if (asChild) {
    return cloneElement(toChildArray(children)[0], {
      "data-tip": true,
    });
  }
  return <span data-tip={true}>{children}</span>;
}

export function TooltipContent({ className, children }) {
  return (
    <div className={clsx("tooltip-content", className)}>
      {children}
    </div>
  );
}

// Updated Card components to use DaisyUI
export function Card({ className, children, ref, ...props }) {
  return (
    <div
      className={clsx("card bg-base-100 shadow-xl", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={clsx("card-header p-6 pb-2", className)}>{children}</div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h2 className={clsx("card-title text-xl font-semibold", className)}>
      {children}
    </h2>
  );
}

export function CardContent({ className, children }) {
  return <div className={clsx("card-body pt-2", className)}>{children}</div>;
}
