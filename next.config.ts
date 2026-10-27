import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    // Don't print server action arguments in the dev terminal — they can
    // include passwords and messages.
    serverFunctions: false,
  },
};

export default nextConfig;
