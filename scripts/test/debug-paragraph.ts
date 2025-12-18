// Debug just the problematic paragraph

import { preserveUrls } from "../../src/url-preserver"

const markdown = `Each feature has its own dedicated documentation: [processing docs](https://docs.exmaple.com/features/processing?examples=true#batch-mode), [sync docs](https://docs.exmaple.com/features/sync?protocol=ws&fallback=polling), and [analytics docs](https://docs.exmaple.com/features/analytics?metrics=all&export=csv#custom-reports).`

const prompt = `You are an HTML designer. Convert the markdown content into beautiful, infographic-style HTML.

CRITICAL RULES:
1. Output ONLY the HTML fragment - no doctype, html, head, or body tags
2. Create visually engaging, card-based layouts with modern CSS inline styles
3. Preserve all markdown links exactly as [text](url) format`

console.log("=== Input ===")
console.log(markdown)

const result = await preserveUrls(markdown, prompt)

console.log("\n=== Output ===")
console.log(result)

// Check URLs
const expectedUrls = [
  "https://docs.exmaple.com/features/processing?examples=true#batch-mode",
  "https://docs.exmaple.com/features/sync?protocol=ws&fallback=polling",
  "https://docs.exmaple.com/features/analytics?metrics=all&export=csv#custom-reports",
]

console.log("\n=== URL Check ===")
for (const url of expectedUrls) {
  console.log(`${url.slice(0, 50)}...: ${result.includes(url) ? "FOUND ✓" : "MISSING ❌"}`)
}
