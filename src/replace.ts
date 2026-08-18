import { err, isErr, isOk, ok } from "./Result.ts";
import type { Result } from "./Result.ts";

/**
 * Replaces the Ok value of a {@linkcode Result} with a new value.
 * If the result is {@linkcode Err}, it is passed through unchanged.
 *
 * @example Replacing a success value with a status message
 * ```ts
 * const result = replace(ok(42), "done");
 * // result: Result<string, never> = [true, "done"]
 *
 * const failure = replace(err("oops"), "done");
 * // failure: Result<string, string> = [false, "oops"]
 * ```
 *
 * @template T The type of the replacement success value.
 * @template E The type of the error value.
 * @param result The result whose Ok value will be replaced.
 * @param value The new value to substitute into the Ok result.
 * @returns {@linkcode Result}<T, E>
 */
export function replace<T, E>(
  result: Result<unknown, E>,
  value: T,
): Result<T, E> {
  if (isOk(result)) {
    return ok(value);
  }

  return result;
}

/**
 * Replaces the Err value of a {@linkcode Result} with a new error.
 * If the result is {@linkcode Ok}, it is passed through unchanged.
 *
 * @example Hiding an internal error behind a public-facing one
 * ```ts
 * const failure = replaceError(err("internal error"), new Error("Public error"));
 * // failure: Result<never, Error> = [false, Error("Public error")]
 *
 * const success = replaceError(ok(1), new Error("unused"));
 * // success: Result<number, Error> = [true, 1]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the replacement error value.
 * @param result The result whose Err value will be replaced.
 * @param error The new error to substitute into the Err result.
 * @returns {@linkcode Result}<T, E>
 */
export function replaceError<T, E>(
  result: Result<T, unknown>,
  error: E,
): Result<T, E> {
  if (isErr(result)) {
    return err(error);
  }

  return result;
}
