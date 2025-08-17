"use client";

import { IconBulbFilled, IconHash } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTED_HASHTAGS = [
  "gaming",
  "ui",
  "hud",
  "fps",
  "moba",
  "battleroyal",
  "design",
  "overlay",
  "interface",
  "esports",
  "stream",
  "twitch",
  "youtube",
  "gamer",
  "setup",
  "custom",
  "minimalist",
  "clean",
  "modern",
  "colorful",
  "dark",
  "neon",
  "competitive",
  "casual",
  "pro",
  "montage",
  "highlight",
  "gameplay",
];

const MAX_HASHTAGS = 10;

interface HashtagExtractorProps {
  text: string;
  onTextChange: (text: string) => void;
  onHashtagsChange: (hashtags: string[]) => void;
}

export default function HashtagExtractor({
  text,
  onTextChange,
  onHashtagsChange,
}: HashtagExtractorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const extractedHashtags = useMemo(() => {
    // Solo contar hashtags "completos": seguidos de espacio o fin de string
    const hashtagRegex = /#([\w\u00c0-\u024f\u1e00-\u1eff]+)(?=\s|$)/gi;
    const matches = Array.from(text.matchAll(hashtagRegex)).map(
      (m) => m[1] || "",
    );
    return [...new Set(matches.map((tag) => tag.toLowerCase()))];
  }, [text]);

  const filteredSuggestions = useMemo(() => {
    return SUGGESTED_HASHTAGS.filter(
      (tag) =>
        !extractedHashtags.includes(tag.toLowerCase()) &&
        extractedHashtags.length < MAX_HASHTAGS,
    );
  }, [extractedHashtags]);

  useEffect(() => {
    onHashtagsChange(extractedHashtags);
  }, [extractedHashtags, onHashtagsChange]);

  const handleTextChange = useCallback(
    (value: string) => {
      onTextChange(value);
    },
    [onTextChange],
  );

  const addHashtag = useCallback(
    (hashtag: string) => {
      if (extractedHashtags.length >= MAX_HASHTAGS) return;

      const newText =
        text + (text && !text.endsWith(" ") ? " " : "") + `#${hashtag}`;
      handleTextChange(newText);
    },
    [text, extractedHashtags.length, handleTextChange],
  );

  const removeHashtag = useCallback(
    (hashtag: string) => {
      const hashtagPattern = new RegExp(`#${hashtag}(?=\\s|$)`, "gi");
      const newText = text
        .replace(hashtagPattern, "")
        .replace(/\s+/g, " ")
        .trim();
      handleTextChange(newText);
    },
    [text, handleTextChange],
  );

  return (
    <div className="space-y-3">
      {/* Text Input */}
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Describe tu HUD... Usa #hashtags para mejor visibilidad"
          className="min-h-20"
          rows={4}
        />

        {extractedHashtags.length > 0 && (
          <div className="text-base-content/60 absolute right-3 bottom-2 text-xs">
            <IconHash className="mr-1 inline-block h-3 w-3" />
            {extractedHashtags.length}/{MAX_HASHTAGS}
          </div>
        )}
      </div>

      {extractedHashtags.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium">Etiquetas extraídas</h4>
          <div className="flex flex-wrap gap-2">
            {extractedHashtags.map((hashtag) => (
              <Button
                key={hashtag}
                type="button"
                size="xs"
                variant="primary"
                onClick={() => removeHashtag(hashtag)}
              >
                <IconHash className="size-3" />
                {hashtag}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium">Etiquetas sugeridas</h4>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            {showSuggestions ? "Ocultar" : "Mostrar"}
          </Button>
        </div>

        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2">
                {filteredSuggestions.slice(0, 15).map((hashtag) => (
                  <Button
                    key={hashtag}
                    size="xs"
                    onClick={() => addHashtag(hashtag)}
                    className="font-normal"
                  >
                    <IconHash className="size-3" />
                    {hashtag}
                  </Button>
                ))}
              </div>

              {filteredSuggestions.length === 0 && (
                <p className="text-base-content/60 py-2 text-center text-xs">
                  {extractedHashtags.length >= MAX_HASHTAGS
                    ? `Máximo ${MAX_HASHTAGS} hashtags alcanzado`
                    : "No hay más sugerencias disponibles"}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div className="text-content-muted flex items-end text-xs">
        <IconBulbFilled className="text-warning mr-1.5 size-4" />
        <p>
          Usa # seguido de una palabra para crear etiquetas. Ej: #gaming #ui
          #design
        </p>
      </div>
    </div>
  );
}
