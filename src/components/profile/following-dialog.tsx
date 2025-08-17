"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import ProfileUsername from "./profile-username";
import { ScrollArea } from "../ui/scroll-area";

import CollectionItem from "@/components/collections/collection-item";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/user-avatar";
import { useFollowingData } from "@/hooks/use-following-data";
import { useUser } from "@/hooks/use-user";
import { useUserFollow } from "@/hooks/use-user-actions";
import { cn } from "@/lib";

interface FollowingDialogProps {
  username: string;
  isOwn: boolean;
  children: React.ReactNode;
}

const FollowingDialog = ({
  username,
  isOwn,
  children,
}: FollowingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "collections">("users");
  const [direction, setDirection] = useState(0);
  const {
    followedUsers,
    followedCollections,
    isLoadingUsers,
    isLoadingCollections,
  } = useFollowingData(username, isOwn);

  const handleTabChange = (newTab: "users" | "collections") => {
    if (newTab === activeTab) return;

    // Determinar dirección: users -> collections = 1 (derecha), collections -> users = -1 (izquierda)
    const newDirection = newTab === "collections" ? 1 : -1;
    setDirection(newDirection);
    setActiveTab(newTab);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>
      <DialogContent className="flex min-h-96 flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center">Seguidos</DialogTitle>
        </DialogHeader>

        {/* Tab buttons */}
        {isOwn && (
          <LayoutGroup>
            <div className="flex border-b">
              <button
                onClick={() => handleTabChange("users")}
                className={cn(
                  "relative flex-1 px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === "users"
                    ? "border-primary text-primary"
                    : "text-content-muted hover:text-base-content",
                )}
              >
                {activeTab === "users" && (
                  <motion.div
                    layoutId="active-following-tab"
                    className="border-primary bg-primary absolute inset-x-0 bottom-0 h-0.5"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                    }}
                  />
                )}
                <span className="relative z-1">Perfiles</span>
              </button>

              <button
                onClick={() => handleTabChange("collections")}
                className={cn(
                  "relative flex-1 px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === "collections"
                    ? "border-primary text-primary"
                    : "text-content-muted hover:text-base-content",
                )}
              >
                {activeTab === "collections" && (
                  <motion.div
                    layoutId="active-following-tab"
                    className="border-primary bg-primary absolute inset-x-0 bottom-0 h-0.5"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                    }}
                  />
                )}
                <span className="relative z-1">Colecciones</span>
              </button>
            </div>
          </LayoutGroup>
        )}

        {/* Tab content */}
        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence initial={false}>
            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ x: direction === 1 ? "100%" : "-100%" }}
                animate={{ x: "0%" }}
                exit={{ x: direction === 1 ? "100%" : "-100%" }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 40,
                }}
                className="absolute inset-0"
              >
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader className="size-8" />
                  </div>
                ) : followedUsers.length > 0 ? (
                  <ScrollArea className="h-full max-h-96">
                    {followedUsers.map((user) => (
                      <FollowingUserItem
                        key={user.id}
                        user={user}
                        onClose={() => setOpen(false)}
                      />
                    ))}
                  </ScrollArea>
                ) : (
                  <div className="text-content-muted flex h-full items-center justify-center">
                    No sigues a ningún perfil
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "collections" && isOwn && (
              <motion.div
                key="collections"
                initial={{ x: direction === 1 ? "100%" : "-100%" }}
                animate={{ x: "0%" }}
                exit={{ x: direction === 1 ? "100%" : "-100%" }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 40,
                }}
                className="absolute inset-0"
              >
                {isLoadingCollections ? (
                  <div className="flex justify-center py-8">
                    <Loader className="size-8" />
                  </div>
                ) : followedCollections.length > 0 ? (
                  <ScrollArea className="h-full max-h-96">
                    <div className="grid h-full grid-cols-2 gap-4">
                      {followedCollections.map((collection) => (
                        <div key={collection.id} onClick={() => setOpen(false)}>
                          <CollectionItem collection={collection} />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-content-muted flex h-full items-center justify-center">
                    No sigues ninguna colección
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface FollowingUserItemProps {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isFollowing?: boolean;
  };
  onClose: () => void;
}

function FollowingUserItem({ user, onClose }: FollowingUserItemProps) {
  const { toggleFollow, isToggling, isFollowing } = useUserFollow(
    user.username,
    user.isFollowing,
  );
  const { user: currentUser } = useUser();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isOwnProfile = user.username === currentUser?.profile?.username;

  const handleToggleFollow = async () => {
    // Si está siguiendo al usuario, mostrar confirmación
    if (isFollowing) {
      setShowConfirmDialog(true);
    } else {
      // Si no lo está siguiendo, seguir directamente
      await toggleFollow();
    }
  };

  const confirmUnfollow = async () => {
    await toggleFollow();
    setShowConfirmDialog(false);
  };

  const showFollowButton = user.isFollowing !== undefined && !isOwnProfile;

  return (
    <>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3">
        <Link href={`/${user.username}/huds`} className="rounded-full">
          <UserAvatar
            profile={{
              id: user.id,
              username: user.username,
              displayName: user.displayName || undefined,
              avatarUrl: user.avatarUrl || undefined,
            }}
            className="size-10"
          />
        </Link>
        <div className="flex max-w-full grow flex-col overflow-hidden">
          <Link href={`/${user.username}`} onClick={onClose} className="w-fit">
            <p className="truncate text-sm font-medium">
              {user.displayName || user.username}
            </p>
          </Link>
          <ProfileUsername
            username={user.username}
            className="text-xs"
            logoClassName="size-4"
            logoSize={16}
          />
        </div>

        {showFollowButton && (
          <Button
            size="sm"
            variant={isFollowing ? "default" : "primary"}
            onClick={handleToggleFollow}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader className="size-4" />
            ) : isFollowing ? (
              "Siguiendo"
            ) : (
              "Seguir"
            )}
          </Button>
        )}
      </div>

      {/* Dialog de confirmación para dejar de seguir */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center gap-4 pb-4">
            <DialogTitle className="sr-only">¿Dejar de seguir?</DialogTitle>
            <UserAvatar
              profile={{
                id: user.id,
                username: user.username,
                displayName: user.displayName || undefined,
                avatarUrl: user.avatarUrl || undefined,
              }}
              className="size-20"
            />
            <DialogDescription className="text-base-content text-center text-pretty">
              ¿Quieres dejar de seguir a{" "}
              <ProfileUsername
                username={user.username}
                className="text-neutral-content font-medium"
              />
              ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              outline
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="error"
              onClick={confirmUnfollow}
              disabled={isToggling}
              className="flex-1"
            >
              {isToggling ? <Loader className="size-4" /> : "Dejar de seguir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FollowingDialog;
