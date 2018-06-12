# Regrettable
A JS/TS async operations cancellation module over native promises (does not exist yet).

## Background
Itay is using Bluebird promises in his project. While he enjoys the API in general, the main reason for not switching to native promises is its sound and useful cancellation API.

He loves using async/await but cannot use Node's native support for async functions - it breaks the cancellation propagation of Bluebird promises.

Since he is also using TypeScript (for many reasons), a solution was found in [cancelable-awaiter](https://www.npmjs.com/package/cancelable-awaiter) that makes Bluebird cancellation work in conjunction with async functions - as long as they are transpiled by TypeScript instead of being used natively.

## Motivation

## API by examples
