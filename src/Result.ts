/**
 * Represents a successful result containing a value of type `T`.
 * A plain tuple `[true, T]` used as the success variant of {@linkcode Result}.
 *
 * @example A successful Result
 * ```ts
 * const success: Ok<number> = [true, 42];
 * ```
 *
 * @template T The type of the success value.
 */
export type Ok<T> = [true, T];

/**
 * Represents a failed result containing an error of type `E`.
 * A plain tuple `[false, E]` used as the failure variant of {@linkcode Result}.
 *
 * @example A failed Result
 * ```ts
 * const failure: Err<string> = [false, "something went wrong"];
 * ```
 *
 * @template E The type of the error value.
 */
export type Err<E> = [false, E];

/**
 * A discriminated union representing either a success ({@linkcode Ok}<T>) or a failure ({@linkcode Err}<E>).
 * Encoded as plain tuples: `[true, T] | [false, E]`.
 *
 * @example Dividing two numbers safely
 * ```ts
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return err("division by zero");
 *   return ok(a / b);
 * }
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * An alias for {@linkcode Result}<T, E>. Useful when importing the type under the {@linkcode Result} namespace.
 *
 * @example Aliasing Result under a namespace import
 * ```ts
 * import * as Result from "@kovskyspring/just-results";
 *
 * // less readable
 * function example(): Result.Result<number, string> {
 *  return Result.ok(42);
 * }
 *
 * // more readable
 * function example(): Result.Type<number, string> {
 *   return Result.ok(42);
 * }
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 */
export type Type<T, E> = Result<T, E>;

/**
 * Extracts the success value type `T` from a {@linkcode Result} type.
 * Evaluates to `never` if the result is not an {@linkcode Ok}.
 *
 * @example Extracting the success type
 * ```ts
 * type MyResult = Result<number, string>;
 * type Value = InferOk<MyResult>; // number
 * ```
 *
 * @template R A {@linkcode Result} type to extract the Ok value type from.
 */
export type InferOk<R extends Result<unknown, unknown>> = R extends Ok<infer T>
  ? T
  : never;

/**
 * Extracts the error value type `E` from a {@linkcode Result} type.
 * Evaluates to `never` if the result is not an {@linkcode Err}.
 *
 * @example Extracting the error type
 * ```ts
 * type MyResult = Result<number, string>;
 * type ErrorType = InferErr<MyResult>; // string
 * ```
 *
 * @template E A {@linkcode Result} type to extract the Err value type from.
 */
export type InferErr<E extends Result<unknown, unknown>> = E extends
  Err<infer T> ? T : never;

/**
 * Extracts both the Ok value type and Err value type from a {@linkcode Result} as a tuple `[T, E]`.
 *
 * @example Extracting both the success and error types
 * ```ts
 * type MyResult = Result<number, string>;
 * type Both = InferResult<MyResult>; // [number, string]
 * ```
 *
 * @template R A {@linkcode Result} type to decompose.
 */
export type InferResult<R extends Result<unknown, unknown>> = [
  InferOk<R>,
  InferErr<R>,
];

/**
 * Constructs a successful {@linkcode Result} wrapping the given value.
 *
 * @example Wrapping a value in a successful Result
 * ```ts
 * const result = ok(42);
 * // result: Result<number, never> = [true, 42]
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value (inferred from context; defaults to `never`).
 * @param value The success value to wrap.
 * @returns A {@linkcode Result}<T, E> in the Ok state: `[true, value]`.
 */
export function ok<T = never, E = never>(value: T): Result<T, E> {
  return [true, value];
}

/**
 * Constructs a failed {@linkcode Result} wrapping the given error.
 *
 * @example Wrapping an error in a failed Result
 * ```ts
 * const result = err("not found");
 * // result: Result<never, string> = [false, "not found"]
 * ```
 *
 * @template T The type of the success value (inferred from context; defaults to `never`).
 * @template E The type of the error value.
 * @param error The error value to wrap.
 * @returns A {@linkcode Result}<T, E> in the Err state: `[false, error]`.
 */
export function err<T = never, E = never>(error: E): Result<T, E> {
  return [false, error];
}

/**
 * Type guard that narrows a {@linkcode Result}<T, E> to {@linkcode Ok}<T>.
 *
 * @example Narrowing a Result to Ok
 * ```ts
 * const result: Result<number, string> = ok(1);
 * if (isOk(result)) {
 *   console.log(result[1]); // number
 * }
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param result The result to test.
 * @returns `true` if the result is {@linkcode Ok}, narrowing the type to {@linkcode Ok}<T>.
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result[0] === true;
}

/**
 * Type guard that narrows a {@linkcode Result}<T, E> to {@linkcode Err}<E>.
 *
 * @example Narrowing a Result to Err
 * ```ts
 * const result: Result<number, string> = err("oops");
 * if (isErr(result)) {
 *   console.log(result[1]); // string
 * }
 * ```
 *
 * @template T The type of the success value.
 * @template E The type of the error value.
 * @param result The result to test.
 * @returns `true` if the result is {@linkcode Err}, narrowing the type to {@linkcode Err}<E>.
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result[0] === false;
}

/**
 * Extracts the value from an okay {@linkcode Result}.
 * The value has to have been narrowed down to an {@linkcode Ok}<T> type
 *
 * Use {@linkcode unwrap} or {@linkcode lazyUnwrap} if you have not determined
 * the result type.
 *
 * @example Reading the value out of an Ok Result
 * ```ts
 * const result: Ok<number> = [true, 42];
 *
 * // a bit hard to read
 * const value = result[1];
 *
 * // a bit more readable
 * const value = value(result);
 * ```
 *
 * @template T The type of the success value.
 * @param result A result already narrowed to {@linkcode Ok}<T>.
 * @returns The success value `T` stored in the tuple.
 */
export function value<T>(result: Ok<T>): T;

/**
 * Extracts the value from an error {@linkcode Result}.
 * The value has to have been narrowed down to an {@linkcode Err}<E> type
 *
 * Use {@linkcode unwrapError} or {@linkcode lazyUnwrapError} if you have not determined
 * the result type.
 *
 * @example Reading the error out of an Err Result
 * ```ts
 * const result: Err<string> = [false, "not found"];
 *
 * // a bit hard to read
 * const error = result[1];
 *
 * // a bit more readable
 * const error = value(result);
 * ```
 *
 * @template E The type of the error value.
 * @param result A result already narrowed to {@linkcode Err}<E>.
 * @returns The error value `E` stored in the tuple.
 */
export function value<E>(result: Err<E>): E;

export function value<T>(result: Ok<T> | Err<T>): T {
  return result[1];
}
