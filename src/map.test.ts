import {
  assertEquals,
  assertNotStrictEquals,
  assertRejects,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";
import { map, mapAsync, mapError, mapErrorAsync } from "./map.ts";
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

const double = (n: number): number => n * 2;
const format = (error: string): string => `error: ${error}`;

Deno.test("map transforms the Ok value into a fresh tuple", () => {
  const mapped = map(okResult, double);

  assertEquals(mapped, ok(okValue * 2));
  assertNotStrictEquals(mapped, okResult);
});

Deno.test("map skips the callback on Err and passes it by reference", () => {
  let calls = 0;
  const result = map(errResult, (n) => {
    calls += 1;
    return double(n);
  });

  assertStrictEquals(result, errResult);
  assertEquals(calls, 0);
});

Deno.test("map calls the callback once with the exact Ok payload", () => {
  const user = makeUser();
  const seen: User[] = [];
  const mapped = map(ok<User, string>(user), (current) => {
    seen.push(current);
    return current;
  });

  assertEquals(seen.length, 1);
  assertStrictEquals(seen[0], user);
  assertStrictEquals(value(mapped as Ok<User>), user);
});

Deno.test("map keeps falsy and nullish results from the callback", () => {
  for (const candidate of falsyValues) {
    assertEquals(map(okResult, () => candidate), ok(candidate));
  }
});

Deno.test("map propagates a throwing callback", () => {
  assertThrows(
    () =>
      map(okResult, () => {
        throw new FailureError(500);
      }),
    FailureError,
  );
});

Deno.test("mapError transforms the Err value into a fresh tuple", () => {
  const failure = new FailureError(500);
  const mapped = mapError(errResult, () => failure);

  assertEquals(mapError(errResult, format), err(`error: ${errValue}`));
  assertStrictEquals(value(mapped as Err<FailureError>), failure);
  assertNotStrictEquals<unknown>(mapped, errResult);
});

Deno.test("mapError skips the callback on Ok and passes it by reference", () => {
  let calls = 0;
  const result = mapError(okResult, (error) => {
    calls += 1;
    return format(error);
  });

  assertStrictEquals(result, okResult);
  assertEquals(calls, 0);
});

Deno.test("mapError propagates a throwing callback", () => {
  assertThrows(
    () =>
      mapError(errResult, () => {
        throw new FailureError(404);
      }),
    FailureError,
  );
});

Deno.test("mapAsync accepts sync and async inputs and callbacks", async () => {
  assertEquals(await mapAsync(okResult, double), ok(okValue * 2));
  assertEquals(
    await mapAsync(
      Promise.resolve(okResult),
      (n) => Promise.resolve(double(n)),
    ),
    ok(okValue * 2),
  );
});

Deno.test("mapAsync skips the callback on Err and keeps the reference", async () => {
  let calls = 0;
  const result = await mapAsync(Promise.resolve(errResult), (n) => {
    calls += 1;
    return double(n);
  });

  assertStrictEquals(result, errResult);
  assertEquals(calls, 0);
});

Deno.test("mapAsync rejects when the input or the callback fails", async () => {
  await assertRejects(
    () => mapAsync(Promise.reject(new FailureError(500)), double),
    FailureError,
  );
  await assertRejects(
    () =>
      mapAsync(okResult, () => {
        throw new FailureError(500);
      }),
    FailureError,
  );
  await assertRejects(
    () => mapAsync(okResult, () => Promise.reject(new FailureError(500))),
    FailureError,
  );
});

Deno.test("mapErrorAsync accepts sync and async inputs and callbacks", async () => {
  assertEquals(
    await mapErrorAsync(errResult, format),
    err(`error: ${errValue}`),
  );
  assertEquals(
    await mapErrorAsync(
      Promise.resolve(errResult),
      (error) => Promise.resolve(format(error)),
    ),
    err(`error: ${errValue}`),
  );
});

Deno.test("mapErrorAsync skips the callback on Ok and keeps the reference", async () => {
  let calls = 0;
  const result = await mapErrorAsync(Promise.resolve(okResult), (error) => {
    calls += 1;
    return format(error);
  });

  assertStrictEquals(result, okResult);
  assertEquals(calls, 0);
});

Deno.test("mapErrorAsync rejects when the input or the callback fails", async () => {
  await assertRejects(
    () => mapErrorAsync(Promise.reject(new FailureError(404)), format),
    FailureError,
  );
  await assertRejects(
    () =>
      mapErrorAsync(errResult, () => {
        throw new FailureError(404);
      }),
    FailureError,
  );
  await assertRejects(
    () => mapErrorAsync(errResult, () => Promise.reject(new FailureError(404))),
    FailureError,
  );
});
