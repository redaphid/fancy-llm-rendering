const MAX_RETRIES = 3

export const preserveUrls = async (markdown: string, prompt: string): Promise<string> => {
  // Extract all URLs from markdown links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const urlMap: Record<string, string> = {}
  let index = 0

  const tokenized = markdown.replace(linkRegex, (match, linkText, url) => {
    const token = `__URL_TOKEN_${index}__`
    urlMap[token] = url
    index++
    return `[${linkText}](${token})`
  })

  const tokens = Object.keys(urlMap)

  // Send to LLM with retry logic for missing tokens
  const systemPrompt = `${prompt}

CRITICAL - CONTENT PRESERVATION RULES:
1. You MUST include ALL content from the input - do NOT summarize, condense, or omit ANY text
2. Every single sentence from the input must appear in the output
3. ALL markdown links must be preserved exactly as [text](url) format - never remove or modify them
4. Do NOT make editorial decisions about what to include - include EVERYTHING
5. You are a FORMATTER only, not an editor - your job is to style the content, not to curate it`

  let output = ""

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:8b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: tokenized },
        ],
        stream: false,
        options: {
          seed: 42 + attempt, // Vary seed on retry
          temperature: 0,
          num_predict: 8192,
        },
      }),
    })
    const res = await response.json()
    output = res.message.content

    // Check if all tokens are present
    const missingTokens = tokens.filter((token) => !output.includes(token))
    if (missingTokens.length === 0) {
      break // Success - all tokens present
    }
  }

  // Restore all original URLs (replace ALL occurrences)
  for (const [token, url] of Object.entries(urlMap)) {
    // Use split/join for global replacement (works in all JS versions)
    output = output.split(token).join(url)
  }

  // Convert any remaining markdown links to HTML anchors
  // This handles cases where LLM outputs markdown syntax as text
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  return output
}
