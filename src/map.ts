import { err, isErr, isOk, ok, value } from "./Result.ts";
import type { Result } from "./Result.ts";

/**
 * Transforms the ok value of a {@linkcode Result}.
 * If the result is {@linkcode Err}, it is passed through unchanged.
 *
 * @example Doubling a number
 * ```ts
 * const result = ok(2);
 * const doubled = map(result, (n) => n * 2);
 * // doubled: Result<number, never> = [true, 4]
 *
 * const failure = err("oops");
 * const stillFailed = map(failure, (n) => n * 2);
 * // stillFailed: Result<number, string> = [false, "oops"]
 * ```
 *
 * @template T1 The type of the original success value.
 * @template T2 The type of the transformed success value.
 * @template E The type of the error value.
 * @param result The result to transform.
 * @param fun A function to apply to the Ok value.
 * @returns {@linkcode Result}<T2, E>.
 */
export function map<T1, T2, E>(
  result: Result<T1, E>,
  fun: (value: T1) => T2,
): Result<T2, E> {
  if (isOk(result)) {
    return ok(fun(value(result)));
  }

  return result;
}

/**
 * Transforms the error value of a {@linkcode Result}.
 * If the result is {@linkcode Ok}, it is passed through unchanged.
 *
 * @example Formatting an error code
 * ```ts
 * const failure = err(404);
 * const mapped = mapError(failure, (code) => `Error code: ${code}`);
 * // mapped: Result<never, string> = [false, "Error code: 404"]
 *
 * const success = ok("hello");
 * const stillOk = mapError(success, (code) => `Error code: ${code}`);
 * // stillOk: Result<string, string> = [true, "hello"]
 * ```
 *
 * @template T The type of the success value.
 * @template E1 The type of the original error value.
 * @template E2 The type of the transformed error value.
 * @param result The result to transform.
 * @param fun A function to apply to the Err value.
 * @returns {@linkcode Result}<T, E2>
 */
export function mapError<T, E1, E2>(
  result: Result<T, E1>,
  fun: (error: E1) => E2,
): Result<T, E2> {
  if (isErr(result)) {
    return err(fun(value(result)));
  }

  return result;
}

/**
 * This is the async version of {@linkcode map}
 *
 * Asynchronously transforms the ok value of a {@linkcode Result}.
 * If the result is {@linkcode Err}, it is passed through unchanged.
 *
 * @example Doubling a number asynchronously
 * ```ts
 * const result = ok(1);
 * const doubled = await mapAsync(result, async (n) => n * 2);
 * // doubled: Result<number, never> = [true, 2]
 *
 * const failure = err("oops");
 * const stillFailed = await mapAsync(failure, async (n) => n * 2);
 * // stillFailed: Result<number, string> = [false, "oops"]
 * ```
 *
 * @template T1 The type of the original success value.
 * @template T2 The type of the transformed success value.
 * @template E The type of the error value.
 * @param result The result to transform.
 * @param fun A function to apply to the Ok value.
 * @returns Promise<{@linkcode Result}<T2, E>>.
 */
export function mapAsync<T1, T2, E>(
  result: Result<T1, E> | Promise<Result<T1, E>>,
  fun: (value: T1) => T2 | Promise<T2>,
): Promise<Result<T2, E>> {
  return Promise.resolve(result).then((resolvedResult) =>
    isOk(resolvedResult)
      ? Promise.resolve(fun(value(resolvedResult))).then(ok)
      : Promise.resolve(resolvedResult)
  );
}

/**
 * This is the async version of {@linkcode mapError}
 *
 * Asynchronously transforms the error value of a {@linkcode Result}.
 * If the result is {@linkcode Ok}, it is passed through unchanged.
 *
 * @example Formatting an error code asynchronously
 * ```ts
 * const failure = err(404);
 * const mapped = await mapErrorAsync(failure, async (code) => `Error code: ${code}`);
 * // mapped: Result<never, string> = [false, "Error code: 404"]
 *
 * const success = ok("hello");
 * const stillOk = await mapErrorAsync(success, async (code) => `Error code: ${code}`);
 * // stillOk: Result<string, string> = [true, "hello"]
 * ```
 *
 * @template T The type of the success value.
 * @template E1 The type of the original error value.
 * @template E2 The type of the transformed error value.
 * @param result The result to transform.
 * @param fun An async function to apply to the Err value.
 * @returns Promise<{@linkcode Result}<T, E2>>
 */
export function mapErrorAsync<T, E1, E2>(
  result: Result<T, E1> | Promise<Result<T, E1>>,
  fun: (error: E1) => E2 | Promise<E2>,
): Promise<Result<T, E2>> {
  return Promise.resolve(result).then((resolvedResult) =>
    isErr(resolvedResult)
      ? Promise.resolve(fun(value(resolvedResult))).then(err)
      : Promise.resolve(resolvedResult)
  );
}
