// Test renderDocument directly

import { renderDocument, extractUrls, validateUrls } from "../../src/render"

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

console.log("=== Calling renderDocument... ===")
const result = await renderDocument(markdown)

console.log("=== Result length:", result.length, "chars ===")

const expectedUrls = extractUrls(markdown)
console.log("=== Expected URLs:", expectedUrls.length, "===")

const missing = validateUrls(expectedUrls, result)
console.log("=== Missing URLs:", missing.length, "===")

if (missing.length > 0) {
  console.log("\nMissing:")
  for (const url of missing) {
    console.log(`  - ${url}`)
  }

  // Search for tokens in the output (before restoration)
  console.log("\n=== Checking if 'dedicated documentation' section was dropped ===")
  if (result.toLowerCase().includes("dedicated documentation")) {
    console.log("Section exists in output")
  } else if (result.toLowerCase().includes("processing docs")) {
    console.log("'processing docs' text found")
  } else if (result.toLowerCase().includes("processing")) {
    console.log("'processing' found but not as link text")
  } else {
    console.log("The entire sentence appears to be dropped by the LLM")
  }
} else {
  console.log("\n✓ All URLs preserved!")
}
