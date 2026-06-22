/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Дозволяє dev-клієнту й HMR стабільно працювати при відкритті сайту з телефона у локальній мережі.
  allowedDevOrigins: ["192.168.0.156", "100.101.93.178"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
