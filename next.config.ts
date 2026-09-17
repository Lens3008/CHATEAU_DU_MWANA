import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/orm-postgres', 'pg'],
};

export default nextConfig;
