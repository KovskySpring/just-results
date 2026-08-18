import {
  assert,
  assertEquals,
  assertFalse,
  assertNotStrictEquals,
  assertStrictEquals,
} from "@std/assert";
import { err, isErr, isOk, ok, value } from "./Result.ts";
import type { Err, Ok, Result } from "./Result.ts";
import {
  errValue,
  falsyValues,
  nestedOkResult,
  okResult,
  okValue,
} from "./fixtures.testutil.ts";

Deno.test("ok wraps the value in a [true, value] tuple", () => {
  assertEquals(ok(okValue), [true, okValue]);
});

Deno.test("err wraps the error in a [false, error] tuple", () => {
  assertEquals(err(errValue), [false, errValue]);
});

Deno.test("value reads the payload of both variants", () => {
  assertEquals(value([true, okValue]), okValue);
  assertEquals(value([false, errValue]), errValue);
});

Deno.test("ok and err return a fresh tuple on every call", () => {
  const first = ok(okValue);
  const second = ok(okValue);

  assertNotStrictEquals(first, second);
  assertNotStrictEquals(err(errValue), err(errValue));
});

Deno.test("isOk and isErr are exhaustive for every payload", () => {
  for (const payload of falsyValues) {
    const okCase: Result<unknown, unknown> = ok(payload);
    const errCase: Result<unknown, unknown> = err(payload);

    assert(isOk(okCase));
    assertFalse(isErr(okCase));
    assertFalse(isOk(errCase));
    assert(isErr(errCase));
  }
});

Deno.test("value round-trips edge payloads, including NaN and -0", () => {
  assert(Number.isNaN(value(ok(NaN) as Ok<number>)));
  assertStrictEquals(value(ok(-0) as Ok<number>), -0);
  assertStrictEquals(value(err(0n) as Err<bigint>), 0n);
});

Deno.test("value unwraps only one layer of a nested Result", () => {
  const inner = value(nestedOkResult as Ok<Result<number, string>>);

  assertEquals(inner, okResult);
  assert(isOk(inner));
  assertEquals(value(inner as Ok<number>), okValue);
});
