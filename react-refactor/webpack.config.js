const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

/**
 * Most of this setup is directly from Webpack documentation
 * @see https://webpack.js.org/guides/typescript/
 */
module.exports = {
  mode: process.env.NODE_ENV ?? "development",
  entry: "./src/entrypoint.tsx",
  module: {
    rules: [
      /**
       * TS/TSX Loader
       *
       * This will load our React component files
       */
      {
        test: /.tsx?$/,

        /** This uses tsc (TypeScript compiler) under the hood, and reads tsconfig.json for config */
        use: "ts-loader",

        exclude: /node_modules/,
      },

      /**
       * CSS Loader
       *
       * This will load our per-component CSS files
       */
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },

  /**
   * Copies all files from /public to /dist.  This is for **production build only** (not used by dev server)
   *
   * ### Why do we need this?
   *
   * Since we are building our bundle.js to the dist/ folder, we also want our index.html and globals.css files
   * to live in the same directory so that /dist has EVERYTHING needed to serve the app.
   *
   * 1. Run `yarn build`
   * 2. Use live-server (or some other server) and serve the contents of /dist
   */
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "public" }],
    }),
  ],
};
