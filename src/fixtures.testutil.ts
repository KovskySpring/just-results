import { err, ok } from "./Result.ts";
import type { Result } from "./Result.ts";

/** Shared fixtures reused across the test modules. */
export const okValue = 42;
export const errValue = "boom";
export const okResult: Result<number, string> = ok(okValue);
export const errResult: Result<number, string> = err(errValue);

/** Mutable payloads used to assert that payloads are stored by reference. */
export interface User {
  id: number;
  name: string;
  tags: string[];
}

export function makeUser(): User {
  return { id: 1, name: "ada", tags: ["admin"] };
}

/** Falsy and nullish payloads that must never be confused with absence. */
export const falsyValues: readonly unknown[] = [
  0,
  -0,
  "",
  false,
  null,
  undefined,
  NaN,
  0n,
];

/** A Result whose Ok payload is itself a Result. */
export const nestedOkResult: Result<Result<number, string>, string> = ok(
  okResult,
);

/** A Result carrying a structured error object. */
export class FailureError extends Error {
  constructor(readonly code: number) {
    super(`failure ${code}`);
    this.name = "FailureError";
  }
}
