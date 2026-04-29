/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      unoptimized: true,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "sandbox.sslcommerz.com",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "securepay.sslcommerz.com",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "**.cloudinary.com",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "i.ibb.co.com",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "docs.google.com",
          pathname: "/**",
        },
      ],
    },
    trailingSlash: true,
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.externals = config.externals || [];
        config.externals.push({ canvas: "commonjs canvas" });
      }
  
      config.module.rules.push({
        test: /\.pdf$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]",
          },
        },
      });
      return config;
    }
  };
  
  export default nextConfig;
  