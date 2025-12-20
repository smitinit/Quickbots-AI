"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type MenuContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenu() {
  const ctx = React.useContext(MenuContext);
  if (!ctx) throw new Error("Menu components must be used within <Menu>");
  return ctx;
}

interface MenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean; // For compatibility with shadcn/ui API, not used in this implementation
}

export function Dropdown({
  children,
  open: controlledOpen,
  onOpenChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modal: _modal, // Accept but ignore for compatibility with shadcn/ui API
}: MenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(v);
      onOpenChange?.(v);
    },
    [controlledOpen, onOpenChange]
  );

  const triggerRef = React.useRef<HTMLElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    // Use bubble phase instead of capture to allow item clicks to execute first
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open, setOpen]);

  return (
    <MenuContext.Provider value={{ open, setOpen, triggerRef, menuRef }}>
      <div className="relative inline-block">{children}</div>
    </MenuContext.Provider>
  );
}

interface MenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  MenuTriggerProps
>(({ className, asChild, children, onClick, ...props }, forwardedRef) => {
  const { open, setOpen, triggerRef } = useMenu();

  const ref = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, triggerRef]
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpen(!open);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      onClick: handleClick,
      "aria-expanded": open,
      "aria-haspopup": true,
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn("outline-none", className)}
      aria-expanded={open}
      aria-haspopup="true"
      {...props}
    >
      {children}
    </button>
  );
});

DropdownTrigger.displayName = "DropdownTrigger";

interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const DropdownContent = React.forwardRef<
  HTMLDivElement,
  MenuContentProps
>(
  (
    { align = "start", sideOffset = 4, className, style, children, ...props },
    forwardedRef
  ) => {
    const { open, triggerRef, menuRef } = useMenu();
    const [position, setPosition] = React.useState<{
      top: number;
      left: number;
    } | null>(null);
    const positionCalculatedRef = React.useRef(false);

    // Calculate position
    React.useLayoutEffect(() => {
      if (!open || !triggerRef.current) {
        setPosition(null);
        positionCalculatedRef.current = false;
        return;
      }

      // Reset calculation flag when menu opens
      positionCalculatedRef.current = false;

      let isMounted = true;

      const updatePosition = (force = false) => {
        if (!isMounted || !triggerRef.current) {
          return;
        }

        // Only calculate once unless forced (for resize/scroll)
        if (positionCalculatedRef.current && !force) {
          return;
        }

        const triggerRect = triggerRef.current.getBoundingClientRect();

        // Calculate initial position based on trigger only (more stable)
        let left = triggerRect.left + window.scrollX;
        let top = triggerRect.bottom + window.scrollY + sideOffset;

        // Estimate menu width for initial positioning (min-w-[8rem] = 128px)
        const estimatedMenuWidth = 200; // Reasonable default
        const estimatedMenuHeight = 300; // Reasonable default

        if (align === "center") {
          left =
            triggerRect.left +
            window.scrollX +
            triggerRect.width / 2 -
            estimatedMenuWidth / 2;
        } else if (align === "end") {
          left = triggerRect.right + window.scrollX - estimatedMenuWidth;
        }

        // Viewport boundaries (using estimated size)
        const vw = window.innerWidth + window.scrollX;
        const vh = window.innerHeight + window.scrollY;

        if (left + estimatedMenuWidth > vw) left = vw - estimatedMenuWidth - 8;
        if (left < window.scrollX + 8) left = window.scrollX + 8;

        if (top + estimatedMenuHeight > vh) {
          const spaceAbove = triggerRect.top - window.scrollY;
          if (spaceAbove >= estimatedMenuHeight + sideOffset) {
            top =
              triggerRect.top -
              estimatedMenuHeight -
              sideOffset +
              window.scrollY;
          } else {
            top = vh - estimatedMenuHeight - 8;
          }
        }

        // Set initial position (will be fine-tuned once menu is measured)
        setPosition({ top, left });

        // Fine-tune position once menu is measured (only if menu exists)
        if (menuRef.current) {
          const checkAndFineTune = () => {
            if (!isMounted || !menuRef.current || !triggerRef.current) return;

            const menuRect = menuRef.current.getBoundingClientRect();
            if (menuRect.width === 0 || menuRect.height === 0) {
              // Menu not ready yet, check again
              requestAnimationFrame(checkAndFineTune);
              return;
            }

            // Recalculate with actual menu dimensions
            const currentTriggerRect =
              triggerRef.current.getBoundingClientRect();
            let finalLeft = currentTriggerRect.left + window.scrollX;
            let finalTop =
              currentTriggerRect.bottom + window.scrollY + sideOffset;

            if (align === "center") {
              finalLeft =
                currentTriggerRect.left +
                window.scrollX +
                currentTriggerRect.width / 2 -
                menuRect.width / 2;
            } else if (align === "end") {
              finalLeft =
                currentTriggerRect.right + window.scrollX - menuRect.width;
            }

            const vw = window.innerWidth + window.scrollX;
            const vh = window.innerHeight + window.scrollY;

            if (finalLeft + menuRect.width > vw)
              finalLeft = vw - menuRect.width - 8;
            if (finalLeft < window.scrollX + 8) finalLeft = window.scrollX + 8;

            if (finalTop + menuRect.height > vh) {
              const spaceAbove = currentTriggerRect.top - window.scrollY;
              if (spaceAbove >= menuRect.height + sideOffset) {
                finalTop =
                  currentTriggerRect.top -
                  menuRect.height -
                  sideOffset +
                  window.scrollY;
              } else {
                finalTop = vh - menuRect.height - 8;
              }
            }

            // Update with actual dimensions
            setPosition({ top: finalTop, left: finalLeft });
            positionCalculatedRef.current = true;
          };

          requestAnimationFrame(checkAndFineTune);
        } else {
          positionCalculatedRef.current = true;
        }
      };

      // Calculate position immediately based on trigger
      updatePosition(false);

      // Only update on resize/scroll if menu is open
      let resizeTimeout: NodeJS.Timeout;
      const handleResize = () => {
        if (!isMounted || !open) return;
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (isMounted && open) updatePosition(true);
        }, 150);
      };

      let scrollTimeout: NodeJS.Timeout;
      const handleScroll = () => {
        if (!isMounted || !open) return;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (isMounted && open) updatePosition(true);
        }, 100);
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        isMounted = false;
        clearTimeout(resizeTimeout);
        clearTimeout(scrollTimeout);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }, [open, align, sideOffset, triggerRef, menuRef]);

    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        menuRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (
            forwardedRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node;
        }
      },
      [forwardedRef, menuRef]
    );

    if (!open) return null;

    return (
      <AnimatePresence>
        {open && (
          <motion.div
            ref={combinedRef}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "fixed z-[9999] min-w-[8rem] rounded-md",
              "border border-border bg-popover p-1",
              "text-popover-foreground shadow-lg",
              className
            )}
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              opacity: position && position.top > -9998 ? 1 : 0,
              pointerEvents: position && position.top > -9998 ? "auto" : "none",
              ...style,
            }}
            {...(props as Omit<
              React.HTMLAttributes<HTMLDivElement>,
              | "onDrag"
              | "onDragStart"
              | "onDragEnd"
              | "onAnimationStart"
              | "onAnimationEnd"
            >)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

DropdownContent.displayName = "DropdownContent";

interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
}

export const DropdownItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ className, inset, onClick, children, ...props }, ref) => {
    const { setOpen } = useMenu();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Check if click is directly on a nested button (not the item itself)
      const target = e.target as HTMLElement;
      const clickedButton = target.closest("button");

      // If clicking a nested button, let it handle its own click
      if (clickedButton && clickedButton !== e.currentTarget) {
        // Nested button should stop propagation itself
        return;
      }

      e.stopPropagation();
      // Execute onClick first, then close menu
      onClick?.(e);
      // Close menu after a tiny delay to ensure onClick completes
      setTimeout(() => {
        setOpen(false);
      }, 0);
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center gap-2",
          "rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "hover:bg-accent focus:bg-accent focus:text-accent-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          inset && "pl-8",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DropdownItem.displayName = "DropdownItem";

export const DropdownLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ inset, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));

DropdownLabel.displayName = "DropdownLabel";

export const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));

DropdownSeparator.displayName = "DropdownSeparator";

export const DropdownShortcut = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
    {...props}
  />
));

DropdownShortcut.displayName = "DropdownShortcut";

export const DropdownGroup = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

DropdownGroup.displayName = "DropdownGroup";

