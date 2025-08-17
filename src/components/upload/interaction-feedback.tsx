"use client";

import {
  IconHeart,
  IconHeartFilled,
  IconBookmark,
  IconBookmarkFilled,
  IconShare,
  IconMessageCircle,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";

interface InteractionFeedbackProps {
  initialLikes?: number;
  initialBookmarks?: number;
  initialComments?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  variant?: "compact" | "full";
  className?: string;
}

interface FloatingHeart {
  id: string;
  x: number;
  y: number;
}

export default function InteractionFeedback({
  initialLikes = 0,
  initialBookmarks = 0,
  initialComments = 0,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onBookmark,
  onShare,
  onComment,
  variant = "full",
  className = "",
}: InteractionFeedbackProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);

  // Optimistic like with floating hearts animation
  const handleLike = useCallback(() => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1));

    if (newLiked) {
      // Create floating hearts animation
      const newHearts: FloatingHeart[] = Array.from({ length: 3 }, (_, i) => ({
        id: `heart-${Date.now()}-${i}`,
        x: Math.random() * 40 - 20, // Random position around button
        y: Math.random() * 20 - 10,
      }));

      setFloatingHearts((prev) => [...prev, ...newHearts]);

      // Remove hearts after animation
      setTimeout(() => {
        setFloatingHearts((prev) =>
          prev.filter(
            (heart) => !newHearts.some((newHeart) => newHeart.id === heart.id),
          ),
        );
      }, 2000);
    }

    onLike?.();
  }, [liked, onLike]);

  // Optimistic bookmark
  const handleBookmark = useCallback(() => {
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    setBookmarks((prev) => (newBookmarked ? prev + 1 : prev - 1));
    onBookmark?.();
  }, [bookmarked, onBookmark]);

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Like Button */}
        <div className="relative">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleLike}
            className={`transition-colors ${
              liked ? "text-error hover:text-error/80" : "hover:text-error"
            }`}
          >
            {liked ? (
              <IconHeartFilled className="size-4" />
            ) : (
              <IconHeart className="size-4" />
            )}
          </Button>

          {/* Floating hearts */}
          <AnimatePresence>
            {floatingHearts.map((heart) => (
              <motion.div
                key={heart.id}
                initial={{
                  opacity: 1,
                  scale: 0.8,
                  x: heart.x,
                  y: heart.y,
                }}
                animate={{
                  opacity: 0,
                  scale: 1.2,
                  x: heart.x + (Math.random() - 0.5) * 40,
                  y: heart.y - 60,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-error pointer-events-none absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <IconHeartFilled className="size-3" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <span className="text-base-content/60 text-xs">
          {formatCount(likes)}
        </span>

        {/* Bookmark Button */}
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleBookmark}
          className={`transition-colors ${
            bookmarked
              ? "text-warning hover:text-warning/80"
              : "hover:text-warning"
          }`}
        >
          {bookmarked ? (
            <IconBookmarkFilled className="size-4" />
          ) : (
            <IconBookmark className="size-4" />
          )}
        </Button>

        <span className="text-base-content/60 text-xs">
          {formatCount(bookmarks)}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-4">
        {/* Like Button */}
        <div className="relative flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLike}
            className={`transition-all duration-200 ${
              liked
                ? "text-error hover:text-error/80 scale-110"
                : "hover:text-error hover:scale-105"
            }`}
          >
            <motion.div
              animate={liked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {liked ? (
                <IconHeartFilled className="size-5" />
              ) : (
                <IconHeart className="size-5" />
              )}
            </motion.div>
          </Button>

          <span className="text-sm font-medium">{formatCount(likes)}</span>

          {/* Floating hearts */}
          <AnimatePresence>
            {floatingHearts.map((heart) => (
              <motion.div
                key={heart.id}
                initial={{
                  opacity: 1,
                  scale: 0.8,
                  x: heart.x,
                  y: heart.y,
                }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  x: heart.x + (Math.random() - 0.5) * 60,
                  y: heart.y - 80,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-error pointer-events-none absolute"
                style={{
                  left: "20px",
                  top: "20px",
                }}
              >
                <IconHeartFilled className="size-4" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Comment Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={onComment}
          className="hover:text-info"
        >
          <IconMessageCircle className="size-5" />
        </Button>
        <span className="text-sm font-medium">
          {formatCount(initialComments)}
        </span>

        {/* Share Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={onShare}
          className="hover:text-success"
        >
          <IconShare className="size-5" />
        </Button>
      </div>

      {/* Bookmark Button */}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleBookmark}
          className={`transition-all duration-200 ${
            bookmarked
              ? "text-warning hover:text-warning/80 scale-110"
              : "hover:text-warning hover:scale-105"
          }`}
        >
          <motion.div
            animate={bookmarked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {bookmarked ? (
              <IconBookmarkFilled className="size-5" />
            ) : (
              <IconBookmark className="size-5" />
            )}
          </motion.div>
        </Button>
        <span className="text-sm font-medium">{formatCount(bookmarks)}</span>
      </div>
    </div>
  );
}
