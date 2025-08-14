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
    display_override: ["window-controls-overlay"],
    orientation: "portrait",
    protocol_handlers: [
      {
        protocol: "web+hudlab",
        url: "/?protocol=%s",
      },
    ],
    icons: [
      {
        src: "/logo/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
