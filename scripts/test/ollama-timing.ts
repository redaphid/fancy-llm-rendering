const start = Date.now()

const response = await fetch("http://localhost:11434/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "qwen3:8b",
    messages: [
      { role: "system", content: "Transform markdown to HTML. Preserve all links exactly." },
      { role: "user", content: "[Click](https://example.com/api?v=1#test)" },
    ],
    stream: false,
  }),
})

const res = await response.json()
console.log(`Time: ${Date.now() - start}ms`)
console.log(`Response:`, res.message.content.slice(0, 200))
