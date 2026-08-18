/**
 * # just-results
 *
 * A zero-dependency TypeScript {@linkcode Result} type library for explicit,
 * type-safe error handling.
 *
 * Results are plain 2-element tuples, so there is no class, no wrapper object
 * and no runtime cost beyond an array literal:
 *
 * - {@linkcode Ok}<T> is `[true, T]`
 * - {@linkcode Err}<E> is `[false, E]`
 * - {@linkcode Result}<T, E> is {@linkcode Ok}<T> | {@linkcode Err}<E>
 *
 * Every function in this module takes the {@linkcode Result} as its first
 * argument. For curried, pipeline-friendly variants of the same API, see the
 * `@kovskyspring/just-results/pipes` module.
 *
 * ## Installation
 *
 * This package is published to [JSR](https://jsr.io) as
 * [`@kovskyspring/just-results`](https://jsr.io/@kovskyspring/just-results).
 *
 * ```bash
 * # deno
 * deno add jsr:@kovskyspring/just-results
 *
 * # pnpm 10.9+ and yarn 4.9+
 * pnpm add jsr:@kovskyspring/just-results
 * yarn add jsr:@kovskyspring/just-results
 *
 * # npm, bun, and older versions of yarn or pnpm
 * npx jsr add @kovskyspring/just-results
 * bunx jsr add @kovskyspring/just-results
 * yarn dlx jsr add @kovskyspring/just-results
 * pnpm dlx jsr add @kovskyspring/just-results
 * ```
 *
 * ## What's included
 *
 * - **Core types** — {@linkcode Result} (aliased as {@linkcode Type}),
 *   {@linkcode Ok}, {@linkcode Err}, and the {@linkcode InferOk} /
 *   {@linkcode InferErr} / {@linkcode InferResult} helpers.
 * - **Constructors & checkers** — {@linkcode ok}, {@linkcode err},
 *   {@linkcode isOk}, {@linkcode isErr}.
 * - **Read** — {@linkcode value}, {@linkcode or}, {@linkcode unwrap},
 *   {@linkcode unwrapError}, with lazy ({@linkcode lazyOr},
 *   {@linkcode lazyUnwrap}, {@linkcode lazyUnwrapError}) and async
 *   ({@linkcode asyncLazyOr}) variants.
 * - **Transform**
 *   - *Map*: {@linkcode map}, {@linkcode mapError}, {@linkcode attempt},
 *     {@linkcode attemptRecover} — plus {@linkcode mapAsync},
 *     {@linkcode mapErrorAsync}, {@linkcode attemptAsync},
 *     {@linkcode attemptRecoverAsync}.
 *   - *Replace*: {@linkcode replace}, {@linkcode replaceError}.
 *   - *Tap for side effects*: {@linkcode tap}, {@linkcode tapError},
 *     {@linkcode tapAsync}, {@linkcode tapErrorAsync}.
 * - **Combine & split** — {@linkcode all}, {@linkcode partition},
 *   {@linkcode flatten}.
 *
 * @example Chaining fallible steps
 * ```ts
 * import { attempt, err, map, ok, unwrap } from "@kovskyspring/just-results";
 * import type { Result } from "@kovskyspring/just-results";
 *
 * // Fallible steps return a Result instead of throwing.
 * function parseAge(input: string): Result<number, string> {
 *   const age = Number(input);
 *   return Number.isNaN(age) ? err(`not a number: ${input}`) : ok(age);
 * }
 *
 * function checkAdult(age: number): Result<number, string> {
 *   return age >= 18 ? ok(age) : err("must be 18 or older");
 * }
 *
 * // Chain them: the first Err short-circuits and the rest is skipped.
 * const result = map(
 *   attempt(parseAge("21"), checkAdult),
 *   (age) => `welcome, age ${age}`,
 * );
 * // result: Result<string, string> = [true, "welcome, age 21"]
 *
 * unwrap(result, "rejected"); // "welcome, age 21"
 *
 * // Or destructure the tuple.
 * // It's recommended to use checks, mappers and unwrappers instead
 * // of destructuring, because it's more explicit, type-safe and readable.
 * // But destructuring still works.
 * const [success, payload] = result; // it's just a tuple
 * ```
 *
 * @module
 */
export * from "./all.ts";
export * from "./attempt.ts";
export * from "./flatten.ts";
export * from "./map.ts";
export * from "./or.ts";
export * from "./partition.ts";
export * from "./replace.ts";
export * from "./Result.ts";
export * from "./tap.ts";
export * from "./unwrap.ts";
