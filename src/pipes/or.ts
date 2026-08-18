import type { Result } from "../Result.ts";
import {
  asyncLazyOr as rasyncLazyOr,
  lazyOr as rlazyOr,
  or as ror,
} from "../or.ts";

/**
 * This is the pipeable variant of {@linkcode or}.
 *
 * Takes the fallback first and returns a function that accepts the primary
 * {@linkcode Result}, so it can be dropped straight into a pipeline.
 *
 * Returns the first result if it is {@linkcode Ok}, otherwise returns the second result.
 *
 * @example Falling back to a second Result in a pipeline
 * ```ts
 * const result = pipe(err("failed"), or(ok(42)));
 * // result: Result<number, string> = [true, 42]
 *
 * const result2 = pipe(ok(1), or(ok(99)));
 * // result2: Result<number, never> = [true, 1]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param second The fallback result.
 * @returns A function that takes the primary {@linkcode Result}<T, E> and returns it if it is {@linkcode Ok}, otherwise `second`.
 */
export function or<T, E>(
  second: Result<T, E>,
): (first: Result<T, E>) => Result<T, E> {
  return function (first: Result<T, E>) {
    return ror(first, second);
  };
}

/**
 * This is the pipeable variant of {@linkcode lazyOr}.
 *
 * Takes the fallback factory first and returns a function that accepts the
 * primary {@linkcode Result}, so it can be dropped straight into a pipeline.
 *
 * Returns the first result if it is {@linkcode Ok}, otherwise returns the result of `second()`.
 *
 * If you need access to the error value, use {@linkcode attemptRecover} instead.
 *
 * @example Falling back to a lazily computed Result in a pipeline
 * ```ts
 * const result = pipe(err("failed"), lazyOr(() => ok(42)));
 * // result: Result<number, string> = [true, 42]
 *
 * const result2 = pipe(ok(1), lazyOr(() => ok(99)));
 * // result2: Result<number, never> = [true, 1]
 * // The fallback factory is never called
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param second A function to produce the fallback result.
 * @returns A function that takes the primary {@linkcode Result}<T, E> and returns it if it is {@linkcode Ok}, otherwise the result of calling `second()`.
 */
export function lazyOr<T, E>(
  second: () => Result<T, E>,
): (first: Result<T, E>) => Result<T, E> {
  return function (first: Result<T, E>) {
    return rlazyOr(first, second);
  };
}

/**
 * This is the pipeable variant of {@linkcode asyncLazyOr}.
 *
 * Takes the fallback factory first and returns a function that accepts the
 * primary {@linkcode Result} — or a promise of one, so it chains onto the
 * output of another async step in a pipeline.
 *
 * Returns the first result if it is {@linkcode Ok}, otherwise returns the result of `second()`.
 *
 * If you need access to the error value, use {@linkcode attemptRecoverAsync} instead.
 *
 * @example Falling back to an async Result in a pipeline
 * ```ts
 * async function fetchFallback(): Promise<Result<string, string>> {
 *   return ok("fallback value");
 * }
 *
 * const result = await pipe(err("primary failed"), asyncLazyOr(fetchFallback));
 * // result: Result<string, string> = [true, "fallback value"]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param second An function to produce the fallback result.
 * @returns A function that takes the primary {@linkcode Result}<T, E> (or a promise of one) and returns a promise that resolves to it if it is {@linkcode Ok}, otherwise the result of calling `second()`.
 */
export function asyncLazyOr<T, E>(
  second: () => Result<T, E> | Promise<Result<T, E>>,
): (first: Result<T, E> | Promise<Result<T, E>>) => Promise<Result<T, E>> {
  return function (first: Result<T, E> | Promise<Result<T, E>>) {
    return rasyncLazyOr(first, second);
  };
}
