import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "hudlab-web",
    name: "HUDLab",
    short_name: "HUDLab",
    description:
      "Explora, organiza y comparte las mejores interfaces de videojuegos. Una galería colaborativa para diseñadores y amantes del UI/UX en gaming.",
    theme_color: "#000000",
    background_color: "#000000",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    protocol_handlers: [
      {
        protocol: "web+hudlab",
        url: "/?protocol=%s",
      },
    ],
    icons: [
      {
        sizes: "192x192",
        src: "/logo/web-app-manifest-192x192.png",
        type: "image/png",
        purpose: "maskable",
      },
      {
        sizes: "512x512",
        src: "/logo/web-app-manifest-512x512.png",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
