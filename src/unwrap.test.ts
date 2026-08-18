import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { lazyUnwrap, lazyUnwrapError, unwrap, unwrapError } from "./unwrap.ts";
import { err, ok } from "./Result.ts";
import {
  errResult,
  errValue,
  FailureError,
  okResult,
  okValue,
} from "./fixtures.testutil.ts";

Deno.test("unwrap returns the Ok value, else the fallback", () => {
  assertEquals(unwrap(okResult, 0), okValue);
  assertEquals(unwrap(errResult, 0), 0);
});

Deno.test("unwrapError returns the Err value, else the fallback", () => {
  assertEquals(unwrapError(errResult, "fallback"), errValue);
  assertEquals(unwrapError(okResult, "fallback"), "fallback");
});

Deno.test("lazyUnwrap only calls the fallback on Err", () => {
  let calls = 0;
  const fallback = () => {
    calls += 1;
    return -1;
  };

  assertEquals(lazyUnwrap(okResult, fallback), okValue);
  assertEquals(calls, 0);

  assertEquals(lazyUnwrap(errResult, fallback), -1);
  assertEquals(calls, 1);
});

Deno.test("lazyUnwrapError only calls the fallback on Ok", () => {
  let calls = 0;
  const fallback = () => {
    calls += 1;
    return "fallback";
  };

  assertEquals(lazyUnwrapError(errResult, fallback), errValue);
  assertEquals(calls, 0);

  assertEquals(lazyUnwrapError(okResult, fallback), "fallback");
  assertEquals(calls, 1);
});

Deno.test("unwrap and unwrapError return falsy payloads instead of the fallback", () => {
  assertStrictEquals(unwrap(ok(0), 99), 0);
  assertStrictEquals(unwrap(ok(""), "fallback"), "");
  assertStrictEquals(unwrap(ok(false), true), false);
  assertStrictEquals(unwrap(ok(undefined), "fallback" as unknown), undefined);
  assertStrictEquals(unwrap(ok(null), "fallback" as unknown), null);
  assertStrictEquals(unwrapError(err(0), 99), 0);
  assertStrictEquals(
    unwrapError(err(undefined), "fallback" as unknown),
    undefined,
  );
});

Deno.test("lazyUnwrap calls the fallback on every Err evaluation", () => {
  let calls = 0;
  const fallback = () => {
    calls += 1;
    return calls;
  };

  assertEquals(lazyUnwrap(errResult, fallback), 1);
  assertEquals(lazyUnwrap(errResult, fallback), 2);
  assertEquals(calls, 2);
});

Deno.test("lazy fallbacks propagate thrown errors", () => {
  assertThrows(
    () =>
      lazyUnwrap(errResult, () => {
        throw new FailureError(500);
      }),
    FailureError,
  );
  assertThrows(
    () =>
      lazyUnwrapError(okResult, () => {
        throw new FailureError(500);
      }),
    FailureError,
  );
});
