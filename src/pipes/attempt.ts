import type { Result } from "../Result.ts";
import {
  attempt as rattempt,
  attemptAsync as rattemptAsync,
  attemptRecover as rattemptRecover,
  attemptRecoverAsync as rattemptRecoverAsync,
} from "../attempt.ts";

/**
 * This is the pipeable variant of {@linkcode attempt}.
 *
 * Takes the transformation first and returns a function that accepts the
 * {@linkcode Result}, so it can be dropped straight into a pipeline.
 *
 * Transform a result using a function that return a {@linkcode Result}.
 *
 * Use this on transformations that may fail.
 *
 * If the result is {@linkcode Ok}, applies `fun` to the value and returns the new {@linkcode Result}.
 * If the result is {@linkcode Err}, passes it through unchanged.
 *
 * **Note**: The error type widens to the union `E1 | E2`.
 *
 * @example Parsing a string into a number in a pipeline
 * ```ts
 * function parseNumber(s: string): Result<number, string> {
 *   const n = Number(s);
 *   return isNaN(n) ? err("not a number") : ok(n);
 * }
 *
 * const result = pipe(ok("42"), attempt(parseNumber)); // Ok<42>
 * const failed = pipe(err("missing"), attempt(parseNumber)); // Err<"missing">
 * ```
 *
 * @example Reusing the transformation as a standalone function
 * ```ts
 * const parsePositive = attempt((n: number): Result<number, string> =>
 *   n > 0 ? ok(n) : err("must be positive")
 * );
 *
 * const result = parsePositive(ok(5));
 * // result: Result<number, string> = [true, 5]
 * ```
 *
 * @template T1 The type of the original success value.
 * @template T2 The type of the success value returned by `fun`.
 * @template E1 The type of the original error value.
 * @template E2 The type of the error value returned by `fun` (defaults to `E1`).
 * @param fun A function that takes the Ok value and returns a new {@linkcode Result}<T2, E2>.
 * @returns A function that takes a {@linkcode Result}<T1, E1> and returns {@linkcode Result}<T2, E1 | E2>.
 */
export function attempt<T1, T2, E1, E2 = E1>(
  fun: (value: T1) => Result<T2, E2>,
): (result: Result<T1, E1>) => Result<T2, E1 | E2> {
  return function (result: Result<T1, E1>) {
    return rattempt(result, fun);
  };
}

/**
 * This is the pipeable variant of {@linkcode attemptRecover}.
 *
 * Takes the recovery function first and returns a function that accepts the
 * {@linkcode Result}, so it can be dropped straight into a pipeline.
 *
 * Recover from an {@linkcode Err} result using a function that returns a new {@linkcode Result}.
 *
 * Use this when the recovery operation may also fail.
 *
 * If the result is {@linkcode Err}, applies `fun` to the error and returns the new {@linkcode Result}.
 * If the result is {@linkcode Ok}, passes it through unchanged.
 *
 * @example Falling back to a default when parsing fails
 * ```ts
 * function fallbackParse(s: string): Result<number, Error> {
 *   return err(new Error(`Could not recover from: ${s}`));
 * }
 *
 * const recovered = pipe(err("bad input"), attemptRecover(fallbackParse));
 * // recovered: Result<number, Error> = [false, Error("Could not recover from: bad input")]
 *
 * const success = pipe(ok(1), attemptRecover(fallbackParse));
 * // success: Result<number, Error> = [true, 1]
 * ```
 *
 * @template T The type of the success value.
 * @template E1 The type of the original error value.
 * @template E2 The type of the error value returned by the recovery function.
 * @param fun A function that takes the Err value and returns a {@linkcode Result}<T, E2>.
 * @returns A function that takes a {@linkcode Result}<T, E1> and returns {@linkcode Result}<T, E2>.
 */
export function attemptRecover<T, E1, E2>(
  fun: (error: E1) => Result<T, E2>,
): (result: Result<T, E1>) => Result<T, E2> {
  return function (result: Result<T, E1>) {
    return rattemptRecover(result, fun);
  };
}

/**
 * This is the pipeable variant of {@linkcode attemptAsync}.
 *
 * Takes the transformation first and returns a function that accepts the
 * {@linkcode Result} — or a promise of one, so it chains onto the output of
 * another async step in a pipeline.
 *
 * Transform a result using a function that return a {@linkcode Result}.
 *
 * Use this on transformations that may fail.
 *
 * If the result is {@linkcode Ok}, applies `fun` to the value and returns the new {@linkcode Result}.
 * If the result is {@linkcode Err}, passes it through unchanged.
 *
 * **Note**: The error type widens to the union `E1 | E2`.
 *
 * @example Fetching a user by id in a pipeline
 * ```ts
 * async function fetchUser(id: number): Promise<Result<User, string>> {
 *   const user = await db.find(id);
 *   return user ? ok(user) : err("not found");
 * }
 *
 * const result = await pipe(ok(42), attemptAsync(fetchUser));
 * // result: Result<User, string>
 * ```
 *
 * @template T1 The type of the original success value.
 * @template T2 The type of the success value returned by `fun`.
 * @template E1 The type of the original error value.
 * @template E2 The type of the error value returned by `fun` (defaults to `E1`).
 * @param fun A function that takes the Ok value and returns a new {@linkcode Result}<T2, E2>.
 * @returns A function that takes a {@linkcode Result}<T1, E1> (or a promise of one) and returns Promise<{@linkcode Result}<T2, E1 | E2>>.
 */
export function attemptAsync<T1, T2, E1, E2 = E1>(
  fun: (value: T1) => Result<T2, E2> | Promise<Result<T2, E2>>,
): (
  result: Result<T1, E1> | Promise<Result<T1, E1>>,
) => Promise<Result<T2, E1 | E2>> {
  return function (result: Result<T1, E1> | Promise<Result<T1, E1>>) {
    return rattemptAsync(result, fun);
  };
}

/**
 * This is the pipeable variant of {@linkcode attemptRecoverAsync}.
 *
 * Takes the recovery function first and returns a function that accepts the
 * {@linkcode Result} — or a promise of one, so it chains onto the output of
 * another async step in a pipeline.
 *
 * Recover from an {@linkcode Err} result using a function that returns a new {@linkcode Result}.
 *
 * Use this when the recovery operation may also fail.
 *
 * If the result is {@linkcode Err}, applies `fun` to the error and returns the new {@linkcode Result}.
 * If the result is {@linkcode Ok}, passes it through unchanged.
 *
 * @example Falling back to a cache lookup in a pipeline
 * ```ts
 * async function tryCache(key: string): Promise<Result<string, Error>> {
 *   const cached = await cache.get(key);
 *   return cached ? ok(cached) : err(new Error("cache miss"));
 * }
 *
 * const result = await pipe(err("db error"), attemptRecoverAsync(tryCache));
 * // result: Result<string, Error>
 * ```
 *
 * @template T The type of the success value.
 * @template E1 The type of the original error value.
 * @template E2 The type of the error value returned by the recovery function.
 * @param fun A function that takes the Err value and returns a {@linkcode Result}<T, E2>.
 * @returns A function that takes a {@linkcode Result}<T, E1> (or a promise of one) and returns Promise<{@linkcode Result}<T, E2>>.
 */
export function attemptRecoverAsync<T, E1, E2>(
  fun: (error: E1) => Result<T, E2> | Promise<Result<T, E2>>,
): (result: Result<T, E1> | Promise<Result<T, E1>>) => Promise<Result<T, E2>> {
  return function (result: Result<T, E1> | Promise<Result<T, E1>>) {
    return rattemptRecoverAsync(result, fun);
  };
}
