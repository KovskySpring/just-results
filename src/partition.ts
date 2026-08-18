import { isOk, value } from "./Result.ts";
import type { Result } from "./Result.ts";

/**
 * Splits a list of {@linkcode Result}<T, E> into a list of
 * values: `T[]` and a list of errors `E[]`.
 *
 * @example Splitting a list of Results into values and errors
 * ```ts
 * const results = [ok(1), err("a"), ok(2), err("b"), ok(3)];
 * const [values, errors] = partition(results);
 * // values: number[] = [1, 2, 3]
 * // errors: string[] = ["a", "b"]
 *
 * const allOk = [ok("x"), ok("y")];
 * const [vals, errs] = partition(allOk);
 * // vals: string[] = ["x", "y"]
 * // errs: string[] = []
 * ```
 *
 * @template T The type of the success values.
 * @template E The type of the error values.
 * @param results A list of {@linkcode Result}<T, E> values.
 * @returns A tuple `[T[], E[]]` where the first element
 *          is a list of all Ok values and
 *          the second is a list of all Err values.
 */
export function partition<T, E>(
  results: ReadonlyArray<Result<T, E>>,
): [Array<T>, Array<E>] {
  const oks: Array<T> = [];
  const errs: Array<E> = [];

  for (const result of results) {
    if (isOk(result)) {
      oks.push(value(result));
    } else {
      errs.push(value(result));
    }
  }

  return [oks, errs];
}
