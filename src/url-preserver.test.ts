import { describe, it, expect, beforeEach } from "vitest"
import { preserveUrls } from "./url-preserver"

describe("preserveUrls", () => {
  describe("when LLM is asked to fix errors in text with typo-URL", () => {
    const markdown = `Visit [our docs](https://docuemntation.exmaple.com/guied) for help.`
    const url = "https://docuemntation.exmaple.com/guied"
    let result: string

    beforeEach(async () => {
      result = await preserveUrls(markdown, "Fix any errors and improve this text")
    })

    it("preserves the exact URL despite typos", () => {
      expect(result).toContain(url)
    })
  })

  describe("when text has multiple markdown links", () => {
    const markdown = `Visit [docs](https://docuemntation.exmaple.com/guied) and [api](https://api.exmaple.com/old?v=1) for help.`
    const urls = ["https://docuemntation.exmaple.com/guied", "https://api.exmaple.com/old?v=1"]
    let result: string

    beforeEach(async () => {
      result = await preserveUrls(markdown, "Fix any errors and improve this text")
    })

    it("preserves all URLs", () => {
      for (const url of urls) {
        expect(result).toContain(url)
      }
    })
  })

  describe("when URL has complex query params and fragment", () => {
    const markdown = `Check the [search results](https://exmaple.com/search?q=hello+world&sort=date&filter=all#section-2) for details.`
    const url = "https://exmaple.com/search?q=hello+world&sort=date&filter=all#section-2"
    let result: string

    beforeEach(async () => {
      result = await preserveUrls(markdown, "Rewrite this as a cowboy speaking")
    })

    it("preserves the full URL with query params and fragment", () => {
      expect(result).toContain(url)
    })
  })

  describe("when intricate prose has multiple interwoven links", () => {
    const markdown = `The [documentation](https://docs.exmaple.io/v2/getting-started?ref=nav) explains how to configure the [API client](https://api.exmaple.io/sdk/js#installation) properly. For advanced users, check the [configuration guide](https://docs.exmaple.io/v2/config?format=yaml&advanced=true) and the [troubleshooting page](https://support.exmaple.io/kb/errors?code=500).`
    const urls = [
      "https://docs.exmaple.io/v2/getting-started?ref=nav",
      "https://api.exmaple.io/sdk/js#installation",
      "https://docs.exmaple.io/v2/config?format=yaml&advanced=true",
      "https://support.exmaple.io/kb/errors?code=500",
    ]
    let result: string

    beforeEach(async () => {
      result = await preserveUrls(markdown, "Rewrite this as a pirate giving instructions")
    })

    it("preserves all URLs in the transformed text", () => {
      for (const url of urls) {
        expect(result).toContain(url)
      }
    })
  })

  describe("when URL has encoded characters", () => {
    const markdown = `Read the [article](https://exmaple.com/post?title=Hello%20World%21&author=%40johndoe) for more.`
    const url = "https://exmaple.com/post?title=Hello%20World%21&author=%40johndoe"
    let result: string

    beforeEach(async () => {
      result = await preserveUrls(markdown, "Make this sound more formal and professional")
    })

    it("preserves URL-encoded characters", () => {
      expect(result).toContain(url)
    })
  })
})
