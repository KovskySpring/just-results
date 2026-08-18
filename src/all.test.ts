import { assertEquals, assertStrictEquals } from "@std/assert";
import { all } from "./all.ts";
import { err, isOk, ok, value } from "./Result.ts";
import type { Err } from "./Result.ts";
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

Deno.test("all collects every Ok value in order", () => {
  assertEquals(
    all([ok(1), ok("hello"), ok(true)] as const),
    ok([
      1,
      "hello",
      true,
    ]),
  );
  assertEquals(all([]), ok([]));
});

Deno.test("all returns the first Err regardless of its position", () => {
  assertEquals(
    all([ok(1), err("first"), err("second")] as const),
    err("first"),
  );
  assertEquals(all([errResult, okResult] as const), err(errValue));
});

Deno.test("all keeps falsy payloads on both branches", () => {
  const oks = falsyValues.map((candidate) => ok<unknown, unknown>(candidate));

  assertEquals(all(oks), ok([...falsyValues]));

  for (const candidate of falsyValues) {
    assertEquals(
      all([ok<unknown, unknown>(1), err<unknown, unknown>(candidate)]),
      err(candidate),
    );
  }
});

Deno.test("all preserves payload identity", () => {
  const user = makeUser();
  const first = new FailureError(404);
  const second = new FailureError(500);
  const okCombined = all([ok<User, never>(user)] as const);
  const errCombined = all(
    [
      err<never, FailureError>(first),
      err<never, FailureError>(second),
    ] as const,
  );

  if (!isOk(okCombined)) {
    throw new Error("expected Ok");
  }

  assertStrictEquals(value(okCombined)[0], user);
  assertStrictEquals(value(errCombined as Err<FailureError>), first);
});

Deno.test("all does not mutate the input", () => {
  const list = [okResult, errResult] as const;
  const snapshot = [...list];

  all(list);

  assertEquals([...list], snapshot);
  assertEquals(
    all([okResult, ok<number, string>(1)] as const),
    ok([
      okValue,
      1,
    ]),
  );
});
