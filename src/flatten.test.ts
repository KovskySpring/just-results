import { assertEquals, assertStrictEquals } from "@std/assert";
import { flatten } from "./flatten.ts";
import { err, ok } from "./Result.ts";
import type { Result } from "./Result.ts";
import {
  errValue,
  falsyValues,
  nestedOkResult,
  okResult,
  okValue,
} from "./fixtures.testutil.ts";

const outerError = "outer";

Deno.test("flatten returns the inner Ok by reference", () => {
  assertStrictEquals(flatten(nestedOkResult), okResult);
  assertEquals(flatten(nestedOkResult), ok(okValue));
});

Deno.test("flatten returns the inner Err by reference", () => {
  const inner: Result<number, string> = err(errValue);
  const nested: Result<Result<number, string>, string> = ok(inner);

  assertStrictEquals(flatten(nested), inner);
});

Deno.test("flatten passes the outer Err through by reference", () => {
  const nested: Result<Result<number, string>, string> = err(outerError);

  assertStrictEquals(flatten(nested), nested);
});

Deno.test("flatten collapses one level only", () => {
  const nested: Result<Result<Result<number, string>, string>, string> = ok(
    nestedOkResult,
  );

  assertStrictEquals(flatten(nested), nestedOkResult);
  assertEquals(flatten(flatten(nested)), ok(okValue));
});

Deno.test("flatten keeps falsy payloads on every level", () => {
  for (const candidate of falsyValues) {
    assertEquals(flatten(ok(ok(candidate))), ok(candidate));
    assertEquals(flatten(ok(err(candidate))), err(candidate));
    assertEquals(flatten(err(candidate)), err(candidate));
  }
});
