/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DEPLOYMENT: process.env.DEPLOYMENT || 'local',
  },
  serverExternalPackages: ['@neondatabase/serverless'],
};

module.exports = nextConfig;
