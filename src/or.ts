import { isOk } from "./Result.ts";
import type { Result } from "./Result.ts";

/**
 * Returns the first result if it is {@linkcode Ok}, otherwise returns the second result.
 *
 * @example Falling back to a second Result
 * ```ts
 * const result = or(err("failed"), ok(42));
 * // result: Result<number, string> = [true, 42]
 *
 * const result2 = or(ok(1), ok(99));
 * // result2: Result<number, never> = [true, 1]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param first The primary result.
 * @param second The fallback result.
 * @returns `first` if it is {@linkcode Ok}, otherwise `second`.
 */
export function or<T, E>(
  first: Result<T, E>,
  second: Result<T, E>,
): Result<T, E> {
  if (isOk(first)) {
    return first;
  }

  return second;
}

/**
 * Returns the first result if it is {@linkcode Ok}, otherwise returns the result of `second()`.
 *
 * If you need access to the error value, use {@linkcode attemptRecover} instead.
 *
 * @example Falling back to a lazily computed Result
 * ```ts
 * const result = lazyOr(err("failed"), () => ok(42));
 * // result: Result<number, string> = [true, 42]
 *
 * const result2 = lazyOr(ok(1), () => ok(99));
 * // result2: Result<number, never> = [true, 1]
 * // The fallback factory is never called
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param first The primary result to check.
 * @param second A function to produce the fallback result.
 * @returns `first` if it is {@linkcode Ok}, otherwise the result of calling `second()`.
 */
export function lazyOr<T, E>(
  first: Result<T, E>,
  second: () => Result<T, E>,
): Result<T, E> {
  if (isOk(first)) {
    return first;
  }

  return second();
}

/**
 * This is the async version of {@linkcode lazyOr}.
 *
 * Returns the first result if it is {@linkcode Ok}, otherwise returns the result of `second()`.
 *
 * If you need access to the error value, use {@linkcode attemptRecoverAsync} instead.
 *
 * @example Falling back to an async Result
 * ```ts
 * async function fetchFallback(): Promise<Result<string, string>> {
 *   return ok("fallback value");
 * }
 *
 * const result = await asyncLazyOr(err("primary failed"), fetchFallback);
 * // result: Result<string, string> = [true, "fallback value"]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param first The primary result to check.
 * @param second An function to produce the fallback result.
 * @returns A promise that resolves to `first` if it is {@linkcode Ok}, otherwise the result of calling `second()`.
 */
export function asyncLazyOr<T, E>(
  first: Result<T, E> | Promise<Result<T, E>>,
  second: () => Result<T, E> | Promise<Result<T, E>>,
): Promise<Result<T, E>> {
  return Promise.resolve(first).then((first) =>
    isOk(first) ? Promise.resolve(first) : Promise.resolve(second())
  );
}
