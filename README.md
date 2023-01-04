This repository contains the refactored code for a subscriber project. The original project repository [can be found here](https://github.com/ivan00stojanovic/TickyToey).

Please see [this YouTube video]() for a full walkthrough of this repository.

## Quickstart

There are four examples in this repository that show how the `/original` project could be refactored using several different libraries and patterns. I suggest reading through them in the following order.

1. Vanilla Refactor - this is the _closest_ representation of the original project and I highly recommend starting here since the remaining examples build off of the patterns here.
2. Vanilla TypeScript Refactor - this is the Vanilla Refactor reproduced using TypeScript with an additional compile step (required to compile the TypeScript to JavaScript that can run in the browser)
3. Alpine.js Refactor - this shows how we can use a lightweight framework like Alpine.js to reduce the boilerplate needed
4. React Refactor - this shows a React implementation of the project, which is a much more _declarative_ approach than the vanilla implementations, which are mostly _imperative_. See my post on [declarative vs. imperative programming](https://www.zachgollwitzer.com/posts/imperative-programming).
