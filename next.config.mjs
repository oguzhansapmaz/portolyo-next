/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/portfolio/index.html",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
