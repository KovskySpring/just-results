import {
  assert,
  assertEquals,
  assertRejects,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";
import { asyncLazyOr, lazyOr, or } from "./or.ts";
import { err, ok } from "./Result.ts";
import type { Result } from "./Result.ts";
import {
  errResult,
  errValue,
  FailureError,
  okResult,
  okValue,
} from "./fixtures.testutil.ts";

const second: Result<number, string> = ok(99);

Deno.test("or keeps the first result when it is Ok", () => {
  assertEquals(or(okResult, second), ok(okValue));
});

Deno.test("lazyOr only calls the factory on Err", () => {
  let calls = 0;
  const factory = (): Result<number, string> => {
    calls += 1;
    return second;
  };

  assertEquals(lazyOr(okResult, factory), ok(okValue));
  assertEquals(calls, 0);

  assertEquals(lazyOr(errResult, factory), second);
  assertEquals(calls, 1);
});

Deno.test("asyncLazyOr resolves sync and async inputs", async () => {
  assertEquals(await asyncLazyOr(okResult, () => second), ok(okValue));
  assertEquals(await asyncLazyOr(errResult, () => second), second);
  assertEquals(
    await asyncLazyOr(
      Promise.resolve(errResult),
      () => Promise.resolve(second),
    ),
    second,
  );
  assertEquals(
    await asyncLazyOr(Promise.resolve(errResult), () => err(errValue)),
    err(errValue),
  );
});

Deno.test("asyncLazyOr does not call the factory when the first is Ok", async () => {
  let calls = 0;
  const factory = (): Promise<Result<number, string>> => {
    calls += 1;
    return Promise.resolve(second);
  };

  assertEquals(await asyncLazyOr(Promise.resolve(okResult), factory), okResult);
  assertEquals(calls, 0);
});

Deno.test("or returns the winning result by reference", () => {
  assertStrictEquals(or(okResult, second), okResult);
  assertStrictEquals(or(errResult, second), second);
  assertEquals(or(errResult, err("other")), err("other"));
});

Deno.test("lazyOr propagates a throwing factory only on Err", () => {
  const boom = (): Result<number, string> => {
    throw new FailureError(500);
  };

  assertStrictEquals(lazyOr(okResult, boom), okResult);
  assertThrows(() => lazyOr(errResult, boom), FailureError);
});

Deno.test("asyncLazyOr always returns a promise, even for sync inputs", () => {
  const pending = asyncLazyOr(okResult, () => second);

  assert(pending instanceof Promise);
  return pending.then((result) => assertEquals(result, okResult));
});

Deno.test("asyncLazyOr rejects when the first promise rejects", async () => {
  let calls = 0;
  const factory = (): Result<number, string> => {
    calls += 1;
    return second;
  };

  await assertRejects(
    () => asyncLazyOr(Promise.reject(new FailureError(500)), factory),
    FailureError,
  );
  assertEquals(calls, 0);
});

Deno.test("asyncLazyOr rejects when the factory throws or rejects", async () => {
  await assertRejects(
    () =>
      asyncLazyOr(errResult, (): Result<number, string> => {
        throw new FailureError(500);
      }),
    FailureError,
  );
  await assertRejects(
    () => asyncLazyOr(errResult, () => Promise.reject(new FailureError(500))),
    FailureError,
  );
});
