"use client";

import Link from "next/link";
import { useState } from "react";

import ProfileUsername from "./profile-username";
import { ScrollArea } from "../ui/scroll-area";

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
import { useFollowersData } from "@/hooks/use-followers-data";
import { useIsSelfProfile } from "@/hooks/use-is-self-profile";
import { useUser } from "@/hooks/use-user";
import { useUserFollow, useRemoveFollower } from "@/hooks/use-user-actions";

interface FollowersDialogProps {
  username: string;
  children: React.ReactNode;
}

const FollowersDialog = ({ username, children }: FollowersDialogProps) => {
  const [open, setOpen] = useState(false);
  const { followers, isLoading } = useFollowersData(username);
  const isSelf = useIsSelfProfile();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <div onClick={() => setOpen(true)} className="cursor-pointer">
          {children}
        </div>
        <DialogContent className="flex min-h-96 flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center">Seguidores</DialogTitle>
          </DialogHeader>

          <div className="relative flex-1 overflow-hidden">
            <div className="absolute inset-0">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="size-8" />
                </div>
              ) : followers.length > 0 ? (
                <ScrollArea className="h-full max-h-96">
                  {followers.map((user) => (
                    <FollowerItem
                      key={user.id}
                      follower={user}
                      isSelf={isSelf}
                      profileUsername={username}
                      onClose={() => setOpen(false)}
                    />
                  ))}
                </ScrollArea>
              ) : (
                <div className="text-content-muted flex h-full items-center justify-center">
                  No tiene seguidores
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface FollowerItemProps {
  follower: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isFollowing?: boolean;
  };
  isSelf: boolean;
  profileUsername: string;
  onClose: () => void;
}

function FollowerItem({
  follower,
  isSelf,
  profileUsername,
  onClose,
}: FollowerItemProps) {
  const { toggleFollow, isToggling, isFollowing } = useUserFollow(
    follower.username,
    follower.isFollowing,
  );
  const { removeFollower, isRemoving } = useRemoveFollower(profileUsername);
  const { user: currentUser } = useUser();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isOwnProfile = follower.username === currentUser?.profile?.username;

  const handleToggleFollow = async () => {
    await toggleFollow();
  };

  const handleRemoveFollower = async () => {
    const result = await removeFollower(follower.username);
    if (result) {
      setShowConfirmDialog(false);
    }
  };

  // Cuando veo mi perfil (isSelf), solo mostrar botón eliminar
  // Cuando veo el perfil de otro (!isSelf), solo mostrar botón seguir/siguiendo
  const showFollowButton =
    !isSelf && !isOwnProfile && follower.isFollowing !== undefined;
  const showRemoveButton = isSelf && !isOwnProfile;

  return (
    <>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2">
        <Link href={`/${follower.username}/huds`} className="rounded-full">
          <UserAvatar
            profile={{
              id: follower.id,
              username: follower.username,
              displayName: follower.displayName || undefined,
              avatarUrl: follower.avatarUrl || undefined,
            }}
            className="size-10"
          />
        </Link>
        <div className="flex max-w-full grow flex-col overflow-hidden">
          <Link
            href={`/${follower.username}`}
            onClick={onClose}
            className="w-fit"
          >
            <p className="truncate text-sm font-medium">
              {follower.displayName || follower.username}
            </p>
          </Link>
          <ProfileUsername
            username={follower.username}
            className="text-xs"
            logoClassName="size-4"
            logoSize={16}
          />
        </div>
        {showRemoveButton && (
          <Button
            size="sm"
            onClick={() => setShowConfirmDialog(true)}
            className="text-error"
            disabled={isRemoving}
          >
            {isRemoving ? <Loader className="size-4" /> : "Eliminar"}
          </Button>
        )}
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
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center gap-4 pb-4">
            <DialogTitle>¿Eliminar seguidor?</DialogTitle>
            <UserAvatar
              profile={{
                id: follower.id,
                username: follower.username,
                displayName: follower.displayName || undefined,
                avatarUrl: follower.avatarUrl || undefined,
              }}
              className="size-20"
            />
            <DialogDescription className="text-base-content text-center text-pretty">
              No se le avisará a{" "}
              <ProfileUsername
                username={follower.username}
                className="text-neutral-content font-medium"
              />{" "}
              que ha sido eliminado de tus seguidores.
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
              onClick={handleRemoveFollower}
              disabled={isRemoving}
              className="flex-1"
            >
              {isRemoving ? <Loader className="size-4" /> : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FollowersDialog;
