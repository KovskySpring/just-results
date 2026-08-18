import { err, isErr, ok, value } from "./Result.ts";
import type { InferErr, InferOk, Result } from "./Result.ts";

/**
 * Maps a list of {@linkcode Result} types to a list of their Ok value types.
 *
 * **Note**: Use a typed tuple to preserve the order of the Ok values.
 *
 * @example Extracting Ok value types from a tuple of Results
 * ```ts
 * type Inputs = [Result<number, string>, Result<boolean, Error>];
 * type OkValues = ResultTuplesToOkTuples<Inputs>;
 * // OkValues = [number, boolean]
 * ```
 *
 * @template T A readonly list of {@linkcode Result} types.
 */
export type ResultTuplesToOkTuples<T extends Result<unknown, unknown>[]> = {
  [Index in keyof T]: InferOk<T[Index]>;
};

/**
 * Union of all Err value types in a list of {@linkcode Result} types.
 *
 * @example Union of all Err types in a list of Results
 * ```ts
 * type Inputs = [Result<number, string>, Result<boolean, Error>];
 * type Errors = ResultTuplesToErrUnion<Inputs>;
 * // Errors = string | Error
 * ```
 *
 * @template T A readonly list of {@linkcode Result} types.
 */
export type ResultTuplesToErrUnion<T extends Result<unknown, unknown>[]> =
  InferErr<T[number]>;

/**
 * Map a list of results to a result with a list of all Ok values
 * or the first Err encountered.
 *
 * **Note**: Use a typed tuple to preserve the order of the Ok values.
 *
 * @example Combining multiple Results into one
 * ```ts
 * type Inputs = [Result<number, string>, Result<boolean, Error>];
 * type Combined = AllResultUnion<Inputs>;
 * // Combined = Result<[number, boolean], string | Error>
 * ```
 *
 * @template T A readonly list of {@linkcode Result} types.
 */
export type AllResultUnion<T extends Result<unknown, unknown>[]> = Result<
  ResultTuplesToOkTuples<T>,
  ResultTuplesToErrUnion<T>
>;

/**
 * Checks if all results in a list is ok.
 * Returns a single {@linkcode Result} containing a list
 * of all Ok values or the first Err encountered.
 *
 * @example Combining a username and age lookup
 * ```ts
 * // Ok<[1, "hello", true]>
 * const results = all([ok(1), ok("hello"), ok(true)] as const);
 *
 * // Err<"missing">
 * const withError = all([ok(1), err("missing"), ok(3)] as const);
 *
 * // Real-world example:
 * const usernameResult = getUsername(); // Result<string, Error>
 * const ageResult = getAge(); // Result<number, Error>
 * // `as const` is used to enforce the tuple type instead of widening to an array type.
 * const combined = all([usernameResult, ageResult] as const);
 *
 * if (isOk(combined)) {
 *     const [username, age] = value(combined);
 *     // ... use username and age
 * }
 * ```
 *
 * @template T A readonly list of {@linkcode Result} types.
 * @param list A readonly list of {@linkcode Result} values.
 * @returns {@linkcode Ok} with a list of all values if every result is {@linkcode Ok},
 *          or the first {@linkcode Err} encountered.
 */
export function all<T extends Result<unknown, unknown>[]>(
  list: readonly [...T],
): AllResultUnion<T> {
  const values: Array<unknown> = [];

  for (const result of list) {
    if (isErr(result)) {
      return err(value(result) as ResultTuplesToErrUnion<T>);
    }

    values.push(value(result));
  }

  return ok(values as ResultTuplesToOkTuples<T>);
}
