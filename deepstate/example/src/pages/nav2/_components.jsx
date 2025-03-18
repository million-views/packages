import { cloneElement, toChildArray } from "preact";
import { useEffect, useRef } from "preact/hooks";
import clsx from "clsx";

export function Button(
  {
    innerRef,
    className,
    variant = "default",
    size = "default",
    children,
    onClick,
    ...rest
  },
) {
  const localRef = useRef(null);
  const combinedRef = innerRef || localRef;
  const variants = {
    default: "btn-primary",
    destructive: "btn-error",
    outline: "btn-outline",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    link: "btn-link",
  };
  const sizes = {
    default: "",
    sm: "btn-sm",
    lg: "btn-lg",
    icon: "btn-square",
  };
  useEffect(function () {
    const el = combinedRef.current;
    if (el && onClick) {
      el.addEventListener("click", onClick);
      return function () {
        el.removeEventListener("click", onClick);
      };
    }
  }, [onClick]);
  return (
    <button
      ref={combinedRef}
      className={clsx("btn", variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

// Sheet (Drawer in DaisyUI)
export function Sheet({ children, open, onOpenChange }) {
  const ref = useRef(null);

  // Update open state on the client only
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const checkbox = element.querySelector(".drawer-toggle");
    if (checkbox) {
      checkbox.checked = open;
    }
  }, [open]);

  // Add change event listener on client-side only
  useEffect(() => {
    const element = ref.current;
    if (!element || !onOpenChange) return;

    const checkbox = element.querySelector(".drawer-toggle");
    if (checkbox) {
      const handleChange = (e) => onOpenChange(e.target.checked);
      checkbox.addEventListener("change", handleChange);
      return () => {
        checkbox.removeEventListener("change", handleChange);
      };
    }
  }, [onOpenChange]);

  return (
    <div ref={ref} className="drawer">
      <input
        type="checkbox"
        className="drawer-toggle"
      />
      {children}
    </div>
  );
}

export function SheetContent({ children, side = "left", className }) {
  const ref = useRef(null);
  const sideClass = side === "left" ? "drawer-side" : "drawer-end drawer-side";

  // Add overlay click event on client only
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const overlay = element.querySelector(".drawer-overlay");
    if (overlay) {
      const handleClick = () => {
        const drawer = element.closest(".drawer");
        if (drawer) {
          const checkbox = drawer.querySelector(".drawer-toggle");
          if (checkbox) {
            checkbox.checked = false;
            // Dispatch change event
            checkbox.dispatchEvent(new Event("change"));
          }
        }
      };

      overlay.addEventListener("click", handleClick);
      return () => {
        overlay.removeEventListener("click", handleClick);
      };
    }
  }, []);

  return (
    <div ref={ref} className={clsx(sideClass, className)}>
      <div className="drawer-overlay"></div>
      <div className="min-h-full bg-base-100 p-4 shadow-lg">
        {children}
      </div>
    </div>
  );
}

export function SheetClose({ className, children, onClick, ...props }) {
  const ref = useRef(null);

  // Add click event listener on client-side only
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleClick = (e) => {
      if (onClick) {
        onClick(e);
      }

      // Close the drawer
      const drawer = element.closest(".drawer");
      if (drawer) {
        const checkbox = drawer.querySelector(".drawer-toggle");
        if (checkbox) {
          checkbox.checked = false;
          // Dispatch change event
          checkbox.dispatchEvent(new Event("change"));
        }
      }
    };

    element.addEventListener("click", handleClick);
    return () => {
      element.removeEventListener("click", handleClick);
    };
  }, [onClick]);

  return (
    <button
      ref={ref}
      className={clsx("btn btn-ghost btn-sm", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SheetHeader({ className, children }) {
  return <div className={clsx("mb-4", className)}>{children}</div>;
}

export function SheetTitle({ className, children }) {
  return <h3 className={clsx("text-lg font-bold", className)}>{children}</h3>;
}

export function DropdownMenu({ open, onOpenChange, children }) {
  const ref = useRef(null);

  // Update class to toggle the dropdown visibility on client side
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (open) {
      element.classList.add("dropdown-open");
    } else {
      element.classList.remove("dropdown-open");
    }
  }, [open]);

  return (
    <div ref={ref} className="dropdown">
      {toChildArray(children).map((child) => {
        if (child?.type === DropdownMenuTrigger) {
          return cloneElement(child, { open, onOpenChange });
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({ asChild, children, open, onOpenChange }) {
  const ref = useRef(null);
  useEffect(function () {
    const el = ref.current;
    if (!el || !onOpenChange) return;
    function handleClick(e) {
      e.preventDefault();
      onOpenChange(!open);
    }
    el.addEventListener("click", handleClick);
    return function () {
      el.removeEventListener("click", handleClick);
    };
  }, [open, onOpenChange]);
  if (asChild) {
    const child = toChildArray(children)[0];
    return cloneElement(child, { innerRef: ref });
  }
  return (
    <button ref={ref} className="btn">
      {children}
    </button>
  );
}

export function DropdownMenuItem({ className, onClick, children }) {
  const ref = useRef(null);

  // Add click event listener on client side only
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (onClick) {
      const handleClick = (e) => {
        e.preventDefault();
        onClick(e);

        // Close the dropdown
        const dropdown = element.closest(".dropdown");
        if (dropdown) {
          dropdown.classList.remove("dropdown-open");
        }
      };

      element.addEventListener("click", handleClick);
      return () => {
        element.removeEventListener("click", handleClick);
      };
    }
  }, [onClick]);

  return (
    <li>
      <a
        ref={ref}
        className={clsx("", className)}
      >
        {children}
      </a>
    </li>
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

// Tooltip with clean SSR pattern
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

// Card components (no event handling needed)
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
