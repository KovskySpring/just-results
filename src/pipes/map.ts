import type { Result } from "../Result.ts";
import {
  map as rmap,
  mapAsync as rmapAsync,
  mapError as rmapError,
  mapErrorAsync as rmapErrorAsync,
} from "../map.ts";

/**
 * This is the pipeable variant of {@linkcode map}.
 *
 * Takes the mapper first and returns a function that accepts the
 * {@linkcode Result}, so it can be dropped straight into a pipeline.
 *
 * Transforms the ok value of a {@linkcode Result}.
 * If the result is {@linkcode Err}, it is passed through unchanged.
 *
 * @example Doubling a number in a pipeline
 * ```ts
 * const doubled = pipe(ok(2), map((n: number) => n * 2));
 * // doubled: Result<number, never> = [true, 4]
 *
 * const stillFailed = pipe(err("oops"), map((n: number) => n * 2));
 * // stillFailed: Result<number, string> = [false, "oops"]
 * ```
 *
 * @example Reusing the mapper as a standalone function
 * ```ts
 * const double = map((n: number) => n * 2);
 * const doubled = double(ok(5));
 * // doubled: Result<number, never> = [true, 10]
 * ```
 *
 * @template T1 The type of the original success value.
 * @template T2 The type of the transformed success value.
 * @template E The type of the error value.
 * @param fun A function to apply to the Ok value.
 * @returns A function that takes a {@linkcode Result}<T1, E> and returns {@linkcode Result}<T2, E>.
 */
export function map<T1, T2, E>(
  fun: (value: T1) => T2,
): (result: Result<T1, E>) => Result<T2, E> {
  return function (result: Result<T1, E>) {
    return rmap(result, fun);
  };
}

/**
 * This is the pipeable variant of {@linkcode mapError}.
 *
 * Takes the mapper first and returns a function that accepts the
 * {@linkcode Result}, so it can be dropped straight into a pipeline.
 *
 * Transforms the error value of a {@linkcode Result}.
 * If the result is {@linkcode Ok}, it is passed through unchanged.
 *
 * @example Formatting an error code in a pipeline
 * ```ts
 * const mapped = pipe(err(404), mapError((code: number) => `Error code: ${code}`));
 * // mapped: Result<never, string> = [false, "Error code: 404"]
 *
 * const stillOk = pipe(ok("hello"), mapError((code: number) => `Error code: ${code}`));
 * // stillOk: Result<string, string> = [true, "hello"]
 * ```
 *
 * @template T The type of the success value.
 * @template E1 The type of the original error value.
 * @template E2 The type of the transformed error value.
 * @param fun A function to apply to the Err value.
 * @returns A function that takes a {@linkcode Result}<T, E1> and returns {@linkcode Result}<T, E2>.
 */
export function mapError<T, E1, E2>(
  fun: (error: E1) => E2,
): (result: Result<T, E1>) => Result<T, E2> {
  return function (result: Result<T, E1>) {
    return rmapError(result, fun);
  };
}

/**
 * This is the pipeable variant of {@linkcode mapAsync}.
 *
 * Takes the mapper first and returns a function that accepts the
 * {@linkcode Result} — or a promise of one, so it chains onto the output of
 * another async step in a pipeline.
 *
 * Asynchronously transforms the ok value of a {@linkcode Result}.
 * If the result is {@linkcode Err}, it is passed through unchanged.
 *
 * @example Doubling a number asynchronously in a pipeline
 * ```ts
 * const doubled = await pipe(ok(1), mapAsync(async (n: number) => n * 2));
 * // doubled: Result<number, never> = [true, 2]
 *
 * const stillFailed = await pipe(err("oops"), mapAsync(async (n: number) => n * 2));
 * // stillFailed: Result<number, string> = [false, "oops"]
 * ```
 *
 * @example Chaining async steps without awaiting in between
 * ```ts
 * const label = await pipe(
 *   ok(42),
 *   mapAsync((id: number) => db.getLabel(id)),
 *   mapAsync(async (label: string) => label.toUpperCase()),
 * );
 * // label: Result<string, never>
 * ```
 *
 * @template T1 The type of the original success value.
 * @template T2 The type of the transformed success value.
 * @template E The type of the error value.
 * @param fun A function to apply to the Ok value.
 * @returns A function that takes a {@linkcode Result}<T1, E> (or a promise of one) and returns Promise<{@linkcode Result}<T2, E>>.
 */
export function mapAsync<T1, T2, E>(
  fun: (value: T1) => T2 | Promise<T2>,
): (result: Result<T1, E> | Promise<Result<T1, E>>) => Promise<Result<T2, E>> {
  return function (result: Result<T1, E> | Promise<Result<T1, E>>) {
    return rmapAsync(result, fun);
  };
}

/**
 * This is the pipeable variant of {@linkcode mapErrorAsync}.
 *
 * Takes the mapper first and returns a function that accepts the
 * {@linkcode Result} — or a promise of one, so it chains onto the output of
 * another async step in a pipeline.
 *
 * Asynchronously transforms the error value of a {@linkcode Result}.
 * If the result is {@linkcode Ok}, it is passed through unchanged.
 *
 * @example Enriching an error code asynchronously in a pipeline
 * ```ts
 * const mapped = await pipe(
 *   err(500),
 *   mapErrorAsync((code: number) => errorRegistry.lookup(code)),
 * );
 * // mapped: Result<never, string>
 *
 * const stillOk = await pipe(
 *   ok("hello"),
 *   mapErrorAsync((code: number) => errorRegistry.lookup(code)),
 * );
 * // stillOk: Result<string, string> = [true, "hello"]
 * ```
 *
 * @template T The type of the success value.
 * @template E1 The type of the original error value.
 * @template E2 The type of the transformed error value.
 * @param fun An async function to apply to the Err value.
 * @returns A function that takes a {@linkcode Result}<T, E1> (or a promise of one) and returns Promise<{@linkcode Result}<T, E2>>.
 */
export function mapErrorAsync<T, E1, E2>(
  fun: (error: E1) => E2 | Promise<E2>,
): (result: Result<T, E1> | Promise<Result<T, E1>>) => Promise<Result<T, E2>> {
  return function (result: Result<T, E1> | Promise<Result<T, E1>>) {
    return rmapErrorAsync(result, fun);
  };
}
