import { getUploads } from "@/db/querys/uploads-querys";

import GalleryFeed from "./_components/gallery-feed";

export default async function FeedPage() {
  // Carga inicial del servidor (como Pinterest)
  const initialData = await getUploads({
    limit: 20,
    filters: {
      searchText: "",
      tags: [],
      platform: undefined,
      releaseYear: undefined,
      isFavorited: false,
      sortBy: "newest",
    },
  });

  return <GalleryFeed initialData={initialData} />;
}
