"use client";

import ProfileActions from "./profile-actions";
import ProfileStats from "./profile-stats";
import ProfileUsername from "./profile-username";

import type { ProfileData } from "@/lib/types";

import { useProfileActions } from "@/app/[profile]/_hooks/use-profile-actions";
import { AvatarUploader } from "@/app/me/_components/avatar-uploader";
import { useProfile } from "@/hooks/profile/use-profile";
import { useIsMobile } from "@/hooks/use-mobile";

const ProfileHeader = ({
  username,
  initialData,
}: {
  username: string;
  initialData: ProfileData;
}) => {
  const { data, mutate, isLoading } = useProfile({ username, initialData });

  const profile = data?.profile;
  const stats = data?.stats;
  const isFollowing = !!data?.isFollowing;

  const isMobile = useIsMobile();

  const { toggleFollow, isToggling } = useProfileActions({
    username: profile?.username ?? username,
    mutate,
  });

  return (
    <div className="mt-14 flex items-center px-4 py-6 pt-4 md:mt-0 md:pt-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 md:flex-row md:gap-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <AvatarUploader profile={profile!} />
          <div>
            <h1 className="text-neutral-content mb-1 truncate text-2xl font-bold md:hidden">
              {profile?.displayName}
            </h1>
            <ProfileUsername
              username={profile?.username ?? username}
              className="md:hidden"
            />
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h1
              title={profile?.displayName}
              className="text-neutral-content hidden max-w-xs truncate text-2xl font-bold md:block"
            >
              {profile?.displayName}
            </h1>
            {isMobile && <ProfileStats stats={stats} />}
            {profile?.bio && (
              <p className="text-center text-xs text-pretty md:hidden">
                {profile.bio}
              </p>
            )}
            <ProfileActions
              profile={profile}
              onToggleFollow={toggleFollow}
              isFollowing={isFollowing}
              isToggling={isToggling}
              isLoading={isLoading}
            />
          </div>
          <ProfileUsername
            username={profile?.username ?? username}
            className="hidden md:block"
          />
          {!isMobile && <ProfileStats stats={stats} />}
          {profile?.bio && (
            <p className="mt-2 hidden text-sm text-pretty md:block">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
