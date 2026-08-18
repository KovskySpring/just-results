import { isErr, isOk, value } from "./Result.ts";
import type { Result } from "./Result.ts";

/**
 * Run a side-effect on the Ok value without modifying it.
 * If the result is {@linkcode Err}, the function is skipped.
 * Equivalent to using a function that returns the original result
 * after running some side-effect.
 *
 * **Note**: Useful for logging, debugging, or triggering effects mid-pipeline.
 * The **side-effect** function should stay pure and avoid modifying the result
 * or its value. You must maintain this constraint yourself. {@linkcode tap} doesn't enforce
 * it to stay flexible.
 *
 * @example Logging a success value
 * ```ts
 * const result = tap(ok(42), (n) => console.log("Got:", n));
 * // Logs "Got: 42"
 * // result: Result<number, never> = [true, 42]
 *
 * const failure = tap(err("oops"), (n) => console.log("Got:", n));
 * // Nothing is logged
 * // failure: Result<number, string> = [false, "oops"]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param result The result to inspect.
 * @param fun A side-effect function to call with the Ok value.
 * @returns The original {@linkcode Result} unchanged.
 */
export function tap<T, E>(
  result: Result<T, E>,
  fun: (value: T) => void,
): Result<T, E> {
  if (isOk(result)) {
    fun(value(result));
  }

  return result;
}

/**
 * Runs a side-effect function on the Err value without modifying it.
 * If the result is {@linkcode Ok}, the function is skipped.
 * Equivalent to using a function that returns the original result
 * after running some side-effect.
 *
 * **Note**: Useful for logging, debugging, or triggering effects mid-pipeline.
 * The **side-effect** function should stay pure and avoid modifying the result
 * or its value. You must maintain this constraint yourself. {@linkcode tap} doesn't enforce
 * it to stay flexible.
 *
 * @example Logging an error
 * ```ts
 * const result = tapError(err("not found"), (e) => console.error("Error:", e));
 * // Logs "Error: not found"
 * // result: Result<never, string> = [false, "not found"]
 *
 * const success = tapError(ok(1), (e) => console.error("Error:", e));
 * // Nothing is logged
 * // success: Result<number, string> = [true, 1]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param result The result to inspect.
 * @param fun A side-effect function to call with the Err value.
 * @returns The original {@linkcode Result} unchanged.
 */
export function tapError<T, E>(
  result: Result<T, E>,
  fun: (error: E) => void,
): Result<T, E> {
  if (isErr(result)) {
    fun(value(result));
  }

  return result;
}

/**
 * Run a side-effect on the Ok value without modifying it.
 * If the result is {@linkcode Err}, the function is skipped.
 * Equivalent to using a function that returns the original result
 * after running some side-effect.
 *
 * This is the async version of {@linkcode tap}.
 * Awaits the async side-effect before returning the original result.
 *
 * **Note**: Useful for logging, debugging, or triggering effects mid-pipeline.
 * The **side-effect** function should stay pure and avoid modifying the result
 * or its value. You must maintain this constraint yourself. {@linkcode tap} doesn't enforce
 * it to stay flexible.
 *
 * @example Auditing a success value asynchronously
 * ```ts
 * const result = await tapAsync(ok("data"), async (v) => {
 *   await audit.log(`Processed: ${v}`);
 * });
 * // result: Result<string, never> = [true, "data"]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param result The result to inspect.
 * @param fun An async side-effect function to call with the Ok value.
 * @returns A Promise<{@linkcode Result}<T, E>> resolving to the original {@linkcode Result} unchanged.
 */
export function tapAsync<T, E>(
  result: Result<T, E> | Promise<Result<T, E>>,
  fun: (value: T) => void | Promise<void>,
): Promise<Result<T, E>> {
  return Promise.resolve(result).then((result) =>
    isOk(result)
      ? Promise.resolve(fun(value(result))).then(() => result)
      : Promise.resolve(result)
  );
}

/**
 * Runs a side-effect function on the Err value without modifying it.
 * If the result is {@linkcode Ok}, the function is skipped.
 * Equivalent to using a function that returns the original result
 * after running some side-effect.
 *
 * This is the async version of {@linkcode tapError}.
 * Awaits the async side-effect before returning the original result.
 *
 * **Note**: Useful for logging, debugging, or triggering effects mid-pipeline.
 * The **side-effect** function should stay pure and avoid modifying the result
 * or its value. You must maintain this constraint yourself. {@linkcode tap} doesn't enforce
 * it to stay flexible.
 *
 * @example Reporting an error asynchronously
 * ```ts
 * const result = await tapErrorAsync(err("timeout"), async (e) => {
 *   await monitor.report(e);
 * });
 * // result: Result<never, string> = [false, "timeout"]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param result The result to inspect.
 * @param fun An async side-effect function to call with the Err value.
 * @returns A Promise<{@linkcode Result}<T, E>> resolving to the original {@linkcode Result} unchanged.
 */
export function tapErrorAsync<T, E>(
  result: Result<T, E> | Promise<Result<T, E>>,
  fun: (error: E) => void | Promise<void>,
): Promise<Result<T, E>> {
  return Promise.resolve(result).then((result) =>
    isErr(result)
      ? Promise.resolve(fun(value(result))).then(() => result)
      : Promise.resolve(result)
  );
}
