/** @type {import('next').NextConfig} */
const nextConfig = {
  // تعطيل ESLint أثناء البناء (نتحقق منه منفصلاً)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // صور Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
