import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Without this, Turbopack notices the stray lockfile in the parent
    // folder and picks that as its watch root instead of this project. That
    // pulls .next's own build-cache writes into the watched tree, which then
    // look like source changes and trigger endless rebuilds (pegs CPU/RAM).
    root: __dirname,
  },
};

export default nextConfig;
