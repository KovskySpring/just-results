import { isOk, value } from "./Result.ts";
import type { Result } from "./Result.ts";

/**
 * Collapses a nested {@linkcode Result}<{@linkcode Result}<T, E1>, E2> into a flat {@linkcode Result}<T, E1 | E2>.
 *
 * If the outer result is {@linkcode Ok}, the inner result is returned directly.
 * If the outer result is {@linkcode Err}, it is returned unchanged.
 *
 * @example Flattening a nested Result
 * ```ts
 * const nested: Result<Result<number, string>, string> = ok(ok(42));
 * const flat = flatten(nested);
 * // flat: Result<number, string> = [true, 42]
 *
 * const nestedErr: Result<Result<number, string>, string> = ok(err("inner error"));
 * const flatErr = flatten(nestedErr);
 * // flatErr: Result<number, string> = [false, "inner error"]
 *
 * const outerErr: Result<Result<number, string>, string> = err("outer error");
 * const stillErr = flatten(outerErr);
 * // stillErr: Result<number, string> = [false, "outer error"]
 * ```
 *
 * @template T The type of the innermost success value.
 * @template E1 The type of the error value of the inner result.
 * @template E2 The type of the error value of the outer result.
 * @param result A nested {@linkcode Result}<{@linkcode Result}<T, E1>, E2> to flatten.
 * @returns {@linkcode Result}<T, E1 | E2>.
 */
export function flatten<T, E1, E2 = E1>(
  result: Result<Result<T, E1>, E2>,
): Result<T, E1 | E2> {
  if (isOk(result)) {
    return value(result);
  }

  return result;
}
