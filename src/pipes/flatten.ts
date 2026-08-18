import type { Result } from "../Result.ts";
import { flatten as rflatten } from "../flatten.ts";

/**
 * This is the pipeable variant of {@linkcode flatten}.
 *
 * Takes no configuration arguments — call it with no arguments to obtain the
 * flattening function, so it can be dropped straight into a pipeline.
 *
 * Collapses a nested {@linkcode Result}<{@linkcode Result}<T, E1>, E2> into a flat {@linkcode Result}<T, E1 | E2>.
 *
 * If the outer result is {@linkcode Ok}, the inner result is returned directly.
 * If the outer result is {@linkcode Err}, it is returned unchanged.
 *
 * @example Flattening a nested Result in a pipeline
 * ```ts
 * const nested: Result<Result<number, string>, string> = ok(ok(42));
 * const flat = pipe(nested, flatten());
 * // flat: Result<number, string> = [true, 42]
 *
 * const nestedErr: Result<Result<number, string>, string> = ok(err("inner error"));
 * const flatErr = pipe(nestedErr, flatten());
 * // flatErr: Result<number, string> = [false, "inner error"]
 *
 * const outerErr: Result<Result<number, string>, string> = err("outer error");
 * const stillErr = pipe(outerErr, flatten());
 * // stillErr: Result<number, string> = [false, "outer error"]
 * ```
 *
 * @example Reusing the flattening function
 * ```ts
 * const flatten42 = flatten<number, string>();
 *
 * flatten42(ok(ok(42)));
 * // Result<number, string> = [true, 42]
 * ```
 *
 * @template T The type of the innermost success value.
 * @template E1 The type of the error value of the inner result.
 * @template E2 The type of the error value of the outer result.
 * @returns A function that takes a nested {@linkcode Result}<{@linkcode Result}<T, E1>, E2> and returns {@linkcode Result}<T, E1 | E2>.
 */
export function flatten<T, E1, E2 = E1>(): (
  result: Result<Result<T, E1>, E2>,
) => Result<T, E1 | E2> {
  return function (result: Result<Result<T, E1>, E2>) {
    return rflatten(result);
  };
}
