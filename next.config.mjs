/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Дозволяє dev-клієнту й HMR стабільно працювати при відкритті сайту з телефона у локальній мережі.
  allowedDevOrigins: ["192.168.0.156", "100.101.93.178"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avwwtzlaxlfvfciqgypb.supabase.co",
        pathname: "/storage/v1/object/public/house-images/**",
      },
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
