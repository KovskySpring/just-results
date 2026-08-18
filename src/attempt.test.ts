import {
  assertEquals,
  assertRejects,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";
import {
  attempt,
  attemptAsync,
  attemptRecover,
  attemptRecoverAsync,
} from "./attempt.ts";
import { err, ok, value } from "./Result.ts";
import type { Ok, Result } from "./Result.ts";
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

const recoveryError = 404;

const doubleChecked = (n: number): Result<number, number> =>
  n > 0 ? ok(n * 2) : err(recoveryError);

const recover = (error: string): Result<number, number> =>
  error === errValue ? ok(0) : err(recoveryError);

Deno.test("attempt returns the callback Result by reference", () => {
  const produced: Result<number, number> = ok(1);

  assertEquals(attempt(okResult, doubleChecked), ok(okValue * 2));
  assertEquals(attempt(ok(-1), doubleChecked), err(recoveryError));
  assertStrictEquals(attempt(okResult, () => produced), produced);
});

Deno.test("attempt skips the callback on Err and passes it by reference", () => {
  let calls = 0;
  const result = attempt(errResult, (n) => {
    calls += 1;
    return doubleChecked(n);
  });

  assertStrictEquals(result, errResult);
  assertEquals(calls, 0);
});

Deno.test("attempt calls the callback once with the exact Ok payload", () => {
  const user = makeUser();
  const seen: User[] = [];
  const result = attempt(ok<User, string>(user), (current) => {
    seen.push(current);
    return ok<User, string>(current);
  });

  assertEquals(seen.length, 1);
  assertStrictEquals(seen[0], user);
  assertStrictEquals(value(result as Ok<User>), user);
});

Deno.test("attempt keeps falsy payloads on both branches", () => {
  for (const candidate of falsyValues) {
    assertEquals(attempt(okResult, () => ok(candidate)), ok(candidate));
    assertEquals(attempt(okResult, () => err(candidate)), err(candidate));
  }
});

Deno.test("attempt propagates a throwing callback", () => {
  assertThrows(
    () =>
      attempt(okResult, () => {
        throw new FailureError(500);
      }),
    FailureError,
  );
});

Deno.test("attemptRecover returns the callback Result by reference", () => {
  const produced: Result<number, number> = err(recoveryError);

  assertEquals(attemptRecover(errResult, recover), ok(0));
  assertEquals(attemptRecover(err("other"), recover), err(recoveryError));
  assertStrictEquals(attemptRecover(errResult, () => produced), produced);
});

Deno.test("attemptRecover skips the callback on Ok and passes it by reference", () => {
  let calls = 0;
  const result = attemptRecover(okResult, (error) => {
    calls += 1;
    return recover(error);
  });

  assertStrictEquals(result, okResult);
  assertEquals(calls, 0);
});

Deno.test("attemptRecover keeps falsy payloads", () => {
  for (const candidate of falsyValues) {
    assertEquals(
      attemptRecover(errResult, () => err(candidate)),
      err(candidate),
    );
  }
});

Deno.test("attemptRecover propagates a throwing callback", () => {
  assertThrows(
    () =>
      attemptRecover(errResult, () => {
        throw new FailureError(404);
      }),
    FailureError,
  );
});

Deno.test("attemptAsync accepts sync and async inputs and callbacks", async () => {
  assertEquals(await attemptAsync(okResult, doubleChecked), ok(okValue * 2));
  assertEquals(
    await attemptAsync(
      Promise.resolve(okResult),
      (n) => Promise.resolve(doubleChecked(n)),
    ),
    ok(okValue * 2),
  );
  assertEquals(
    await attemptAsync(Promise.resolve(ok(-1)), doubleChecked),
    err(recoveryError),
  );
});

Deno.test("attemptAsync skips the callback on Err and keeps the reference", async () => {
  let calls = 0;
  const result = await attemptAsync(Promise.resolve(errResult), (n) => {
    calls += 1;
    return doubleChecked(n);
  });

  assertStrictEquals(result, errResult);
  assertEquals(calls, 0);
});

Deno.test("attemptAsync rejects when the input or the callback fails", async () => {
  await assertRejects(
    () => attemptAsync(Promise.reject(new FailureError(500)), doubleChecked),
    FailureError,
  );
  await assertRejects(
    () =>
      attemptAsync(okResult, () => {
        throw new FailureError(500);
      }),
    FailureError,
  );
  await assertRejects(
    () => attemptAsync(okResult, () => Promise.reject(new FailureError(500))),
    FailureError,
  );
});

Deno.test("attemptRecoverAsync accepts sync and async inputs and callbacks", async () => {
  assertEquals(await attemptRecoverAsync(errResult, recover), ok(0));
  assertEquals(
    await attemptRecoverAsync(
      Promise.resolve(errResult),
      (error) => Promise.resolve(recover(error)),
    ),
    ok(0),
  );
  assertEquals(
    await attemptRecoverAsync(Promise.resolve(err("other")), recover),
    err(recoveryError),
  );
});

Deno.test("attemptRecoverAsync skips the callback on Ok and keeps the reference", async () => {
  let calls = 0;
  const result = await attemptRecoverAsync(
    Promise.resolve(okResult),
    (error) => {
      calls += 1;
      return recover(error);
    },
  );

  assertStrictEquals(result, okResult);
  assertEquals(calls, 0);
});

Deno.test("attemptRecoverAsync rejects when the input or the callback fails", async () => {
  await assertRejects(
    () => attemptRecoverAsync(Promise.reject(new FailureError(404)), recover),
    FailureError,
  );
  await assertRejects(
    () =>
      attemptRecoverAsync(errResult, () => {
        throw new FailureError(404);
      }),
    FailureError,
  );
  await assertRejects(
    () =>
      attemptRecoverAsync(
        errResult,
        () => Promise.reject(new FailureError(404)),
      ),
    FailureError,
  );
});
