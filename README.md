# just-results

A zero-dependency TypeScript `Result` type library for explicit, type-safe error
handling.

Results are plain 2-element tuples:

- `Ok<T>` is `[true, T]`
- `Err<E>` is `[false, E]`
- `Result<T, E>` is `Ok<T> | Err<E>`

## A set of utilities for working with `Result` types

- **Core types** - `Result<T, E>`, `Ok<T>`, `Err<E>`, and the `InferOk` /
  `InferErr` / `InferResult` helpers.
- **Constructors, checkers** - `ok`, `err`, `isOk`, `isErr`.
- **Read** - `value`, `or`, `unwrap`, `unwrapError` with lazy and async
  variants.
- **Transform** with asynchronous variants.
  - **Map**: `map`, `mapError`, `attempt`, `attemptRecover`.
  - **Replace**: `replace`, `replaceError`.
  - **Tap for side effects**: `tap`, `tapError`.
- **Combine & split** - `all`, `partition`, `flatten`.

---

## Installation

This package is published to [JSR](https://jsr.io) as
[`@kovskyspring/just-results`](https://jsr.io/@kovskyspring/just-results).

```bash
# deno
deno add jsr:@kovskyspring/just-results

# pnpm 10.9+ and yarn 4.9+
pnpm add jsr:@kovskyspring/just-results
yarn add jsr:@kovskyspring/just-results

# npm, bun, and older versions of yarn or pnpm
npx jsr add @kovskyspring/just-results
bunx jsr add @kovskyspring/just-results
yarn dlx jsr add @kovskyspring/just-results
pnpm dlx jsr add @kovskyspring/just-results
```

## Usage

```ts
import { attempt, err, map, ok, unwrap } from "@kovskyspring/just-results";
import type { Result } from "@kovskyspring/just-results";

// Fallible steps return a Result instead of throwing.
function parseAge(input: string): Result<number, string> {
  const age = Number(input);
  return Number.isNaN(age) ? err(`not a number: ${input}`) : ok(age);
}

function checkAdult(age: number): Result<number, string> {
  return age >= 18 ? ok(age) : err("must be 18 or older");
}

// Chain them: the first Err short-circuits and the rest is skipped.
const result = map(
  attempt(parseAge("21"), checkAdult),
  (age) => `welcome, age ${age}`,
);
// result: Result<string, string> = [true, "welcome, age 21"]

unwrap(result, "rejected"); // "welcome, age 21"

// Or destructure the tuple
// It's recommened to use checks, mappers and unwrappers instead
// of destructuring. Because it's more explicit, type-safe and readable.
// But destructuring still works.
const [success, payload] = result; // it's just a tuple
```

---

## Documentation

Check out the documentations on
[jsr.io/@kovskyspring/just-results](https://jsr.io/@kovskyspring/just-results)

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

I use [Mise](https://mise.jdx.dev/) to manage tooling for the project. The
project uses [Deno](https://deno.com) for development and building. If you use
`mise`, just clone the repo and you're ready to go. Otherwise, please install
Deno and ensure the version matches with the one specified in `mise.toml`.
