# Fancy LLM Rendering

A TypeScript library that transforms markdown into beautiful, infographic-style HTML using LLM-generated code.

## What It Does

Transform plain markdown documents into visually engaging, infographic-style HTML output. The LLM acts as a creative designer, generating HTML/CSS that presents content in a visually compelling way rather than plain formatted text.

**Output looks like:** Marketing landing pages, product feature overviews, presentation slides

**Output does NOT look like:** GitHub README previews, plain documentation, default browser styling

## Installation

```bash
pnpm install
```

## API

### renderDocument(markdown: string): Promise\<string\>

Generates a complete, standalone HTML5 document with embedded styles.

```typescript
import { renderDocument } from "./src/render"

const markdown = `# Welcome
Visit our [docs](https://docs.example.com) for help.`

const html = await renderDocument(markdown)
// Returns complete HTML document with DOCTYPE, styles, etc.
```

### renderFragment(markdown: string): Promise\<string\>

Generates HTML content only - no doctype, html, head, or body tags. For embedding in existing pages.

```typescript
import { renderFragment } from "./src/render"

const html = await renderFragment(markdown)
// Returns just the HTML content, caller provides document wrapper
```

### renderComponent(markdown: string): Promise\<{html: string, css: string}\>

Generates HTML and CSS separately, with scoped class names.

```typescript
import { renderComponent } from "./src/render"

const { html, css } = await renderComponent(markdown)
// HTML uses class names, CSS is scoped to avoid conflicts
```

### Validated Versions

These throw `MissingUrlsError` if any source URLs are missing from output:

```typescript
import { renderDocumentValidated, renderFragmentValidated, MissingUrlsError } from "./src/render"

try {
  const html = await renderDocumentValidated(markdown)
} catch (e) {
  if (e instanceof MissingUrlsError) {
    console.error("Missing URLs:", e.missingUrls)
  }
}
```

### Utility Functions

```typescript
import { extractUrls, validateUrls } from "./src/render"

// Extract all URLs from markdown links
const urls = extractUrls(markdown)
// ["https://docs.example.com", "https://api.example.com"]

// Check which URLs are missing from output
const missing = validateUrls(urls, html)
// Returns array of URLs not found in html
```

## Critical Invariant: Link Preservation

Links from source markdown are preserved **exactly** as provided. URLs must not be modified, truncated, or hallucinated.

This is achieved through a tokenize-transform-restore pipeline:
1. Extract all URLs from markdown links
2. Replace URLs with stable tokens (`__URL_TOKEN_0__`, etc.)
3. Send tokenized content to LLM
4. Restore original URLs in output
5. Convert any remaining markdown links to HTML anchors

## Development

```bash
# Run unit tests
pnpm test -- --run

# Run visual tests with Playwright (generates screenshots)
npx playwright test

# View generated screenshots
ls outputs/screenshots/

# View generated HTML files
ls outputs/html/
```

## Configuration

Currently uses Ollama with qwen3:8b model. The endpoint is hardcoded to `http://localhost:11434/api/chat`.

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Full project specification
- [STYLE_GUIDE.md](./STYLE_GUIDE.md) - TypeScript conventions, URL preservation patterns, testing methodology

## Technical Constraints

- Valid HTML5, no script tags
- Self-contained: works offline with no external resources
- CSS scoped to prevent style leakage
- OpenAI-compatible API format (works with Ollama)
