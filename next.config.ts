import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['api.atlassian.com'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
};

export default nextConfig;
