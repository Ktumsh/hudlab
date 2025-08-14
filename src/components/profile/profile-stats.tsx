import FollowersDialog from "./followers-dialog";
import FollowingDialog from "./following-dialog";

import type { ProfileStats as ProfileStatsType } from "@/lib/types";

import { useIsSelfProfile } from "@/hooks/use-is-self-profile";

interface ProfileStatsProps {
  stats?: ProfileStatsType;
  username?: string;
}

const ProfileStats = ({ stats, username }: ProfileStatsProps) => {
  const isSelf = useIsSelfProfile();

  return (
    <div className="text-content-muted flex flex-wrap items-center justify-center gap-3 text-sm md:mt-2 md:justify-start">
      <span>
        <strong className="text-base-content">{stats?.uploads ?? 0}</strong>{" "}
        HUDs
      </span>

      {/* Seguidores - clickeable si hay username */}
      {username ? (
        <FollowersDialog username={username}>
          <span className="cursor-pointer">
            <strong className="text-base-content">
              {stats?.followers ?? 0}
            </strong>{" "}
            seguidores
          </span>
        </FollowersDialog>
      ) : (
        <span>
          <strong className="text-base-content">{stats?.followers ?? 0}</strong>{" "}
          seguidores
        </span>
      )}

      {/* Siguiendo - clickeable si hay username */}
      {username ? (
        <FollowingDialog username={username} isOwn={isSelf}>
          <span className="cursor-pointer">
            <strong className="text-base-content">
              {stats?.following ?? 0}
            </strong>{" "}
            seguidos
          </span>
        </FollowingDialog>
      ) : (
        <span>
          <strong className="text-base-content">{stats?.following ?? 0}</strong>{" "}
          seguidos
        </span>
      )}
    </div>
  );
};

export default ProfileStats;
