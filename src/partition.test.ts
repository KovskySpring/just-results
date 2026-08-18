import { assertEquals, assertStrictEquals } from "@std/assert";
import { partition } from "./partition.ts";
import { err, ok } from "./Result.ts";
import type { Result } from "./Result.ts";
import {
  errResult,
  errValue,
  FailureError,
  falsyValues,
  makeUser,
  okResult,
  okValue,
} from "./fixtures.testutil.ts";
import type { User } from "./fixtures.testutil.ts";

Deno.test("partition splits values and errors, keeping order and duplicates", () => {
  const results: Result<number, string>[] = [
    err("a"),
    ok(1),
    ok(1),
    err("a"),
    ok(2),
  ];

  assertEquals(partition(results), [[1, 1, 2], ["a", "a"]]);
});

Deno.test("partition returns empty branches when a branch has no entries", () => {
  assertEquals(partition([okResult, ok(1)]), [[okValue, 1], []]);
  assertEquals(partition([errResult, err("other")]), [[], [errValue, "other"]]);
  assertEquals(partition([]), [[], []]);
});

Deno.test("partition keeps falsy payloads on both branches", () => {
  const oks = falsyValues.map((candidate) => ok<unknown, unknown>(candidate));
  const errs = falsyValues.map((candidate) => err<unknown, unknown>(candidate));

  assertEquals(partition(oks), [[...falsyValues], []]);
  assertEquals(partition(errs), [[], [...falsyValues]]);
});

Deno.test("partition preserves payload identity", () => {
  const user = makeUser();
  const failure = new FailureError(500);
  const [values, errors] = partition<User, FailureError>([
    ok(user),
    err(failure),
  ]);

  assertStrictEquals(values[0], user);
  assertStrictEquals(errors[0], failure);
});

Deno.test("partition returns fresh arrays and leaves the input untouched", () => {
  const results: Result<number, string>[] = [okResult, errResult];
  const [values, errors] = partition(results);

  values.push(99);
  errors.push("extra");

  assertEquals(results, [okResult, errResult]);
  assertEquals(partition(results), [[okValue], [errValue]]);
});
