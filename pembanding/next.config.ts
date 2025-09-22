<<<<<<< HEAD

=======
>>>>>>> 7cb168a (Initialized workspace with Firebase Studio)
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
<<<<<<< HEAD
=======
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
>>>>>>> 7cb168a (Initialized workspace with Firebase Studio)
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
<<<<<<< HEAD
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
    unoptimized: true,
  },
  experimental: {
  },
  allowedDevOrigins: [
      'https://6000-firebase-studio-1757309801373.cluster-qxqlf3vb3nbf2r42l5qfoebdry.cloudworkstations.dev',
      'https://3001-firebase-mk-rentcar-1758178901833.cluster-y75up3teuvc62qmnwys4deqv6y.cloudworkstations.dev',
  ],
=======
    ],
  },
>>>>>>> 7cb168a (Initialized workspace with Firebase Studio)
};

export default nextConfig;
