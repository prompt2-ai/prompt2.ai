/** @type {import('next').NextConfig} */

import withNextra from 'nextra'; //patched with https://github.com/shuding/nextra/pull/2460/files
const withNextraConfig = withNextra({
    theme: 'nextra-theme-docs',
    themeConfig: './doc.theme.config.jsx'
});

const nextConfig = {
    distDir: './.next', // Nextra supports custom `nextConfig.distDir`
    reactStrictMode: true,
    pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
    experimental: {
      mdxRs: true,
      // once this makes it into a release: https://github.com/vercel/next.js/pull/51755
      serverActions: {
        allowedOrigins: ['prompt2.ai', '*.prompt2.ai'],
      },
      //   serverActionsBodySizeLimit: '5mb',
    }
};

export default withNextraConfig(nextConfig);
