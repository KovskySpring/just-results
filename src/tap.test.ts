import {
  assertEquals,
  assertRejects,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";
import { tap, tapAsync, tapError, tapErrorAsync } from "./tap.ts";
import { ok } from "./Result.ts";
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

Deno.test("tap runs the side effect on Ok and returns the same result", () => {
  const seen: number[] = [];
  const result = tap(okResult, (n) => seen.push(n));

  assertEquals(seen, [okValue]);
  assertStrictEquals(result, okResult);
});

Deno.test("tap skips the side effect on Err", () => {
  const seen: number[] = [];
  const result = tap(errResult, (n) => seen.push(n));

  assertEquals(seen, []);
  assertStrictEquals(result, errResult);
});

Deno.test("tap passes the Ok payload by reference and ignores the callback return", () => {
  const user = makeUser();
  const source = ok<User, string>(user);
  const result = tap(source, (current) => {
    assertStrictEquals(current, user);
    return "ignored";
  });

  assertStrictEquals(result, source);
});

Deno.test("tap still runs on falsy Ok payloads", () => {
  const seen: unknown[] = [];
  for (const candidate of falsyValues) {
    tap(ok(candidate), (current) => {
      seen.push(current);
    });
  }

  assertEquals(seen.length, falsyValues.length);
});

Deno.test("tapError runs the side effect on Err and returns the same result", () => {
  const seen: string[] = [];
  const result = tapError(errResult, (error) => seen.push(error));

  assertEquals(seen, [errValue]);
  assertStrictEquals(result, errResult);
});

Deno.test("tapError skips the side effect on Ok", () => {
  const seen: string[] = [];
  const result = tapError(okResult, (error) => seen.push(error));

  assertEquals(seen, []);
  assertStrictEquals(result, okResult);
});

Deno.test("tap and tapError propagate a throwing side effect", () => {
  assertThrows(() =>
    tap(okResult, () => {
      throw new FailureError(500);
    }), FailureError);
  assertThrows(
    () =>
      tapError(errResult, () => {
        throw new FailureError(404);
      }),
    FailureError,
  );
});

Deno.test("tapAsync awaits the side effect before resolving to the same result", async () => {
  const order: string[] = [];
  const result = await tapAsync(Promise.resolve(okResult), async (n) => {
    await Promise.resolve();
    order.push(`effect:${n}`);
  });

  order.push("after");
  assertEquals(order, [`effect:${okValue}`, "after"]);
  assertStrictEquals(result, okResult);
});

Deno.test("tapErrorAsync awaits the side effect before resolving to the same result", async () => {
  const order: string[] = [];
  const result = await tapErrorAsync(
    Promise.resolve(errResult),
    async (error) => {
      await Promise.resolve();
      order.push(`effect:${error}`);
    },
  );

  order.push("after");
  assertEquals(order, [`effect:${errValue}`, "after"]);
  assertStrictEquals(result, errResult);
});

Deno.test("async taps skip the opposite branch and keep the reference", async () => {
  let calls = 0;
  const count = () => {
    calls += 1;
  };

  assertStrictEquals(await tapAsync(errResult, count), errResult);
  assertStrictEquals(await tapErrorAsync(okResult, count), okResult);
  assertEquals(calls, 0);
});

Deno.test("tapAsync rejects on a rejected input or side effect", async () => {
  await assertRejects(
    () => tapAsync(Promise.reject(new FailureError(500)), () => {}),
    FailureError,
  );
  await assertRejects(
    () => tapAsync(okResult, () => Promise.reject(new FailureError(500))),
    FailureError,
  );
  await assertRejects(
    () =>
      tapAsync(okResult, () => {
        throw new FailureError(500);
      }),
    FailureError,
  );
});

Deno.test("tapErrorAsync rejects on a rejected input or side effect", async () => {
  await assertRejects(
    () => tapErrorAsync(Promise.reject(new FailureError(404)), () => {}),
    FailureError,
  );
  await assertRejects(
    () => tapErrorAsync(errResult, () => Promise.reject(new FailureError(404))),
    FailureError,
  );
  await assertRejects(
    () =>
      tapErrorAsync(errResult, () => {
        throw new FailureError(404);
      }),
    FailureError,
  );
});
