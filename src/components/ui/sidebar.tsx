"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Componente 1: SidebarGroupLabel (CORRIGIDO)
// -----------------------------------------------------------------------------
const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-label"
    className={cn(
      "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
      className
    )}
    {...props}
  />
));
SidebarGroupLabel.displayName = "SidebarGroupLabel";


// -----------------------------------------------------------------------------
// Componente 2: SidebarGroupAction (CORRIGIDO)
// -----------------------------------------------------------------------------
const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    data-sidebar="group-action"
    className={cn(
      "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
      className
    )}
    {...props}
  />
));
SidebarGroupAction.displayName = "SidebarGroupAction";


// -----------------------------------------------------------------------------
// Componente 3: SidebarMenuButton (CORRIGIDO)
// -----------------------------------------------------------------------------
interface SidebarMenuButtonProps
  extends React.HTMLAttributes<HTMLElement> {
  href?: string;
  size?: "default" | "sm";
  isActive?: boolean;
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  SidebarMenuButtonProps
>(({ className, size = "default", isActive, href, ...props }, ref) => {
  const commonProps = {
    "data-sidebar": "menu-button",
    "data-size": size,
    "data-active": isActive,
    className: cn(
      "flex h-9 w-full shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-sidebar-foreground outline-none ring-sidebar-ring transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
      size === "sm" && "h-8 px-2 text-xs",
      className
    ),
    ...props,
  };

  if (href) {
    return (
      <Link href={href} {...commonProps} ref={ref as React.Ref<HTMLAnchorElement>} />
    );
  }

  return (
    <button type="button" {...commonProps} ref={ref as React.Ref<HTMLButtonElement>} />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";


// -----------------------------------------------------------------------------
// Exportação
// -----------------------------------------------------------------------------
export {
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenuButton
};
