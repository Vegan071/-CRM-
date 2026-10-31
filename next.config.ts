import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  experimental: {
    optimizePackageImports: ["@siberiacancode/reactuse", "lucide-react", "@base-ui/react"],
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
