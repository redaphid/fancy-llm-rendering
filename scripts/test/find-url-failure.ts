// Script to find scenarios where LLM corrupts URLs

const testCases = [
  {
    name: "fix errors prompt",
    prompt: "Fix any errors and improve this text:",
    text: `Visit [our docs](https://docuemntation.exmaple.com/guied) for help.`,
    url: "https://docuemntation.exmaple.com/guied",
  },
  {
    name: "update links prompt",
    prompt: "Update and modernize this text:",
    text: `Check [the old API](https://api.example.com/v1/deprecated?old=true) for legacy support.`,
    url: "https://api.example.com/v1/deprecated?old=true",
  },
  {
    name: "simplify prompt",
    prompt: "Simplify and shorten this text as much as possible:",
    text: `Go to [this very long link](https://example.com/very/unnecessarily/long/path/to/resource?param1=value1&param2=value2&tracking=abc123)`,
    url: "https://example.com/very/unnecessarily/long/path/to/resource?param1=value1&param2=value2&tracking=abc123",
  },
  {
    name: "correct mistakes prompt",
    prompt: "Correct any mistakes in this text:",
    text: `See [the documnetation](https://docs.exmaple.com/giude?vresion=2) for details.`,
    url: "https://docs.exmaple.com/giude?vresion=2",
  },
  {
    name: "make it real prompt",
    prompt: "Make this text more realistic and practical:",
    text: `Configure using [example endpoint](https://your-domain.example.com/api?key=YOUR_API_KEY_HERE)`,
    url: "https://your-domain.example.com/api?key=YOUR_API_KEY_HERE",
  },
]

const testUrl = async (testCase: typeof testCases[0]) => {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "qwen3:8b",
      messages: [
        { role: "system", content: testCase.prompt },
        { role: "user", content: testCase.text },
      ],
      stream: false,
    }),
  })
  const res = await response.json()
  const output = res.message.content

  const preserved = output.includes(testCase.url)
  return { ...testCase, output, preserved }
}

console.log("Testing URL preservation failure cases...\n")

for (const testCase of testCases) {
  console.log(`Testing: ${testCase.name}`)
  const result = await testUrl(testCase)

  if (!result.preserved) {
    console.log(`❌ FAILURE FOUND!`)
    console.log(`   Prompt: ${result.prompt}`)
    console.log(`   Input URL: ${result.url}`)
    console.log(`   Output: ${result.output.slice(0, 300)}`)
  } else {
    console.log(`✓ URL preserved`)
    console.log(`   Output: ${result.output.slice(0, 150)}...`)
  }
  console.log()
}
