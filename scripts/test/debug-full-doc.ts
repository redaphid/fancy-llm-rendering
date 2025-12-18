// Debug script for the full 20-link document

const markdown = `
# Complete Platform Guide

Welcome to our comprehensive guide! Start with the [quick start tutorial](https://docs.exmaple.com/quickstart?v=2024&lang=en) to get up and running in minutes. For a deeper understanding, read our [architecture overview](https://docs.exmaple.com/architecture?diagram=true&interactive=1#components) which explains how all the pieces fit together.

## Core Features

Our platform offers three main capabilities. First, the [data processing engine](https://engine.exmaple.com/docs/processing?mode=batch&parallel=true) handles large-scale transformations. Second, the [real-time sync](https://sync.exmaple.com/api/v2?websocket=true&compression=gzip#connection) keeps everything up to date. Third, the [analytics dashboard](https://analytics.exmaple.com/dashboard?view=executive&period=30d) provides actionable insights.

Each feature has its own dedicated documentation: [processing docs](https://docs.exmaple.com/features/processing?examples=true#batch-mode), [sync docs](https://docs.exmaple.com/features/sync?protocol=ws&fallback=polling), and [analytics docs](https://docs.exmaple.com/features/analytics?metrics=all&export=csv#custom-reports).

## Integration Options

We support multiple integration methods. Use our [REST API](https://api.exmaple.com/v3/docs?format=openapi&examples=curl) for traditional backends, our [GraphQL endpoint](https://graphql.exmaple.com/explorer?schema=public&introspection=true) for flexible queries, or our [webhooks system](https://webhooks.exmaple.com/configure?events=all&retry=exponential#payload-format) for event-driven architectures.

For mobile developers, check out our [iOS SDK](https://github.com/exmaple/ios-sdk?branch=main&swift=5.9#installation) and [Android SDK](https://github.com/exmaple/android-sdk?kotlin=1.9&minSdk=24#gradle-setup). Web developers can use our [JavaScript library](https://npm.exmaple.com/package/exmaple-js?version=latest&types=included).

## Support Resources

If you need help, start with our [FAQ](https://help.exmaple.com/faq?category=common&sort=popular#billing). For technical issues, check the [troubleshooting guide](https://support.exmaple.com/troubleshoot?os=all&browser=chrome#network-issues). You can also [contact support](https://support.exmaple.com/ticket/new?priority=normal&product=platform) or join our [community forum](https://community.exmaple.com/forums?category=help&sort=recent#pinned).

Finally, stay updated with our [changelog](https://releases.exmaple.com/changelog?year=2024&format=rss) and follow us on [Twitter](https://twitter.com/exmaple_dev?ref=docs&follow=true).
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

console.log("=== Tokenized Content ===")
console.log(tokenized)
console.log("\n=== URL Map (20 entries) ===")
for (const [token, url] of Object.entries(urlMap)) {
  console.log(`${token} -> ${url}`)
}

// Call LLM
console.log("\n=== Calling LLM... ===")
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

console.log("\n=== Token Presence in Raw LLM Output ===")
for (const token of Object.keys(urlMap)) {
  const present = output.includes(token)
  if (!present) {
    console.log(`${token}: MISSING ❌`)
  }
}

// Count found vs missing
const missingTokens = Object.keys(urlMap).filter(t => !output.includes(t))
const foundTokens = Object.keys(urlMap).filter(t => output.includes(t))
console.log(`\nFound: ${foundTokens.length}/20, Missing: ${missingTokens.length}/20`)

if (missingTokens.length > 0) {
  console.log("\n=== Missing Tokens ===")
  for (const token of missingTokens) {
    console.log(`${token} -> ${urlMap[token]}`)
  }

  // Show context around where these tokens should appear
  console.log("\n=== Tokenized content around missing tokens ===")
  for (const token of missingTokens) {
    const idx = tokenized.indexOf(token)
    if (idx !== -1) {
      const start = Math.max(0, idx - 50)
      const end = Math.min(tokenized.length, idx + token.length + 50)
      console.log(`...${tokenized.slice(start, end)}...`)
    }
  }
}

// Restore and check URLs
for (const [token, url] of Object.entries(urlMap)) {
  output = output.split(token).join(url)
}

console.log("\n=== URL Presence in Final Output ===")
const missingUrls: string[] = []
for (const [token, url] of Object.entries(urlMap)) {
  const present = output.includes(url)
  if (!present) {
    missingUrls.push(url)
    console.log(`MISSING: ${url}`)
  }
}

console.log(`\nTotal missing URLs: ${missingUrls.length}`)

// Show the end of the LLM output
console.log("\n=== Last 500 chars of Raw LLM Output ===")
const rawOutput = res.message.content
console.log(rawOutput.slice(-500))
