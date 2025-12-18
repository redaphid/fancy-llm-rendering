import { preserveUrls } from "./url-preserver"

const stripCodeFences = (content: string): string => {
  // Remove markdown code fences that LLMs often add
  return content
    .replace(/^```(?:html|css|json)?\s*\n?/gim, "")
    .replace(/\n?```\s*$/gim, "")
    .trim()
}

const FRAGMENT_PROMPT = `You are an HTML designer. Convert the markdown content into beautiful, infographic-style HTML.

CRITICAL RULES:
1. Output ONLY the HTML fragment - no doctype, html, head, or body tags
2. Create visually engaging, card-based layouts with modern CSS inline styles
3. Use flexbox/grid for layout
4. Include vibrant colors, shadows, and visual hierarchy
5. Make it look like a marketing landing page, not a plain document
6. All styles must be inline (style attribute)
7. Preserve all markdown links exactly as [text](url) format`

const COMPONENT_PROMPT = `You are an HTML/CSS designer. Convert the markdown content into beautiful, infographic-style HTML with separate CSS.

OUTPUT FORMAT (JSON):
{
  "html": "<div class='infographic'>...</div>",
  "css": ".infographic { ... }"
}

CRITICAL RULES:
1. Return valid JSON with "html" and "css" keys
2. HTML should use class names, not inline styles
3. CSS should be scoped with a unique class prefix like .infographic-*
4. Create visually engaging, card-based layouts
5. Use flexbox/grid, vibrant colors, shadows, visual hierarchy
6. Make it look like a marketing landing page
7. Preserve all markdown links exactly as [text](url) format`

const DOCUMENT_PROMPT = `You are an HTML designer. Convert the markdown content into a complete, beautiful, infographic-style HTML document.

CRITICAL RULES:
1. Output a COMPLETE HTML5 document with <!DOCTYPE html>, <html>, <head>, <body>
2. Include all CSS in a <style> tag in the head
3. Create visually engaging, card-based layouts
4. Use flexbox/grid, vibrant colors, shadows, visual hierarchy
5. Make it look like a marketing landing page, not a plain document
6. The document must be self-contained with NO external resources
7. Preserve all markdown links exactly as [text](url) format
8. Add a nice background color or gradient to body
9. Center the content with max-width for readability`

export const renderFragment = async (markdown: string): Promise<string> => {
  const result = await preserveUrls(markdown, FRAGMENT_PROMPT)
  return stripCodeFences(result)
}

export interface ComponentResult {
  html: string
  css: string
}

export const renderComponent = async (markdown: string): Promise<ComponentResult> => {
  const response = await preserveUrls(markdown, COMPONENT_PROMPT)

  // Try to extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*"html"[\s\S]*"css"[\s\S]*\}/)
  if (!jsonMatch) {
    // Fallback: wrap response as html with empty css
    return { html: response, css: "" }
  }

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return { html: response, css: "" }
  }
}

export const renderDocument = async (markdown: string): Promise<string> => {
  const result = await preserveUrls(markdown, DOCUMENT_PROMPT)
  return stripCodeFences(result)
}

// Extract all URLs from markdown links
export const extractUrls = (markdown: string): string[] => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const urls: string[] = []
  let match

  while ((match = linkRegex.exec(markdown)) !== null) {
    urls.push(match[2])
  }

  return urls
}

// Validate that all URLs are present in the output
export const validateUrls = (urls: string[], html: string): string[] => {
  return urls.filter((url) => !html.includes(url))
}

// Error class for missing URLs
export class MissingUrlsError extends Error {
  constructor(public missingUrls: string[]) {
    super(`Missing URLs in output: ${missingUrls.join(", ")}`)
    this.name = "MissingUrlsError"
  }
}

// Validated render functions - throw if URLs are missing
export const renderDocumentValidated = async (markdown: string): Promise<string> => {
  const urls = extractUrls(markdown)
  const result = await renderDocument(markdown)
  const missing = validateUrls(urls, result)

  if (missing.length > 0) {
    throw new MissingUrlsError(missing)
  }

  return result
}

export const renderFragmentValidated = async (markdown: string): Promise<string> => {
  const urls = extractUrls(markdown)
  const result = await renderFragment(markdown)
  const missing = validateUrls(urls, result)

  if (missing.length > 0) {
    throw new MissingUrlsError(missing)
  }

  return result
}
