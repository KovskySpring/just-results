import type { Result } from "../Result.ts";
import {
  tap as rtap,
  tapAsync as rtapAsync,
  tapError as rtapError,
  tapErrorAsync as rtapErrorAsync,
} from "../tap.ts";

/**
 * This is the pipeable variant of {@linkcode tap}.
 *
 * Takes the side-effect first and returns a function that accepts the
 * {@linkcode Result}, so it can be dropped straight into a pipeline.
 *
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
 * @example Logging a success value mid-pipeline
 * ```ts
 * const result = pipe(
 *   ok(5),
 *   map((n: number) => n * 2),
 *   tap((n: number) => console.log("Got:", n)),
 * );
 * // Logs "Got: 10"
 * // result: Result<number, never> = [true, 10]
 *
 * const failure = pipe(err("oops"), tap((n: number) => console.log("Got:", n)));
 * // Nothing is logged
 * // failure: Result<number, string> = [false, "oops"]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param fun A side-effect function to call with the Ok value.
 * @returns A function that takes a {@linkcode Result}<T, E> and returns it unchanged.
 */
export function tap<T, E>(
  fun: (value: T) => void,
): (result: Result<T, E>) => Result<T, E> {
  return function (result: Result<T, E>) {
    return rtap(result, fun);
  };
}

/**
 * This is the pipeable variant of {@linkcode tapError}.
 *
 * Takes the side-effect first and returns a function that accepts the
 * {@linkcode Result}, so it can be dropped straight into a pipeline.
 *
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
 * @example Logging an error mid-pipeline
 * ```ts
 * const result = pipe(
 *   err("not found"),
 *   tapError((e: string) => console.error("Error:", e)),
 * );
 * // Logs "Error: not found"
 * // result: Result<never, string> = [false, "not found"]
 *
 * const success = pipe(ok(1), tapError((e: string) => console.error("Error:", e)));
 * // Nothing is logged
 * // success: Result<number, string> = [true, 1]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param fun A side-effect function to call with the Err value.
 * @returns A function that takes a {@linkcode Result}<T, E> and returns it unchanged.
 */
export function tapError<T, E>(
  fun: (error: E) => void,
): (result: Result<T, E>) => Result<T, E> {
  return function (result: Result<T, E>) {
    return rtapError(result, fun);
  };
}

/**
 * This is the pipeable variant of {@linkcode tapAsync}.
 *
 * Takes the side-effect first and returns a function that accepts the
 * {@linkcode Result} — or a promise of one, so it chains onto the output of
 * another async step in a pipeline.
 *
 * Run a side-effect on the Ok value without modifying it.
 * If the result is {@linkcode Err}, the function is skipped.
 * Equivalent to using a function that returns the original result
 * after running some side-effect.
 *
 * Awaits the async side-effect before returning the original result.
 *
 * **Note**: Useful for logging, debugging, or triggering effects mid-pipeline.
 * The **side-effect** function should stay pure and avoid modifying the result
 * or its value. You must maintain this constraint yourself. {@linkcode tap} doesn't enforce
 * it to stay flexible.
 *
 * @example Auditing a success value asynchronously in a pipeline
 * ```ts
 * const result = await pipe(
 *   ok("data"),
 *   tapAsync(async (v: string) => {
 *     await audit.log(`Processed: ${v}`);
 *   }),
 * );
 * // result: Result<string, never> = [true, "data"]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param fun An async side-effect function to call with the Ok value.
 * @returns A function that takes a {@linkcode Result}<T, E> (or a promise of one) and returns a Promise<{@linkcode Result}<T, E>> resolving to it unchanged.
 */
export function tapAsync<T, E>(
  fun: (value: T) => void | Promise<void>,
): (result: Result<T, E> | Promise<Result<T, E>>) => Promise<Result<T, E>> {
  return function (result: Result<T, E> | Promise<Result<T, E>>) {
    return rtapAsync(result, fun);
  };
}

/**
 * This is the pipeable variant of {@linkcode tapErrorAsync}.
 *
 * Takes the side-effect first and returns a function that accepts the
 * {@linkcode Result} — or a promise of one, so it chains onto the output of
 * another async step in a pipeline.
 *
 * Runs a side-effect function on the Err value without modifying it.
 * If the result is {@linkcode Ok}, the function is skipped.
 * Equivalent to using a function that returns the original result
 * after running some side-effect.
 *
 * Awaits the async side-effect before returning the original result.
 *
 * **Note**: Useful for logging, debugging, or triggering effects mid-pipeline.
 * The **side-effect** function should stay pure and avoid modifying the result
 * or its value. You must maintain this constraint yourself. {@linkcode tap} doesn't enforce
 * it to stay flexible.
 *
 * @example Reporting an error asynchronously in a pipeline
 * ```ts
 * const result = await pipe(
 *   err("timeout"),
 *   tapErrorAsync(async (e: string) => {
 *     await monitor.report(e);
 *   }),
 * );
 * // result: Result<never, string> = [false, "timeout"]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param fun An async side-effect function to call with the Err value.
 * @returns A function that takes a {@linkcode Result}<T, E> (or a promise of one) and returns a Promise<{@linkcode Result}<T, E>> resolving to it unchanged.
 */
export function tapErrorAsync<T, E>(
  fun: (error: E) => void | Promise<void>,
): (result: Result<T, E> | Promise<Result<T, E>>) => Promise<Result<T, E>> {
  return function (result: Result<T, E> | Promise<Result<T, E>>) {
    return rtapErrorAsync(result, fun);
  };
}
