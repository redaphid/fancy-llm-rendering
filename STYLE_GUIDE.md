# Style Guide

TypeScript coding style for this project follows the "Hemingway Edition" philosophy: sparse, simple, poetic like haiku.

## Core Principles

### Code as Haiku
- Maximum meaning in minimum form
- Beauty in sparseness
- Simplicity over cleverness
- Code is for humans first

### Worse is Better / Unix Mindset
- Start with smallest, simplest workable piece
- Evolve as needs grow
- Readability over cleverness

## TypeScript Style

### Functions
Always use arrow functions:
```typescript
// Good
const add = (a: number, b: number) => a + b

const processItems = (items: Item[]) => {
  return items.map(transform)
}

// Bad
function add(a: number, b: number): number {
  return a + b;
}
```

### No Semicolons
Rely on ASI (Automatic Semicolon Insertion):
```typescript
// Good
const name = "test"
const items = [1, 2, 3]

// Bad
const name = "test";
const items = [1, 2, 3];
```

### No Else Statements
Always use early returns:
```typescript
// Good
const getStatus = (score: number) => {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  return "F"
}

// Bad
const getStatus = (score: number) => {
  if (score >= 90) {
    return "A"
  } else if (score >= 80) {
    return "B"
  } else {
    return "F"
  }
}
```

### Single-Line Conditionals
No curly braces for single statements:
```typescript
// Good
if (condition) return early
if (isEmpty) throw new Error("Empty")

// Bad
if (condition) {
  return early;
}
```

### Minimal Type Annotations
Let TypeScript infer types:
```typescript
// Good - TypeScript infers the return type
const double = (n: number) => n * 2

// Bad - unnecessary annotation
const double = (n: number): number => n * 2
```

### Template Literals
Always use template literals for string formatting:
```typescript
// Good
const greeting = `Hello ${name}`

// Bad
const greeting = "Hello " + name
```

### Optional Chaining
Don't use `?.` defensively. If a value should exist, let it throw:
```typescript
// Good - explicit about expectations
const name = user.profile.name

// Bad - hiding potential bugs
const name = user?.profile?.name
```

### Variables
- `const` by default
- `let` only when mutation is essential
- Never use `var`

## Functional Programming

Prefer functional patterns over imperative:
```typescript
// Good
const doubled = items.map(x => x * 2)
const evens = items.filter(x => x % 2 === 0)
const sum = items.reduce((acc, x) => acc + x, 0)

// Bad
const doubled = []
for (let i = 0; i < items.length; i++) {
  doubled.push(items[i] * 2)
}
```

## Error Handling

### Assertive Programming
- Guard invariants explicitly
- Let errors bubble to top-level controllers
- Catch only in "controller" code (Worker fetch handler, CLI entry point)

### Fail Fast, Fail Loud
- Never fail gracefully or silently
- Create specific Error subclasses for each failure mode
- No try/catch except at system edges

```typescript
// Good - specific error types
class LinkValidationError extends Error {
  constructor(public missingLinks: string[]) {
    super(`Missing links: ${missingLinks.join(", ")}`)
  }
}

// Bad - swallowing errors
try {
  processLinks()
} catch {
  // silently continue
}
```

## URL Preservation Strategy

This is the most critical aspect of the system. URLs must survive LLM transformation intact.

### The Problem

LLMs can corrupt, hallucinate, or modify URLs when transforming content. This is a documented issue across GPT, Claude, and other models. Common failures include:
- Truncating query parameters
- Hallucinating similar but different URLs
- Dropping URL fragments
- Encoding/decoding issues

### The Solution: Tokenize-Transform-Restore-Validate Pipeline

Based on patterns from [dom-to-semantic-markdown](https://github.com/romansky/dom-to-semantic-markdown) (URL refification), [Crawl4AI](https://docs.crawl4ai.com/core/markdown-generation/) (citation-style links), and multi-model validation research.

**Phase 1: Pre-processing (Tokenize)**
```typescript
// Extract all URLs and replace with stable tokens
const markdown = "[Click here](https://example.com/path?query=1#section)"
const tokenized = "[Click here][ref:1]"
const urlMap = { "ref:1": "https://example.com/path?query=1#section" }
```

**Phase 2: LLM Processing**
```typescript
// Send tokenized content to LLM
// Prompt instructs: "Preserve all [ref:N] tokens exactly"
const styledHtml = await llm.transform(tokenized, { preserveTokens: true })
```

**Phase 3: Post-processing (Restore)**
```typescript
// Replace tokens back to original URLs
const restored = styledHtml.replace(/\[ref:(\d+)\]/g, (_, n) => urlMap[`ref:${n}`])
```

**Phase 4: Validation (Fail on Missing)**
```typescript
// Verify ALL original URLs appear in output
const outputUrls = extractUrls(restored)
const missingUrls = originalUrls.filter(url => !outputUrls.includes(url))

if (missingUrls.length > 0) {
  throw new LinkValidationError(missingUrls)
}
```

### Why This Works

1. **URL Refification**: Converting inline links to reference-style (`[text][ref:N]`) keeps URLs out of the LLM's creative scope
2. **Stable Tokens**: Simple patterns like `[ref:1]` are easy for LLMs to preserve verbatim
3. **Ground Truth Mapping**: The urlMap serves as immutable source of truth
4. **Validation Gate**: Missing URLs cause hard failures, not silent corruption

### What Tests Should Verify

Tests verify **URL integrity through transformation**, not "link extraction":

1. **Tokenization fidelity**: All URL types correctly replaced with tokens
2. **Restoration accuracy**: Tokens correctly map back to original URLs
3. **Validation strictness**: Missing URLs trigger failures
4. **Edge cases**: Query params, fragments, encoded chars, mailto:, relative paths

## Testing

### Framework
- Vitest with Jest syntax
- Test files: `*.test.ts` co-located with source
- **Always run with `--run` flag** (never watch mode in scripts)

### ADD Methodology (Asshole Driven Development)
Strict RED-GREEN-REFACTOR cycle:
1. Write the MINIMAL failing test first (RED)
2. Write ONLY enough code to make that test pass (GREEN)
3. Refactor only when tests pass
4. Do NOT add functionality not required by current failing test

### AAA Pattern (Arrange-Act-Assert)
```typescript
describe("UrlPreserver", () => {
  describe("when markdown contains links", () => {
    let result: TransformResult

    beforeEach(() => {
      // Arrange AND Act
      const markdown = "[test](https://example.com?foo=bar#section)"
      result = transformWithPreservation(markdown)
    })

    it("preserves the exact URL in output", () => {
      // Assert only
      expect(result.html).toContain("https://example.com?foo=bar#section")
    })
  })
})
```

### Test IDs
Use whimsical IDs: `test-<type>-<whimsy>`

## Project Structure

```
project/
├── src/                    # Source code
│   ├── module.ts          # Application code
│   └── module.test.ts     # Unit tests (co-located)
├── scripts/test/          # Debug/exploratory scripts
├── docs/                  # Documentation
├── outputs/               # Generated artifacts (gitignored)
└── README.md
```

## Package Management

- **pnpm only**, never npm
- Latest versions, no caret ranges
- Add `minimum-release-age=10080` to `.npmrc`

## Running TypeScript

Use `tsx` for running TypeScript directly:
```bash
tsx script.ts
```

Do NOT use `node --experimental-strip-types`.

## Library Philosophy

### Use Libraries For
- Complex algorithms (stats, crypto, ML, parsing)
- Well-tested functionality (validation, routing)
- Domain expertise (database drivers, API clients)
- Time-consuming implementations (date math, i18n)

### Avoid Libraries For
- Simple wrappers around native APIs
- Polyfills for modern features
- Trivial utilities you could write in 5 lines

### Preferred Libraries
- **Hono** - Routing
- **Zod** - Runtime validation with TypeScript inference
- **Vitest** - Testing
- **date-fns** - Date math

## References

URL preservation patterns informed by:
- [dom-to-semantic-markdown](https://github.com/romansky/dom-to-semantic-markdown) - URL refification
- [Crawl4AI](https://docs.crawl4ai.com/core/markdown-generation/) - Citation-style links
- [LLM Hallucination research](https://lilianweng.github.io/posts/2024-07-07-hallucination/) - Understanding why LLMs corrupt URLs
- [Neptune.ai post-processing guide](https://neptune.ai/blog/customizing-llm-output-post-processing-techniques) - Validation patterns
