import { cloneElement, toChildArray } from "preact";
import { useEffect, useRef } from "preact/hooks";
import clsx from "clsx";

export function Button(p) {
  const {
    className,
    variant = "default",
    size = "default",
    children,
    onClick,
    ...rest
  } = p;
  const ref = useRef(null);
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
    if (ref.current && onClick) {
      ref.current.addEventListener("click", onClick);
      return function () {
        if (ref.current) {
          ref.current.removeEventListener("click", onClick);
        }
      };
    }
  }, [onClick]);
  return (
    <button
      ref={ref}
      className={clsx("btn", variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

// Sheet (Drawer in DaisyUI) with clean SSR pattern
export function Sheet({ children, open, onOpenChange }) {
  const ref = useRef(null);

  // Update open state on the client only
  useEffect(() => {
    if (ref.current) {
      const checkbox = ref.current.querySelector(".drawer-toggle");
      if (checkbox) {
        checkbox.checked = open;
      }
    }
  }, [open]);

  // Add change event listener on client-side only
  useEffect(() => {
    if (ref.current && onOpenChange) {
      const checkbox = ref.current.querySelector(".drawer-toggle");
      if (checkbox) {
        const handleChange = (e) => onOpenChange(e.target.checked);
        checkbox.addEventListener("change", handleChange);
        return () => {
          checkbox.removeEventListener("change", handleChange);
        };
      }
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
    if (ref.current) {
      const overlay = ref.current.querySelector(".drawer-overlay");
      if (overlay) {
        const handleClick = () => {
          const drawer = ref.current.closest(".drawer");
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

export function SheetHeader({ className, children }) {
  return <div className={clsx("mb-4", className)}>{children}</div>;
}

export function SheetTitle({ className, children }) {
  return <h3 className={clsx("text-lg font-bold", className)}>{children}</h3>;
}

export function SheetClose({ className, children, onClick, ...props }) {
  const ref = useRef(null);

  // Add click event listener on client-side only
  useEffect(() => {
    if (ref.current) {
      const handleClick = (e) => {
        if (onClick) {
          onClick(e);
        }

        // Close the drawer
        const drawer = ref.current.closest(".drawer");
        if (drawer) {
          const checkbox = drawer.querySelector(".drawer-toggle");
          if (checkbox) {
            checkbox.checked = false;
            // Dispatch change event
            checkbox.dispatchEvent(new Event("change"));
          }
        }
      };

      ref.current.addEventListener("click", handleClick);
      return () => {
        if (ref.current) {
          ref.current.removeEventListener("click", handleClick);
        }
      };
    }
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

// Updated dropdown menu
export function DropdownMenu({ open, onOpenChange, children }) {
  const ref = useRef(null);

  // Update class to toggle the dropdown visibility on client side
  useEffect(() => {
    if (ref.current) {
      if (open) {
        ref.current.classList.add("dropdown-open");
      } else {
        ref.current.classList.remove("dropdown-open");
      }
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

  // Add click listener on client side only
  useEffect(() => {
    if (ref.current && onOpenChange) {
      const handleClick = (e) => {
        e.preventDefault();
        onOpenChange(!open);
      };

      ref.current.addEventListener("click", handleClick);
      return () => {
        if (ref.current) {
          ref.current.removeEventListener("click", handleClick);
        }
      };
    }
  }, [open, onOpenChange]);

  if (asChild) {
    const child = toChildArray(children)[0];
    return cloneElement(child, { ref });
  }

  return (
    <button
      ref={ref}
      className="btn"
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
  const ref = useRef(null);

  // Add click event listener on client side only
  useEffect(() => {
    if (ref.current && onClick) {
      const handleClick = (e) => {
        e.preventDefault();
        onClick(e);

        // Close the dropdown
        const dropdown = ref.current.closest(".dropdown");
        if (dropdown) {
          dropdown.classList.remove("dropdown-open");
        }
      };

      ref.current.addEventListener("click", handleClick);
      return () => {
        if (ref.current) {
          ref.current.removeEventListener("click", handleClick);
        }
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
