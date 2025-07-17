import withSerwistInit from "@serwist/next";
import { NextConfig } from "next";

import { isProductionEnvironment } from "@/lib";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/media/**",
      },
    ],
  },
};

const withPWA = withSerwistInit({
  disable: !isProductionEnvironment,
  swSrc: "sw.ts",
  swDest: "public/sw.js",
});

export default withPWA({
  ...nextConfig,
});
