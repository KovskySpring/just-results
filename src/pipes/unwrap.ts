import type { Result } from "../Result.ts";
import {
  lazyUnwrap as rlazyUnwrap,
  lazyUnwrapError as rlazyUnwrapError,
  unwrap as runwrap,
  unwrapError as runwrapError,
} from "../unwrap.ts";

/**
 * This is the pipeable variant of {@linkcode unwrap}.
 *
 * Takes the fallback first and returns a function that accepts the
 * {@linkcode Result}, so it can be used as the terminal step of a pipeline.
 *
 * Extracts the Ok value from a {@linkcode Result}, returning a fallback value if it is {@linkcode Err}.
 *
 * @example Falling back to a default value at the end of a pipeline
 * ```ts
 * const value = pipe(ok(5), map((n: number) => n * 2), unwrap(0));
 * // value: number = 10
 *
 * const fallbackValue = pipe(err("oops"), unwrap(0));
 * // fallbackValue: number = 0
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param fallback The value to return if the result is {@linkcode Err}.
 * @returns A function that takes a {@linkcode Result}<T, E> and returns the Ok value if it is {@linkcode Ok}, otherwise `fallback`.
 */
export function unwrap<T, E>(fallback: T): (result: Result<T, E>) => T {
  return function (result: Result<T, E>) {
    return runwrap(result, fallback);
  };
}

/**
 * This is the pipeable variant of {@linkcode unwrapError}.
 *
 * Takes the fallback first and returns a function that accepts the
 * {@linkcode Result}, so it can be used as the terminal step of a pipeline.
 *
 * Extracts the Err value from a {@linkcode Result}, returning a fallback if it is {@linkcode Ok}.
 *
 * @example Falling back to a default error at the end of a pipeline
 * ```ts
 * const error = pipe(err("not found"), unwrapError("default error"));
 * // error: string = "not found"
 *
 * const fallbackError = pipe(ok(1), unwrapError("default error"));
 * // fallbackError: string = "default error"
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param fallback The value to return if the result is {@linkcode Ok}.
 * @returns A function that takes a {@linkcode Result}<T, E> and returns the Err value if it is {@linkcode Err}, otherwise `fallback`.
 */
export function unwrapError<T, E>(fallback: E): (result: Result<T, E>) => E {
  return function (result: Result<T, E>) {
    return runwrapError(result, fallback);
  };
}

/**
 * This is the pipeable variant of {@linkcode lazyUnwrap}.
 *
 * Takes the fallback factory first and returns a function that accepts the
 * {@linkcode Result}, so it can be used as the terminal step of a pipeline.
 *
 * Extracts the Ok value from a {@linkcode Result}, calling the fallback function if it is {@linkcode Err}.
 *
 * Use {@linkcode attempt} if the fallback function can fail.
 *
 * @example Falling back to a computed default at the end of a pipeline
 * ```ts
 * const value = pipe(ok(42), lazyUnwrap(() => computeDefault()));
 * // value: number = 42 (computeDefault is never called)
 *
 * const fallbackValue = pipe(err("oops"), lazyUnwrap(() => -1));
 * // fallbackValue: number = -1
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param fallback A function to construct the fallback value when the result is {@linkcode Err}.
 * @returns A function that takes a {@linkcode Result}<T, E> and returns the Ok value if it is {@linkcode Ok}, otherwise the return value of `fallback()`.
 */
export function lazyUnwrap<T, E>(
  fallback: () => T,
): (result: Result<T, E>) => T {
  return function (result: Result<T, E>) {
    return rlazyUnwrap(result, fallback);
  };
}

/**
 * This is the pipeable variant of {@linkcode lazyUnwrapError}.
 *
 * Takes the fallback factory first and returns a function that accepts the
 * {@linkcode Result}, so it can be used as the terminal step of a pipeline.
 *
 * Extracts the Err value from a {@linkcode Result}, calling the fallback function if it is {@linkcode Ok}.
 *
 * Use {@linkcode attemptRecover} if the fallback function can fail.
 *
 * @example Falling back to a computed default error at the end of a pipeline
 * ```ts
 * const error = pipe(err("not found"), lazyUnwrapError(() => buildDefaultError()));
 * // error: string = "not found" (buildDefaultError is never called)
 *
 * const fallbackError = pipe(ok(1), lazyUnwrapError(() => "default error"));
 * // fallbackError: string = "default error"
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param fallback A function to construct the fallback error when the result is {@linkcode Ok}.
 * @returns A function that takes a {@linkcode Result}<T, E> and returns the Err value if it is {@linkcode Err}, otherwise the return value of `fallback()`.
 */
export function lazyUnwrapError<T, E>(
  fallback: () => E,
): (result: Result<T, E>) => E {
  return function (result: Result<T, E>) {
    return rlazyUnwrapError(result, fallback);
  };
}
