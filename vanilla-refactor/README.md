## Running Project

There are many ways you _could_ run this, but I have chosen a simple approach that is not optimized.

Instead of using a module bundler like Webpack to compile all TypeScript files into a single, CommonJS `bundle.js` that is included in `index.html`, this project simply uses the TypeScript compiler, `tsc` to read all the `.ts` files in the `/js` directory and compile them to ES6 modules in `/dist`. We can then include `app.js` in `index.html` as a `type="module"` and the example will work! This is unoptimized since none of the compiled JavaScript is minified or bundled.

The only challenge we have locally is getting the TypeScript compiler to rebuild all of the source files on each change. Again, there are many ways to achieve this, but I have chosen the `tsc-watch` package, which simply re-runs the `tsc` build command any time a `.ts` file changes.

To run the project, there are two steps:

1. Run `yarn dev`
2. Open `index.html` with live-server (there is a nice [VSCode extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for this)
