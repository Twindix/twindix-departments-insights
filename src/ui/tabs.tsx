import { forwardRef, type ComponentPropsWithoutRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex items-center gap-1 rounded-xl bg-[var(--color-surface)] p-1 text-[var(--color-text-muted)] max-w-full overflow-x-auto scrollbar-thin",
            className,
        )}
        {...props}
    />
));
TabsList.displayName = "TabsList";

const TabsTrigger = forwardRef<
    HTMLButtonElement,
    ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[var(--color-bg)] data-[state=active]:text-[var(--color-text-dark)] data-[state=active]:shadow-sm cursor-pointer",
            className,
        )}
        {...props}
    />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
            className,
        )}
        {...props}
    />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
