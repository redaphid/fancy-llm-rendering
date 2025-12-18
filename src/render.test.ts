import { describe, it, expect, beforeEach } from "vitest"
import { renderFragment, renderDocument, extractUrls, validateUrls, renderDocumentValidated, MissingUrlsError } from "./render"

describe("renderFragment", () => {
  describe("when given simple markdown with a link", () => {
    const markdown = `# Welcome

Visit our [documentation](https://docs.exmaple.com/guide) for help.`
    let result: string

    beforeEach(async () => {
      result = await renderFragment(markdown)
    })

    it("returns HTML content", () => {
      expect(result).toContain("<")
      expect(result).toContain(">")
    })

    it("does not include doctype", () => {
      expect(result.toLowerCase()).not.toContain("<!doctype")
    })

    it("does not include html tag", () => {
      expect(result.toLowerCase()).not.toContain("<html")
    })

    it("does not include head tag", () => {
      expect(result.toLowerCase()).not.toContain("<head")
    })

    it("does not include body tag", () => {
      expect(result.toLowerCase()).not.toContain("<body")
    })

    it("preserves the exact URL", () => {
      expect(result).toContain("https://docs.exmaple.com/guide")
    })
  })
})

describe("extractUrls", () => {
  it("extracts URLs from markdown links", () => {
    const markdown = `Check [docs](https://docs.exmaple.com) and [api](https://api.exmaple.com).`
    const urls = extractUrls(markdown)
    expect(urls).toContain("https://docs.exmaple.com")
    expect(urls).toContain("https://api.exmaple.com")
  })

  it("extracts URLs with query params", () => {
    const markdown = `Visit [search](https://exmaple.com/search?q=test&page=1).`
    const urls = extractUrls(markdown)
    expect(urls).toContain("https://exmaple.com/search?q=test&page=1")
  })

  it("extracts URLs with fragments", () => {
    const markdown = `See [section](https://exmaple.com/docs#installation).`
    const urls = extractUrls(markdown)
    expect(urls).toContain("https://exmaple.com/docs#installation")
  })
})

describe("validateUrls", () => {
  it("returns empty array when all URLs are present", () => {
    const urls = ["https://a.com", "https://b.com"]
    const html = `<a href="https://a.com">A</a> <a href="https://b.com">B</a>`
    const missing = validateUrls(urls, html)
    expect(missing).toEqual([])
  })

  it("returns missing URLs", () => {
    const urls = ["https://a.com", "https://b.com", "https://c.com"]
    const html = `<a href="https://a.com">A</a>`
    const missing = validateUrls(urls, html)
    expect(missing).toContain("https://b.com")
    expect(missing).toContain("https://c.com")
    expect(missing).not.toContain("https://a.com")
  })
})

describe("renderDocument", () => {
  describe("when given markdown with multiple links", () => {
    const markdown = `# Test

Visit [docs](https://docs.exmaple.com/v2) and [api](https://api.exmaple.com/ref).`
    let result: string

    beforeEach(async () => {
      result = await renderDocument(markdown)
    })

    it("includes doctype", () => {
      expect(result.toLowerCase()).toContain("<!doctype")
    })

    it("includes html tag", () => {
      expect(result.toLowerCase()).toContain("<html")
    })

    it("preserves all URLs", () => {
      expect(result).toContain("https://docs.exmaple.com/v2")
      expect(result).toContain("https://api.exmaple.com/ref")
    })
  })
})

describe("renderDocumentValidated", () => {
  describe("when all URLs are preserved", () => {
    const markdown = `# Test

Check our [docs](https://docs.exmaple.com/test).`

    it("returns the HTML document", async () => {
      const result = await renderDocumentValidated(markdown)
      expect(result).toContain("https://docs.exmaple.com/test")
      expect(result.toLowerCase()).toContain("<!doctype")
    })
  })
})

describe("HTML5 validity", () => {
  describe("renderDocument output", () => {
    const markdown = `# Test Page

Some [link](https://exmaple.com/test).`
    let html: string

    beforeEach(async () => {
      html = await renderDocument(markdown)
    })

    it("has valid DOCTYPE declaration", () => {
      expect(html.toLowerCase()).toMatch(/<!doctype\s+html>/i)
    })

    it("has html element with lang attribute", () => {
      expect(html.toLowerCase()).toMatch(/<html[^>]*lang=/i)
    })

    it("has head element", () => {
      expect(html.toLowerCase()).toContain("<head")
      expect(html.toLowerCase()).toContain("</head>")
    })

    it("has body element", () => {
      expect(html.toLowerCase()).toContain("<body")
      expect(html.toLowerCase()).toContain("</body>")
    })

    it("has charset meta tag", () => {
      expect(html.toLowerCase()).toMatch(/<meta[^>]*charset/i)
    })

    it("has title element", () => {
      expect(html.toLowerCase()).toContain("<title")
    })

    it("does not have script tags", () => {
      expect(html.toLowerCase()).not.toContain("<script")
    })

    it("does not have external resources", () => {
      // Should not reference external URLs in src/href for resources
      expect(html).not.toMatch(/src=["']https?:\/\//i)
      // Links are allowed but not external stylesheets
      expect(html).not.toMatch(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']https?:/i)
    })
  })
})

describe("Edge cases for URL preservation", () => {
  describe("mailto links", () => {
    it("preserves mailto: URLs", async () => {
      const markdown = `Contact us at [email](mailto:test@exmaple.com).`
      const result = await renderFragment(markdown)
      expect(result).toContain("mailto:test@exmaple.com")
    })
  })

  describe("relative URLs", () => {
    it("preserves relative paths", async () => {
      const markdown = `See our [local page](/about/team).`
      const result = await renderFragment(markdown)
      expect(result).toContain("/about/team")
    })
  })

  describe("URLs with special characters", () => {
    it("preserves URLs with unicode", async () => {
      const markdown = `Visit [page](https://exmaple.com/path?name=%E4%B8%AD%E6%96%87).`
      const result = await renderFragment(markdown)
      expect(result).toContain("https://exmaple.com/path?name=%E4%B8%AD%E6%96%87")
    })
  })

  describe("anchor-only links", () => {
    it("preserves fragment-only URLs", async () => {
      const markdown = `Jump to [section](#features).`
      const result = await renderFragment(markdown)
      expect(result).toContain("#features")
    })
  })
})
