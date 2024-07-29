/** @type {import('next').NextConfig} */

import withNextra from 'nextra'; //patched with https://github.com/shuding/nextra/pull/2460/files
import {withNextVideo} from 'next-video/process';

const getCacheHandler=()=>{
  if (process.env.NODE_ENV === 'production') {
    const module ='/app/cache-handler.mjs';
    return module;
  }
  return undefined;
}

const withNextraConfig = withNextra({
    theme: 'nextra-theme-docs',
    themeConfig: './doc.theme.config.jsx'
});

const nextConfig = {
    cacheHandler: getCacheHandler(),
    distDir: './.next', // Nextra supports custom `nextConfig.distDir`
    reactStrictMode: true,
    pageExtensions: ["ts", "tsx", "mdx"],
    experimental: {
      serverComponentsExternalPackages: ['sequelize', 'sequelize-typescript'],
      mdxRs: true,
      // once this makes it into a release: https://github.com/vercel/next.js/pull/51755
      serverActions: {
        allowedOrigins: ['prompt2.ai', 'dev.prompt2.ai'],
      },
      //   serverActionsBodySizeLimit: '5mb',
    },
  eslint: {  //TO remove this for production
      ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/O',
        permanent: true,
      },
    ]
  }
};


const configWithNextra=withNextraConfig(nextConfig);
const configWithVideo=withNextVideo(configWithNextra);

export default configWithVideo;
