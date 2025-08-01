import { IconMoodSmile } from "@tabler/icons-react";

import type { Emoji } from "frimousse";
import type { ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Textarea } from "@/components/ui/textarea";

interface CommentFieldProps {
  ref?: React.Ref<HTMLTextAreaElement>;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onEmoji: (emoji: Emoji) => void;
  emojiOpen: boolean;
  setEmojiOpen: (open: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  actionButtonText?: string;
  placeholder?: string;
  isLoading?: boolean;
}

const CommentField = ({
  ref,
  value,
  onChange,
  onEmoji,
  emojiOpen,
  setEmojiOpen,
  onCancel,
  onSave,
  actionButtonText = "Enviar",
  placeholder = "Responder...",
  isLoading = false,
}: CommentFieldProps) => {
  return (
    <div className="relative mt-2 flex flex-col gap-2">
      <Textarea
        ref={ref}
        rows={1}
        placeholder={placeholder}
        className="input-neutral input-ghost bg-base-200 focus-visible:bg-base-300! min-h-14 pr-12 focus:ring-0! md:text-base"
        value={value}
        onChange={onChange}
      />
      <EmojiPicker
        open={emojiOpen}
        onOpenChange={setEmojiOpen}
        onEmojiSelect={onEmoji}
      >
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-1 hidden md:flex"
        >
          <IconMoodSmile className="size-7" />
        </Button>
      </EmojiPicker>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          disabled={!value.trim() || isLoading}
          size="sm"
          variant="primary"
          onClick={onSave}
        >
          {isLoading ? "Guardando..." : actionButtonText}
        </Button>
      </div>
    </div>
  );
};

export default CommentField;
