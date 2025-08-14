"use client";

import Link from "next/link";
import { useState } from "react";

import Loader from "@/components/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/user-avatar";
import { useCollectionFollowersData } from "@/hooks/use-collection-followers-data";

interface CollectionFollowersDialogProps {
  collectionId: string;
  followersCount: number;
  children: React.ReactNode;
}

const CollectionFollowersDialog = ({
  collectionId,
  followersCount,
  children,
}: CollectionFollowersDialogProps) => {
  const [open, setOpen] = useState(false);
  const { followers, isLoading } = useCollectionFollowersData(collectionId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Seguidores de la colección • {followersCount}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="size-8" />
            </div>
          ) : followers.length > 0 ? (
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {followers.map((user) => (
                <div
                  key={user.id}
                  className="hover:bg-base-200 flex items-center gap-3 rounded-lg p-3 transition-colors"
                >
                  <UserAvatar
                    profile={{
                      id: user.id,
                      username: user.username,
                      displayName: user.displayName || undefined,
                      avatarUrl: user.avatarUrl || undefined,
                    }}
                    className="size-10"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/${user.username}`}
                      className="block hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      <p className="truncate font-medium">
                        {user.displayName || user.username}
                      </p>
                      <p className="text-base-content/60 truncate text-sm">
                        @{user.username}
                      </p>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-base-content/60 py-8 text-center">
              Esta colección no tiene seguidores
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionFollowersDialog;
