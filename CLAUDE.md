# Fancy LLM Rendering

A TypeScript library that transforms markdown into beautiful, infographic-style HTML using LLM-generated code.

## Core Purpose

Transform plain markdown documents into visually engaging, infographic-style HTML output. The LLM acts as a creative designer, generating HTML/CSS that presents the content in a visually compelling way rather than as plain formatted text.

## Critical Requirements

### 1. Link Preservation (NON-NEGOTIABLE)

Links from the source markdown MUST be preserved exactly as provided. This is the most critical requirement of the entire system. URLs must not be modified, truncated, or hallucinated under any circumstances.

**What must be preserved exactly:**
- Full URLs with query parameters
- URL fragments (hash sections)
- Special characters in URLs
- Relative paths
- Email links (mailto:)
- Any other URI scheme

**Strategy:** The system must extract all links from the markdown before passing to the LLM, replace them with stable tokens, then restore the original URLs after the LLM generates output.

**Failure behavior:** If any link from the source markdown does not appear in the final output, the render operation MUST fail with a clear error message identifying the missing link(s). Silent link loss is unacceptable.

### 2. Layered API Design

The library exposes three levels of abstraction to support different use cases:

**Fragment Level (lowest)**
- Generates only the HTML content
- No document wrapper, no html/head/body tags
- Designed for embedding in existing pages
- Caller is responsible for styling and document structure

**Component Level (middle)**
- Generates HTML content plus associated CSS
- Returns both pieces separately
- CSS should be scoped to avoid polluting global styles
- Designed for injecting styled content into parent pages

**Document Level (highest)**
- Generates a complete, standalone HTML document
- Includes DOCTYPE, html, head, body, embedded styles
- Self-contained: can be saved as an .html file and opened directly
- Designed for static validation, previews, and testing

Higher-level functions should compose from lower-level ones. This enables code reuse and ensures consistency across all API levels.

### 3. LLM Integration

**Provider Requirements:**
- Must use OpenAI-compatible API format
- Should work with Ollama for local development and testing
- Should work with OpenAI, Anthropic (via compatible wrapper), or other providers
- No hard dependency on any specific provider

**Generation Philosophy:**
- The LLM generates the actual visual HTML/CSS code
- The LLM acts as a designer, not just a formatter
- Prompts guide the LLM toward "infographic-style" output
- The system wraps LLM output with link restoration and validation

**What the LLM should produce:**
- Visual hierarchy that emphasizes important content
- Styled containers, cards, or sections
- Color and typography choices that enhance readability
- Layout that feels designed, not default-rendered
- Icons or visual elements where semantically appropriate

**What the LLM should NOT produce:**
- Plain HTML rendering that looks like a markdown preview
- Default browser styling
- Unstyled semantic HTML
- External resource dependencies (fonts, images, etc. must be inline or omitted)

### 4. Testing Philosophy

**Methodology:** Test-Driven Development (TDD)
- Write failing tests before implementing features
- Tests define the contract; implementation fulfills it
- Refactor only when tests pass

**Test Categories:**

*Link Preservation Tests (HIGHEST PRIORITY)*
- These tests must be written and passing before any other functionality
- Test extraction of links from markdown
- Test tokenization (replacing URLs with stable placeholders)
- Test restoration (replacing tokens back to original URLs)
- Test validation (detecting missing links)
- Test edge cases: query params, fragments, special characters, encoded URLs

*Structure Tests*
- Verify each API level produces correct output shape
- Verify document level produces valid HTML5
- Verify fragment level excludes document wrapper
- Verify component level separates HTML and CSS

*Visual Tests*
- Use Playwright for rendering and screenshot comparison
- Verify output actually looks like an infographic, not plain HTML
- Test responsive behavior at different viewport sizes
- Basic accessibility checks

## What "Infographic Style" Means

The term "infographic" here refers to a design aesthetic, not literal data visualization.

**Characteristics of infographic-style output:**
- Content is visually organized into distinct sections or cards
- Important information has visual emphasis (size, color, position)
- Lists become visual elements (icon grids, feature cards, etc.)
- Headings have clear typographic hierarchy
- Whitespace is used intentionally for scannability
- The overall impression is "designed" rather than "rendered"

**The output should feel like:**
- A marketing landing page section
- A product feature overview
- A visual summary or executive brief
- A slide from a presentation deck

**The output should NOT feel like:**
- A GitHub README preview
- A documentation page
- A plain text document with basic formatting
- Default browser rendering of HTML elements

## Technical Constraints

**HTML Output:**
- Must be valid HTML5
- Must pass W3C validation (for document level)
- No script tags (pure HTML/CSS only)
- No external resource dependencies

**CSS Output:**
- Must be scoped to prevent style leakage when embedded
- Should use modern CSS features (flexbox, grid, custom properties)
- Must be inline or embedded (no external stylesheets)
- Should degrade gracefully in older browsers

**Browser Support:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Self-Contained Requirement:**
The generated HTML must work when saved as a standalone file and opened in a browser with no network connection. No external fonts, no CDN resources, no remote images.

## Development Environment

**Local Testing:**
- Use Ollama with qwen3:8b model for development
- This provides fast, free, local iteration
- Production may use different/better models

**Project Organization:**
- Test scripts go in scripts/test/ directory
- Unit tests live alongside the source code they test
- Generated artifacts (screenshots, logs) go in outputs/ directory
- The outputs directory should be gitignored

**Code Style:**
- See [STYLE_GUIDE.md](./STYLE_GUIDE.md) for TypeScript conventions, URL preservation patterns, and testing methodology
