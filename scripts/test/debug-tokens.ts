// Debug script to see what's happening with the token preservation

const markdown = `
Each feature has its own dedicated documentation: [processing docs](https://docs.exmaple.com/features/processing?examples=true#batch-mode), [sync docs](https://docs.exmaple.com/features/sync?protocol=ws&fallback=polling), and [analytics docs](https://docs.exmaple.com/features/analytics?metrics=all&export=csv#custom-reports).
`

const prompt = `You are an HTML designer. Convert the markdown content into beautiful, infographic-style HTML.

CRITICAL RULES:
1. Output ONLY the HTML fragment - no doctype, html, head, or body tags
2. Create visually engaging, card-based layouts with modern CSS inline styles
3. Use flexbox/grid for layout
4. Include vibrant colors, shadows, and visual hierarchy
5. Make it look like a marketing landing page, not a plain document
6. All styles must be inline (style attribute)
7. Preserve all markdown links exactly as [text](url) format

IMPORTANT: You MUST preserve all markdown links exactly as they appear. Keep the [text](url) format intact. Never remove or modify links.`

// Tokenize
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
const urlMap: Record<string, string> = {}
let index = 0

const tokenized = markdown.replace(linkRegex, (match, linkText, url) => {
  const token = `__URL_TOKEN_${index}__`
  urlMap[token] = url
  index++
  return `[${linkText}](${token})`
})

console.log("=== Original Markdown ===")
console.log(markdown)
console.log("\n=== Tokenized ===")
console.log(tokenized)
console.log("\n=== URL Map ===")
console.log(urlMap)

// Call LLM
const response = await fetch("http://localhost:11434/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "qwen3:8b",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: tokenized },
    ],
    stream: false,
    options: {
      seed: 42,
      temperature: 0,
    },
  }),
})

const res = await response.json()
let output = res.message.content

console.log("\n=== Raw LLM Output ===")
console.log(output)

// Check which tokens are in the output
console.log("\n=== Token Presence Check ===")
for (const token of Object.keys(urlMap)) {
  const present = output.includes(token)
  console.log(`${token}: ${present ? "FOUND" : "MISSING"}`)
}

// Restore URLs
for (const [token, url] of Object.entries(urlMap)) {
  output = output.split(token).join(url)
}

console.log("\n=== After URL Restoration ===")
console.log(output)

// Check which URLs are in the final output
console.log("\n=== URL Presence Check ===")
for (const url of Object.values(urlMap)) {
  const present = output.includes(url)
  console.log(`${url}: ${present ? "FOUND" : "MISSING"}`)
}
