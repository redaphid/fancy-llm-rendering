# Fancy LLM Rendering

A TypeScript library that transforms markdown into beautiful, infographic-style HTML using LLM-generated code.

## What It Does

Transform plain markdown documents into visually engaging, infographic-style HTML output. The LLM acts as a creative designer, generating HTML/CSS that presents content in a visually compelling way rather than plain formatted text.

The output should feel like a marketing landing page or presentation slide, not a GitHub README preview.

## Critical Invariant: Link Preservation

Links from source markdown are preserved **exactly** as provided. URLs must not be modified, truncated, or hallucinated. If any link from the source doesn't appear in the final output, the render operation fails.

This is achieved through a tokenize-transform-restore-validate pipeline. See [STYLE_GUIDE.md](./STYLE_GUIDE.md) for implementation details.

## API Levels

**Fragment Level** - HTML content only, for embedding in existing pages

**Component Level** - HTML + scoped CSS, returned separately

**Document Level** - Complete standalone HTML file with embedded styles

## Quick Start

```bash
pnpm install
```

```typescript
import { renderDocument } from "fancy-llm-rendering"

const markdown = `
# My Project
Check out [the docs](https://example.com/docs).
`

const html = await renderDocument(markdown, {
  provider: "ollama",
  model: "qwen3:8b"
})
```

## Development

```bash
# Run tests (always use --run flag)
pnpm test -- --run

# Run exploratory scripts
tsx scripts/test/my-script.ts
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Full project specification
- [STYLE_GUIDE.md](./STYLE_GUIDE.md) - TypeScript conventions, URL preservation patterns, testing methodology

## Technical Constraints

- Valid HTML5, no script tags
- Self-contained: works offline with no external resources
- CSS scoped to prevent style leakage
- OpenAI-compatible API (works with Ollama, OpenAI, etc.)
