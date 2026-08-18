import { isErr, isOk, value } from "./Result.ts";
import type { Result } from "./Result.ts";

/**
 * Transform a result using a function that return a {@linkcode Result}.
 *
 * Use this on transformations that may fail.
 *
 * If the result is {@linkcode Ok}, applies `fun` to the value and returns the new {@linkcode Result}.
 * If the result is {@linkcode Err}, passes it through unchanged.
 *
 * **Note**: The error type widens to the union `E1 | E2`.
 *
 * @example Parsing a string into a number
 * ```ts
 * function parseNumber(s: string): Result<number, string> {
 *   const n = Number(s);
 *   return isNaN(n) ? err("not a number") : ok(n);
 * }
 *
 * const result = attempt(ok("42"), parseNumber); // Ok<42>
 * const failed = attempt(err("missing"), parseNumber); // Err<"missing">
 * ```
 *
 * @template T1 The type of the original success value.
 * @template T2 The type of the success value returned by `fun`.
 * @template E1 The type of the original error value.
 * @template E2 The type of the error value returned by `fun` (defaults to `E1`).
 * @param result The result
 * @param fun A function that takes the Ok value and returns a new {@linkcode Result}<T2, E2>.
 * @returns {@linkcode Result}<T2, E1 | E2>
 */
export function attempt<T1, T2, E1, E2 = E1>(
  result: Result<T1, E1>,
  fun: (value: T1) => Result<T2, E2>,
): Result<T2, E1 | E2> {
  if (isOk(result)) {
    return fun(value(result));
  }

  return result;
}

/**
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
 * const recovered = attemptRecover(err("bad input"), fallbackParse);
 * // recovered: Result<number, Error> = [false, Error("Could not recover from: bad input")]
 *
 * const success = attemptRecover(ok(1), fallbackParse);
 * // success: Result<number, Error> = [true, 1]
 * ```
 *
 * @template T The type of the success value.
 * @template E1 The type of the original error value.
 * @template E2 The type of the error value returned by the recovery function.
 * @param result The result
 * @param fun A function that takes the Err value and returns a {@linkcode Result}<T, E2>.
 * @returns {@linkcode Result}<T, E2>
 */
export function attemptRecover<T, E1, E2>(
  result: Result<T, E1>,
  fun: (error: E1) => Result<T, E2>,
): Result<T, E2> {
  if (isErr(result)) {
    return fun(value(result));
  }

  return result;
}

/**
 * The async version of {@linkcode attempt}.
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
 * @example Fetching a user by id
 * ```ts
 * async function fetchUser(id: number): Promise<Result<User, string>> {
 *   const user = await db.find(id);
 *   return user ? ok(user) : err("not found");
 * }
 *
 * const result = await attemptAsync(ok(42), fetchUser);
 * // result: Result<User, string>
 * ```
 *
 * @template T1 The type of the original success value.
 * @template T2 The type of the success value returned by `fun`.
 * @template E1 The type of the original error value.
 * @template E2 The type of the error value returned by `fun` (defaults to `E1`).
 * @param result The result
 * @param fun A function that takes the Ok value and returns a new {@linkcode Result}<T2, E2>.
 * @returns Promise<{@linkcode Result}<T2, E1 | E2>>.
 */
export function attemptAsync<T1, T2, E1, E2 = E1>(
  result: Result<T1, E1> | Promise<Result<T1, E1>>,
  fun: (value: T1) => Result<T2, E2> | Promise<Result<T2, E2>>,
): Promise<Result<T2, E1 | E2>> {
  return Promise.resolve(result).then(
    (result): Promise<Result<T2, E1 | E2>> =>
      isOk(result)
        ? Promise.resolve(fun(value(result)))
        : Promise.resolve(result),
  );
}

/**
 * The async version of {@linkcode attemptRecover}.
 *
 * Recover from an {@linkcode Err} result using a function that returns a new {@linkcode Result}.
 *
 * Use this when the recovery operation may also fail.
 *
 * If the result is {@linkcode Err}, applies `fun` to the error and returns the new {@linkcode Result}.
 * If the result is {@linkcode Ok}, passes it through unchanged.
 *
 * @example Falling back to a cache lookup
 * ```ts
 * async function tryCache(key: string): Promise<Result<string, Error>> {
 *   const cached = await cache.get(key);
 *   return cached ? ok(cached) : err(new Error("cache miss"));
 * }
 *
 * const result = await attemptRecoverAsync(err("db error"), tryCache);
 * // result: Promise<Result<string, Error>>
 * ```
 *
 * @template T The type of the success value.
 * @template E1 The type of the original error value.
 * @template E2 The type of the error value returned by the recovery function.
 * @param result The result
 * @param fun A function that takes the Err value and returns a {@linkcode Result}<T, E2>.
 * @returns Promise<{@linkcode Result}<T, E2>>
 */
export function attemptRecoverAsync<T, E1, E2>(
  result: Result<T, E1> | Promise<Result<T, E1>>,
  fun: (error: E1) => Result<T, E2> | Promise<Result<T, E2>>,
): Promise<Result<T, E2>> {
  return Promise.resolve(result).then(
    (result): Promise<Result<T, E2>> =>
      isErr(result)
        ? Promise.resolve(fun(value(result)))
        : Promise.resolve(result),
  );
}
