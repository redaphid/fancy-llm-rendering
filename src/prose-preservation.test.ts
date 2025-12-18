import { describe, it, expect, beforeAll } from "vitest"
import { renderFragment, renderDocument, extractUrls, validateUrls } from "./render"

describe("URL preservation in prose paragraphs", () => {
  describe("technical documentation with interwoven links", () => {
    const markdown = `
# Getting Started with Our API

Welcome to our platform! Before diving in, make sure you've read the [API overview](https://api.exmaple.com/docs/overview?version=2.1) which covers the basics of authentication and rate limiting. If you're migrating from v1, check out our [migration guide](https://api.exmaple.com/docs/migration?from=v1&to=v2#breaking-changes) for a list of breaking changes.

## Authentication

All API requests require authentication via OAuth 2.0. You can register your application at the [developer portal](https://developers.exmaple.com/apps/register?type=oauth2) and obtain your client credentials. For testing purposes, we recommend using our [sandbox environment](https://sandbox.exmaple.com/auth?mode=test&redirect_uri=localhost) which provides mock data and doesn't affect production.

The authentication flow is documented in detail in our [OAuth guide](https://api.exmaple.com/docs/oauth?flow=authorization_code#step-by-step), and you can find code examples in our [SDK repository](https://github.com/exmaple/api-sdk/tree/main/examples#authentication).

## Rate Limiting

We enforce rate limits to ensure fair usage. See our [rate limiting policy](https://api.exmaple.com/docs/rate-limits?tier=free#quotas) for specific numbers. Enterprise customers can request higher limits through their [account manager](https://enterprise.exmaple.com/contact?subject=rate-limits&priority=high).

If you encounter rate limit errors, our [troubleshooting guide](https://support.exmaple.com/kb/errors/429?solution=backoff#exponential) explains the best practices for handling them, including exponential backoff strategies.
`
    const expectedUrls = [
      "https://api.exmaple.com/docs/overview?version=2.1",
      "https://api.exmaple.com/docs/migration?from=v1&to=v2#breaking-changes",
      "https://developers.exmaple.com/apps/register?type=oauth2",
      "https://sandbox.exmaple.com/auth?mode=test&redirect_uri=localhost",
      "https://api.exmaple.com/docs/oauth?flow=authorization_code#step-by-step",
      "https://github.com/exmaple/api-sdk/tree/main/examples#authentication",
      "https://api.exmaple.com/docs/rate-limits?tier=free#quotas",
      "https://enterprise.exmaple.com/contact?subject=rate-limits&priority=high",
      "https://support.exmaple.com/kb/errors/429?solution=backoff#exponential",
    ]

    it("extracts all URLs correctly", () => {
      const urls = extractUrls(markdown)
      for (const expectedUrl of expectedUrls) {
        expect(urls).toContain(expectedUrl)
      }
      expect(urls.length).toBe(expectedUrls.length)
    })

    describe("renderFragment", () => {
      let result: string

      beforeAll(async () => {
        result = await renderFragment(markdown)
      })

      it("preserves all URLs in the output", () => {
        const missing = validateUrls(expectedUrls, result)
        expect(missing, `Missing URLs: ${missing.join(", ")}`).toEqual([])
      })
    })
  })

  describe("blog post style content", () => {
    const markdown = `
# Why We Rebuilt Our Infrastructure

Last month, we completed a major infrastructure overhaul. It all started when we noticed performance issues documented in our [incident report](https://status.exmaple.com/incidents/2024-01-15?details=full#root-cause). After extensive analysis (see our [engineering blog post](https://blog.exmaple.com/posts/infrastructure-deep-dive?utm_source=docs&utm_medium=link#methodology)), we decided to migrate.

The journey wasn't easy. We evaluated several options including [AWS Lambda](https://aws.amazon.com/lambda/?nc1=h_ls), [Google Cloud Run](https://cloud.google.com/run?hl=en#features), and [Cloudflare Workers](https://workers.cloudflare.com/docs?ref=exmaple#getting-started). Each had trade-offs discussed in our [comparison document](https://docs.exmaple.com/internal/cloud-comparison?confidential=false&version=final).

Our team lead wrote about the decision process on [her personal blog](https://janesmith.dev/posts/choosing-cloud-providers?year=2024#conclusion), and the CTO shared insights in a [podcast interview](https://techpodcast.exmaple.com/episodes/42?guest=john-doe&topic=infrastructure#timestamp-23m).

For those interested in the technical details, our [architecture diagram](https://diagrams.exmaple.com/infra/v2?format=svg&interactive=true) shows the new system, and the [runbook](https://runbooks.exmaple.com/deployments/production?env=prod&region=us-east-1#rollback) covers our deployment process.
`
    const expectedUrls = [
      "https://status.exmaple.com/incidents/2024-01-15?details=full#root-cause",
      "https://blog.exmaple.com/posts/infrastructure-deep-dive?utm_source=docs&utm_medium=link#methodology",
      "https://aws.amazon.com/lambda/?nc1=h_ls",
      "https://cloud.google.com/run?hl=en#features",
      "https://workers.cloudflare.com/docs?ref=exmaple#getting-started",
      "https://docs.exmaple.com/internal/cloud-comparison?confidential=false&version=final",
      "https://janesmith.dev/posts/choosing-cloud-providers?year=2024#conclusion",
      "https://techpodcast.exmaple.com/episodes/42?guest=john-doe&topic=infrastructure#timestamp-23m",
      "https://diagrams.exmaple.com/infra/v2?format=svg&interactive=true",
      "https://runbooks.exmaple.com/deployments/production?env=prod&region=us-east-1#rollback",
    ]

    it("extracts all URLs correctly", () => {
      const urls = extractUrls(markdown)
      expect(urls.length).toBe(expectedUrls.length)
    })

    describe("renderDocument", () => {
      let result: string

      beforeAll(async () => {
        result = await renderDocument(markdown)
      })

      it("preserves all URLs in the output", () => {
        const missing = validateUrls(expectedUrls, result)
        expect(missing, `Missing URLs: ${missing.join(", ")}`).toEqual([])
      })

      it("produces valid HTML document", () => {
        expect(result.toLowerCase()).toContain("<!doctype")
        expect(result.toLowerCase()).toContain("<html")
      })
    })
  })

  describe("marketing copy with CTAs", () => {
    const markdown = `
# Transform Your Workflow Today

Join **50,000+ professionals** who've already made the switch. Our platform has been featured in [TechCrunch](https://techcrunch.com/reviews/exmaple-platform?year=2024&rating=5), [The Verge](https://theverge.com/software/exmaple-review?author=dieter#verdict), and [Wired](https://wired.com/story/best-productivity-tools?list=2024#exmaple).

## What Our Users Say

> "This tool saved us 20 hours per week" — [Sarah Chen, VP Engineering at Startup Co](https://linkedin.com/in/sarah-chen-vp?ref=testimonial)

> "Finally, a solution that just works" — [Mike Johnson, CTO at Enterprise Inc](https://twitter.com/mikej_cto/status/123456789?context=review)

## Get Started Now

Ready to transform your workflow? [Start your free trial](https://app.exmaple.com/signup?plan=trial&duration=14days&source=landing) — no credit card required. Have questions? [Talk to our sales team](https://sales.exmaple.com/demo?product=enterprise&utm_campaign=landing_page#calendar) or check our [FAQ](https://help.exmaple.com/faq?category=getting-started#pricing).

Already have an account? [Sign in here](https://app.exmaple.com/login?redirect=/dashboard&remember=true).
`
    const expectedUrls = [
      "https://techcrunch.com/reviews/exmaple-platform?year=2024&rating=5",
      "https://theverge.com/software/exmaple-review?author=dieter#verdict",
      "https://wired.com/story/best-productivity-tools?list=2024#exmaple",
      "https://linkedin.com/in/sarah-chen-vp?ref=testimonial",
      "https://twitter.com/mikej_cto/status/123456789?context=review",
      "https://app.exmaple.com/signup?plan=trial&duration=14days&source=landing",
      "https://sales.exmaple.com/demo?product=enterprise&utm_campaign=landing_page#calendar",
      "https://help.exmaple.com/faq?category=getting-started#pricing",
      "https://app.exmaple.com/login?redirect=/dashboard&remember=true",
    ]

    describe("renderFragment", () => {
      let result: string

      beforeAll(async () => {
        result = await renderFragment(markdown)
      })

      it("preserves all URLs including complex query params", () => {
        const missing = validateUrls(expectedUrls, result)
        expect(missing, `Missing URLs: ${missing.join(", ")}`).toEqual([])
      })
    })
  })

  describe("mixed content with various URL schemes", () => {
    const markdown = `
# Contact & Resources

## Get in Touch

- **Email**: [support@exmaple.com](mailto:support@exmaple.com?subject=Help%20Request&body=Hi%20Team)
- **Phone**: [Call us](tel:+1-555-123-4567)
- **Office**: [View on map](https://maps.google.com/maps?q=123+Main+St&ll=37.7749,-122.4194&z=15)

## Quick Links

Navigate to different sections: [Features](#features) | [Pricing](#pricing) | [About Us](#about)

Or visit our other properties:
- [Main Website](https://www.exmaple.com/?ref=docs)
- [Status Page](https://status.exmaple.com/current?format=json&alerts=true)
- [API Documentation](/docs/api/v2)
- [GitHub Repo](https://github.com/exmaple/main-repo?tab=readme-ov-file#contributing)

## Legal

Read our [Terms of Service](https://legal.exmaple.com/tos?version=2024-01&jurisdiction=us#arbitration) and [Privacy Policy](https://legal.exmaple.com/privacy?gdpr=true&ccpa=true#data-collection).
`
    const expectedUrls = [
      "mailto:support@exmaple.com?subject=Help%20Request&body=Hi%20Team",
      "tel:+1-555-123-4567",
      "https://maps.google.com/maps?q=123+Main+St&ll=37.7749,-122.4194&z=15",
      "#features",
      "#pricing",
      "#about",
      "https://www.exmaple.com/?ref=docs",
      "https://status.exmaple.com/current?format=json&alerts=true",
      "/docs/api/v2",
      "https://github.com/exmaple/main-repo?tab=readme-ov-file#contributing",
      "https://legal.exmaple.com/tos?version=2024-01&jurisdiction=us#arbitration",
      "https://legal.exmaple.com/privacy?gdpr=true&ccpa=true#data-collection",
    ]

    it("extracts all URL schemes correctly", () => {
      const urls = extractUrls(markdown)
      expect(urls).toContain("mailto:support@exmaple.com?subject=Help%20Request&body=Hi%20Team")
      expect(urls).toContain("tel:+1-555-123-4567")
      expect(urls).toContain("#features")
      expect(urls).toContain("/docs/api/v2")
    })

    describe("renderFragment", () => {
      let result: string

      beforeAll(async () => {
        result = await renderFragment(markdown)
      })

      it("preserves mailto URLs with encoded params", () => {
        expect(result).toContain("mailto:support@exmaple.com?subject=Help%20Request&body=Hi%20Team")
      })

      it("preserves tel URLs", () => {
        expect(result).toContain("tel:+1-555-123-4567")
      })

      it("preserves fragment-only URLs", () => {
        expect(result).toContain("#features")
        expect(result).toContain("#pricing")
        expect(result).toContain("#about")
      })

      it("preserves relative URLs", () => {
        expect(result).toContain("/docs/api/v2")
      })

      it("preserves all URLs", () => {
        const missing = validateUrls(expectedUrls, result)
        expect(missing, `Missing URLs: ${missing.join(", ")}`).toEqual([])
      })
    })
  })
})

describe("stress test with 20 interwoven links", () => {
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
  const expectedUrls = [
    "https://docs.exmaple.com/quickstart?v=2024&lang=en",
    "https://docs.exmaple.com/architecture?diagram=true&interactive=1#components",
    "https://engine.exmaple.com/docs/processing?mode=batch&parallel=true",
    "https://sync.exmaple.com/api/v2?websocket=true&compression=gzip#connection",
    "https://analytics.exmaple.com/dashboard?view=executive&period=30d",
    "https://docs.exmaple.com/features/processing?examples=true#batch-mode",
    "https://docs.exmaple.com/features/sync?protocol=ws&fallback=polling",
    "https://docs.exmaple.com/features/analytics?metrics=all&export=csv#custom-reports",
    "https://api.exmaple.com/v3/docs?format=openapi&examples=curl",
    "https://graphql.exmaple.com/explorer?schema=public&introspection=true",
    "https://webhooks.exmaple.com/configure?events=all&retry=exponential#payload-format",
    "https://github.com/exmaple/ios-sdk?branch=main&swift=5.9#installation",
    "https://github.com/exmaple/android-sdk?kotlin=1.9&minSdk=24#gradle-setup",
    "https://npm.exmaple.com/package/exmaple-js?version=latest&types=included",
    "https://help.exmaple.com/faq?category=common&sort=popular#billing",
    "https://support.exmaple.com/troubleshoot?os=all&browser=chrome#network-issues",
    "https://support.exmaple.com/ticket/new?priority=normal&product=platform",
    "https://community.exmaple.com/forums?category=help&sort=recent#pinned",
    "https://releases.exmaple.com/changelog?year=2024&format=rss",
    "https://twitter.com/exmaple_dev?ref=docs&follow=true",
  ]

  it("has exactly 20 URLs", () => {
    expect(expectedUrls.length).toBe(20)
  })

  it("extracts all 20 URLs correctly", () => {
    const urls = extractUrls(markdown)
    expect(urls.length).toBe(20)
    for (const url of expectedUrls) {
      expect(urls, `Should contain: ${url}`).toContain(url)
    }
  })

  describe("renderFragment with 20 links", () => {
    let result: string

    beforeAll(async () => {
      result = await renderFragment(markdown)
    })

    it("preserves all 20 URLs in output", () => {
      const missing = validateUrls(expectedUrls, result)
      expect(missing.length, `Missing ${missing.length} URLs: ${missing.join(", ")}`).toBe(0)
    })
  })

  describe("renderDocument with 20 links", () => {
    let result: string

    beforeAll(async () => {
      result = await renderDocument(markdown)
    })

    it("preserves all 20 URLs in output", () => {
      const missing = validateUrls(expectedUrls, result)
      expect(missing.length, `Missing ${missing.length} URLs: ${missing.join(", ")}`).toBe(0)
    })

    it("is valid HTML document", () => {
      expect(result.toLowerCase()).toContain("<!doctype")
    })
  })
})
