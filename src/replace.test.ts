import {
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
} from "@std/assert";
import { replace, replaceError } from "./replace.ts";
import { err, ok, value } from "./Result.ts";
import type { Err, Ok } from "./Result.ts";
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

Deno.test("replace substitutes the Ok value and passes the Err by reference", () => {
  assertEquals(replace(okResult, "done"), ok("done"));
  assertStrictEquals(replace(errResult, "done"), errResult);
});

Deno.test("replace keeps falsy and nullish replacements", () => {
  for (const candidate of falsyValues) {
    assertEquals(replace(okResult, candidate), ok(candidate));
  }
});

Deno.test("replace stores the replacement by reference in a fresh Ok", () => {
  const user = makeUser();
  const replaced = replace(okResult, user);

  assertStrictEquals(value(replaced as Ok<User>), user);
  assertNotStrictEquals<unknown>(replaced, okResult);
  assertEquals(okResult, ok(okValue));
});

Deno.test("replaceError substitutes the Err value and passes the Ok by reference", () => {
  assertEquals(replaceError(errResult, 404), err(404));
  assertStrictEquals(replaceError(okResult, 404), okResult);
});

Deno.test("replaceError keeps falsy and nullish replacements", () => {
  for (const candidate of falsyValues) {
    assertEquals(replaceError(errResult, candidate), err(candidate));
  }
});

Deno.test("replaceError stores the replacement error by reference in a fresh Err", () => {
  const failure = new FailureError(500);
  const replaced = replaceError(errResult, failure);

  assertStrictEquals(value(replaced as Err<FailureError>), failure);
  assertNotStrictEquals<unknown>(replaced, errResult);
  assertEquals(errResult, err(errValue));
});
