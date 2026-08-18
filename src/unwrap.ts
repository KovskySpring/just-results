import { isErr, isOk, value } from "./Result.ts";
import type { Result } from "./Result.ts";

/**
 * Extracts the Ok value from a {@linkcode Result}, returning a fallback value if it is {@linkcode Err}.
 *
 * @example Falling back to a default value
 * ```ts
 * const value = unwrap(ok(42), 0);
 * // value: number = 42
 *
 * const fallbackValue = unwrap(err("oops"), 0);
 * // fallbackValue: number = 0
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param result The result to unwrap.
 * @param fallback The value to return if the result is {@linkcode Err}.
 * @returns The Ok value if the result is {@linkcode Ok}, otherwise `fallback`.
 */
export function unwrap<T, E>(result: Result<T, E>, fallback: T): T {
  if (isOk(result)) {
    return value(result);
  }

  return fallback;
}

/**
 * Extracts the Err value from a {@linkcode Result}, returning a fallback if it is {@linkcode Ok}.
 *
 * @example Falling back to a default error
 * ```ts
 * const error = unwrapError(err("not found"), "default error");
 * // error: string = "not found"
 *
 * const fallbackError = unwrapError(ok(1), "default error");
 * // fallbackError: string = "default error"
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param result The result to unwrap.
 * @param fallback The value to return if the result is {@linkcode Ok}.
 * @returns The Err value if the result is {@linkcode Err}, otherwise `fallback`.
 */
export function unwrapError<T, E>(result: Result<T, E>, fallback: E): E {
  if (isErr(result)) {
    return value(result);
  }

  return fallback;
}

/**
 * Extracts the Ok value from a {@linkcode Result}, calling the fallback function if it is {@linkcode Err}.
 *
 * Use {@linkcode attempt} if the fallback function can fail.
 *
 * @example Falling back to a computed default
 * ```ts
 * const value = lazyUnwrap(ok(42), () => computeDefault());
 * // value: number = 42 (computeDefault is never called)
 *
 * const fallbackValue = lazyUnwrap(err("oops"), () => -1);
 * // fallbackValue: number = -1
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param result The result to unwrap.
 * @param fallback A function to construct the fallback value when the result is {@linkcode Err}.
 * @returns The Ok value if the result is {@linkcode Ok}, otherwise the return value of `fallback()`.
 */
export function lazyUnwrap<T, E>(result: Result<T, E>, fallback: () => T): T {
  if (isOk(result)) {
    return value(result);
  }

  return fallback();
}

/**
 * Extracts the Err value from a {@linkcode Result}, calling the fallback function if it is {@linkcode Ok}.
 *
 * Use {@linkcode attemptRecover} if the fallback function can fail.
 *
 * @example Falling back to a computed default error
 * ```ts
 * const error = lazyUnwrapError(err("not found"), () => buildDefaultError());
 * // error: string = "not found" (buildDefaultError is never called)
 *
 * const fallbackError = lazyUnwrapError(ok(1), () => "default error");
 * // fallbackError: string = "default error"
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param result The result to unwrap.
 * @param fallback A function to construct the fallback error when the result is {@linkcode Ok}.
 * @returns The Err value if the result is {@linkcode Err}, otherwise the return value of `fallback()`.
 */
export function lazyUnwrapError<T, E>(
  result: Result<T, E>,
  fallback: () => E,
): E {
  if (isErr(result)) {
    return value(result);
  }

  return fallback();
}
