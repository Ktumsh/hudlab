"use client";

import { IconLoader, IconSearch } from "@tabler/icons-react";
import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
} from "frimousse";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";

import type * as React from "react";

import { cn } from "@/lib";

function PureEmojiPicker({
  className,
  ...props
}: React.ComponentProps<typeof EmojiPickerPrimitive.Root>) {
  return (
    <EmojiPickerPrimitive.Root
      locale="es"
      className={cn(
        "bg-base-100 rounded-box isolate flex h-full w-fit flex-col overflow-hidden",
        className,
      )}
      data-slot="emoji-picker"
      {...props}
    />
  );
}

function EmojiPickerSearch({
  className,
  ...props
}: React.ComponentProps<typeof EmojiPickerPrimitive.Search>) {
  return (
    <div
      className={cn("flex h-9 items-center gap-2 border-b px-3", className)}
      data-slot="emoji-picker-search-wrapper"
    >
      <IconSearch className="size-4 shrink-0 opacity-50" />
      <EmojiPickerPrimitive.Search
        placeholder="Buscar..."
        className="placeholder:text-content-muted flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
        data-slot="emoji-picker-search"
        {...props}
      />
    </div>
  );
}

function EmojiPickerRow({ children, ...props }: EmojiPickerListRowProps) {
  return (
    <div {...props} className="scroll-my-1 px-1" data-slot="emoji-picker-row">
      {children}
    </div>
  );
}

function EmojiPickerEmoji({
  emoji,
  className,
  ...props
}: EmojiPickerListEmojiProps) {
  return (
    <button
      {...props}
      className={cn(
        "data-[active]:bg-accent flex size-7 items-center justify-center rounded-sm text-base",
        className,
      )}
      data-slot="emoji-picker-emoji"
    >
      {emoji.emoji}
    </button>
  );
}

function EmojiPickerCategoryHeader({
  category,
  ...props
}: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      {...props}
      className="bg-base-100 text-content-muted px-3 pt-3.5 pb-2 text-xs leading-none"
      data-slot="emoji-picker-category-header"
    >
      {category.label}
    </div>
  );
}

function EmojiPickerContent({
  className,
  ...props
}: React.ComponentProps<typeof EmojiPickerPrimitive.Viewport>) {
  return (
    <EmojiPickerPrimitive.Viewport
      className={cn("relative flex-1 outline-hidden", className)}
      data-slot="emoji-picker-viewport"
      {...props}
    >
      <EmojiPickerPrimitive.Loading
        className="text-content-muted absolute inset-0 flex items-center justify-center"
        data-slot="emoji-picker-loading"
      >
        <IconLoader className="size-4 animate-spin" />
      </EmojiPickerPrimitive.Loading>
      <EmojiPickerPrimitive.Empty
        className="text-content-muted absolute inset-0 flex items-center justify-center text-sm"
        data-slot="emoji-picker-empty"
      >
        No se encontraron emojis.
      </EmojiPickerPrimitive.Empty>
      <EmojiPickerPrimitive.List
        className="pb-1 select-none"
        components={{
          Row: EmojiPickerRow,
          Emoji: EmojiPickerEmoji,
          CategoryHeader: EmojiPickerCategoryHeader,
        }}
        data-slot="emoji-picker-list"
      />
    </EmojiPickerPrimitive.Viewport>
  );
}

function EmojiPickerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full max-w-(--frimousse-viewport-width) min-w-0 items-center gap-1 border-t p-2",
        className,
      )}
      data-slot="emoji-picker-footer"
      {...props}
    >
      <EmojiPickerPrimitive.ActiveEmoji>
        {({ emoji }) =>
          emoji ? (
            <>
              <div className="flex size-7 flex-none items-center justify-center text-lg">
                {emoji.emoji}
              </div>
              <span className="text-secondary-content truncate text-xs">
                {emoji.label}
              </span>
            </>
          ) : (
            <span className="text-content-muted ml-1.5 flex h-7 items-center truncate text-xs">
              Selecciona un emoji...
            </span>
          )
        }
      </EmojiPickerPrimitive.ActiveEmoji>
    </div>
  );
}

function EmojiPicker({
  open,
  onOpenChange,
  className,
  children,
  ...props
}: React.ComponentProps<typeof EmojiPickerPrimitive.Root> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <PureEmojiPicker className={cn("h-[342px]", className)} {...props}>
          <EmojiPickerSearch />
          <EmojiPickerContent />
          <EmojiPickerFooter />
        </PureEmojiPicker>
      </PopoverContent>
    </Popover>
  );
}

export {
  EmojiPicker,
  PureEmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter,
};
