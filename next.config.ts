import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
let repo = "";
if (isGithubActions && process.env.GITHUB_REPOSITORY) {
  const parts = process.env.GITHUB_REPOSITORY.split("/");
  const repoName = parts[1] || "";
  if (!repoName.endsWith(".github.io")) {
    repo = `/${repoName}`;
  }
}

const nextConfig: NextConfig = {
  basePath: repo || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
