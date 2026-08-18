import type { Result } from "../Result.ts";
import {
  replace as rreplace,
  replaceError as rreplaceError,
} from "../replace.ts";

/**
 * This is the pipeable variant of {@linkcode replace}.
 *
 * Takes the replacement value first and returns a function that accepts the
 * {@linkcode Result}, so it can be dropped straight into a pipeline.
 *
 * Replaces the Ok value of a {@linkcode Result} with a new value.
 * If the result is {@linkcode Err}, it is passed through unchanged.
 *
 * @example Replacing a success value with a status message in a pipeline
 * ```ts
 * const result = pipe(ok(42), replace("done"));
 * // result: Result<string, never> = [true, "done"]
 *
 * const failure = pipe(err("oops"), replace("done"));
 * // failure: Result<string, string> = [false, "oops"]
 * ```
 *
 * @template T The type of the replacement success value.
 * @template E The type of the error value.
 * @param value The new value to substitute into the Ok result.
 * @returns A function that takes a {@linkcode Result}<unknown, E> and returns {@linkcode Result}<T, E>.
 */
export function replace<T, E>(
  value: T,
): (result: Result<unknown, E>) => Result<T, E> {
  return function (result: Result<unknown, E>) {
    return rreplace(result, value);
  };
}

/**
 * This is the pipeable variant of {@linkcode replaceError}.
 *
 * Takes the replacement error first and returns a function that accepts the
 * {@linkcode Result}, so it can be dropped straight into a pipeline.
 *
 * Replaces the Err value of a {@linkcode Result} with a new error.
 * If the result is {@linkcode Ok}, it is passed through unchanged.
 *
 * @example Hiding an internal error behind a public-facing one in a pipeline
 * ```ts
 * const failure = pipe(err("internal error"), replaceError(new Error("Public error")));
 * // failure: Result<never, Error> = [false, Error("Public error")]
 *
 * const success = pipe(ok(1), replaceError(new Error("unused")));
 * // success: Result<number, Error> = [true, 1]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the replacement error value.
 * @param error The new error to substitute into the Err result.
 * @returns A function that takes a {@linkcode Result}<T, unknown> and returns {@linkcode Result}<T, E>.
 */
export function replaceError<T, E>(
  error: E,
): (result: Result<T, unknown>) => Result<T, E> {
  return function (result: Result<T, unknown>) {
    return rreplaceError(result, error);
  };
}
