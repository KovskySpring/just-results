/**
 * Pipeable (curried) variants of the `just-results` API.
 *
 * @example Composing a pipeline of pipeable variants
 * ```ts
 * import { pipe } from "some-pipe-utility";
 * import * as P from "@kovskyspring/just-results/pipes";
 * import { err, ok } from "@kovskyspring/just-results";
 *
 * const result = pipe(
 *   ok(2),
 *   P.map((n: number) => n * 10),
 *   P.attempt((n: number) => n > 0 ? ok(n) : err("non-positive")),
 *   P.tap((n: number) => console.log("Value:", n)),
 *   P.unwrap(0),
 * );
 * // result: number = 20
 * ```
 *
 * @module
 */
export * from "./attempt.ts";
export * from "./flatten.ts";
export * from "./map.ts";
export * from "./or.ts";
export * from "./replace.ts";
export * from "./tap.ts";
export * from "./unwrap.ts";
