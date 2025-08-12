import type { ProfileStats as ProfileStatsType } from "@/lib/types";

interface ProfileStatsProps {
  stats?: ProfileStatsType;
}

const ProfileStats = ({ stats }: ProfileStatsProps) => {
  return (
    <div className="text-content-muted flex flex-wrap items-center justify-center gap-3 text-sm md:mt-2 md:justify-start">
      <span>
        <strong className="text-base-content">{stats?.uploads ?? 0}</strong>{" "}
        HUDs
      </span>
      <span>
        <strong className="text-base-content">{stats?.followers ?? 0}</strong>{" "}
        seguidores
      </span>
      <span>
        <strong className="text-base-content">{stats?.following ?? 0}</strong>{" "}
        siguiendo
      </span>
    </div>
  );
};

export default ProfileStats;
