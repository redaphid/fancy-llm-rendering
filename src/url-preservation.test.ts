import { describe, it, expect } from "vitest"

const transformStyle = async (markdown: string, style: string): Promise<string> => {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen3:8b",
      messages: [
        {
          role: "system",
          content: `Rewrite the following text in a ${style} style.
CRITICAL: Preserve ALL markdown links exactly as they appear - do not modify any URLs.
Return only the transformed text.`,
        },
        { role: "user", content: markdown },
      ],
      stream: false,
    }),
  })
  const res = await response.json()
  return res.message.content
}

const extractUrls = (text: string): string[] => {
  const urlRegex = /https?:\/\/[^\s"'<>)\]]+/g
  return [...new Set(text.match(urlRegex) || [])]
}

describe("Markdown link preservation in prose", () => {
  it("cowboy: preserves single markdown link in sentence", async () => {
    const url = "https://docs.example.com/getting-started?ref=welcome#intro"
    const original = `Welcome partner! Check out [the docs](${url}) to begin your adventure.`

    const transformed = await transformStyle(original, "cowboy/western")
    console.log("Transformed:", transformed)

    expect(transformed).toContain(url)
  }, 45000)

  it("pirate: preserves multiple markdown links in paragraph", async () => {
    const urls = [
      "https://treasure.example.com/map?location=island#cave",
      "https://ship.example.com/supplies?type=rum&quantity=10",
    ]
    const original = `Ahoy! First visit [the treasure map](${urls[0]}) to find gold. Then head to [the supply shop](${urls[1]}) for provisions.`

    const transformed = await transformStyle(original, "pirate")
    console.log("Transformed:", transformed)

    for (const url of urls) {
      expect(transformed).toContain(url)
    }
  }, 45000)

  it("shakespeare: preserves complex URL in poetic prose", async () => {
    const url = "https://search.example.com/query?q=to%20be%20or%20not%20to%20be&lang=en#results"
    const original = `To find answers to life's great questions, one must consult [the oracle](${url}) and ponder deeply.`

    const transformed = await transformStyle(original, "Shakespearean")
    console.log("Transformed:", transformed)

    expect(transformed).toContain(url)
  }, 45000)

  it("tech blog: preserves links interspersed in technical explanation", async () => {
    const urls = [
      "https://api.example.com/v2/auth?client_id=abc123&scope=read",
      "https://docs.example.com/api/errors#rate-limiting",
      "https://github.com/example/sdk?tab=readme#installation",
    ]
    const original = `To authenticate, call [the auth endpoint](${urls[0]}) with your credentials. If you hit rate limits, check [the error docs](${urls[1]}). For SDK setup, see [the installation guide](${urls[2]}).`

    const transformed = await transformStyle(original, "casual tech blog")
    console.log("Transformed:", transformed)

    for (const url of urls) {
      expect(transformed).toContain(url)
    }
  }, 45000)

  it("formal: preserves URLs with special chars in business context", async () => {
    const url = "https://reports.example.com/q4?metrics=revenue%2Cgrowth&format=pdf#summary"
    const original = `Please review [the quarterly report](${url}) before tomorrow's meeting.`

    const transformed = await transformStyle(original, "formal corporate email")
    console.log("Transformed:", transformed)

    expect(transformed).toContain(url)
  }, 45000)
})
