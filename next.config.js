/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env:{
    REACT_APP_PINATA_KEY : process.env.REACT_APP_PINATA_KEY,
    REACT_APP_PINATA_SECRET: process.env.REACT_APP_PINATA_SECRET,
    REACT_APP_PINATA_JWT : process.env.REACT_APP_PINATA_JWT,
    REACT_APP_ALCHEMY_KEY: process.env.REACT_APP_ALCHEMY_KEY,
    REACT_APP_ALCHEMY_URL: process.env.REACT_APP_ALCHEMY_URL,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    API_URL: process.env.API_URL,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
