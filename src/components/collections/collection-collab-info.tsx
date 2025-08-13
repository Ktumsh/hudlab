"use client";

import Link from "next/link";

import ProfileUsername from "../profile/profile-username";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import UserAvatar from "../user-avatar";

import type { CollectionPreviewWithDetails } from "@/lib/types";

interface CollectionCollabInfoProps {
  collection?: CollectionPreviewWithDetails;
}

const CollectionCollabInfo = ({ collection }: CollectionCollabInfoProps) => {
  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex items-center justify-between gap-4">
          <div className="group avatar-group -space-x-3 overflow-visible md:-ms-1.5">
            <Link
              href={`/${collection?.profile?.username}/huds`}
              scroll={false}
            >
              <UserAvatar
                title={collection?.profile?.displayName}
                profile={collection?.profile}
                className="avatar size-9 border-3 transition-transform hover:-translate-y-1"
              />
            </Link>
            {collection?.permissions &&
              collection?.permissions.slice(0, 9).map((perm) => (
                <Popover key={perm.profileId}>
                  <PopoverTrigger asChild>
                    <div className="relative cursor-pointer">
                      <UserAvatar
                        title={perm.profile.displayName}
                        profile={perm.profile}
                        className="avatar size-9 border-3"
                      />
                      <div className="bg-base-100/50 absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100"></div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent>
                    <h1 className="pb-3 font-medium">Colaboradores</h1>
                    <ScrollArea className="h-60">
                      <div className="space-y-3">
                        {collection?.permissions?.map((perm) => (
                          <div
                            key={perm.profileId}
                            className="grid grid-cols-[auto_1fr_auto] gap-3"
                          >
                            <Link
                              href={`/${perm.profile.username}/huds`}
                              className="rounded-full"
                            >
                              <UserAvatar
                                title={perm.profile.displayName}
                                profile={perm.profile}
                                className="avatar size-9"
                              />
                            </Link>
                            <div className="flex max-w-full grow flex-col overflow-hidden">
                              <p className="cursor-alias truncate text-sm font-medium hover:underline">
                                {perm.profile.displayName ||
                                  perm.profile.username}
                              </p>
                              <ProfileUsername
                                username={perm.profile.username}
                                className="text-xs"
                                logoClassName="size-4 mr-0.5"
                                logoSize={16}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              ))}
            {collection?.permissions && collection?.permissions.length > 9 && (
              <Avatar className="avatar avatar-placeholder size-9 border-3 transition-transform hover:-translate-y-1">
                <AvatarFallback>
                  +{collection?.permissions.length - 9}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
        <p className="text-sm">
          de{" "}
          <Link
            href={`/${collection?.profile?.username}/huds`}
            scroll={false}
            className="text-neutral-content font-medium"
          >
            {collection?.profile?.displayName}
          </Link>{" "}
          y {collection?.permissions?.length ?? 0} colaboradores
        </p>
      </div>
    </>
  );
};

export default CollectionCollabInfo;
