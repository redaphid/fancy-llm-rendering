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

  // Send to LLM
  const systemPrompt = `${prompt}

IMPORTANT: You MUST preserve all markdown links exactly as they appear. Keep the [text](url) format intact. Never remove or modify links.`

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
    }),
  })
  const res = await response.json()
  let output = res.message.content

  // Restore all original URLs
  for (const [token, url] of Object.entries(urlMap)) {
    output = output.replace(token, url)
  }

  return output
}
