import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Короткие адреса из меню сайта ведут в каталог с нужным фильтром
  async redirects() {
    return [
      { source: "/new", destination: "/catalog?filter=new", permanent: false },
      { source: "/sale", destination: "/catalog?filter=sale", permanent: false },
      { source: "/popular", destination: "/catalog?sort=popular", permanent: false },
    ];
  },
};

export default nextConfig;
