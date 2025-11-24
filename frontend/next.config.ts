import type { NextConfig } from "next";

const remotePatterns: Required<NonNullable<NextConfig["images"]>>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "images.igdb.com",
  },
  {
    protocol: "https",
    hostname: "i.pravatar.cc",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "5050",
  },
];

const addPatternFromEnv = (url?: string | null) => {
  if (!url) return;
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol.replace(":", "") as "http" | "https";
    const pattern = {
      protocol,
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
    };
    const exists = remotePatterns.some(
      (item) =>
        item.hostname === pattern.hostname &&
        item.protocol === pattern.protocol &&
        ("port" in item ? item.port : undefined) === ("port" in pattern ? pattern.port : undefined)
    );
    if (!exists) {
      remotePatterns.push(pattern);
    }
  } catch {
    // ignore malformed url
  }
};

addPatternFromEnv(process.env.NEXT_PUBLIC_API_URL);
addPatternFromEnv(process.env.NEXT_PUBLIC_UPLOAD_BASE_URL);

const shouldDisableOptimization =
  process.env.NODE_ENV !== 'production' &&
  remotePatterns.some((pattern) => pattern.hostname === 'localhost');

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns,
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true' || shouldDisableOptimization
  },
  // Enable compression for better performance
  compress: true,
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Remove powered-by header for security
  poweredByHeader: false,
  turbopack: {
    // Explicitly pin the project root so Next patches the correct lockfile
    root: __dirname,
  },
};

export default nextConfig;
