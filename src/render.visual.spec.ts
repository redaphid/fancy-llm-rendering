import { test, expect } from "@playwright/test"
import { renderDocument } from "./render"
import * as fs from "fs"
import * as path from "path"

const OUTPUT_DIR = path.join(process.cwd(), "outputs")
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, "screenshots")
const HTML_DIR = path.join(OUTPUT_DIR, "html")

// Ensure directories exist
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
fs.mkdirSync(HTML_DIR, { recursive: true })

// Test scenarios - diverse markdown content
const testCases = [
  {
    name: "simple-welcome",
    markdown: `# Welcome to Our Platform

We're excited to have you here! Check out our [documentation](https://docs.exmaple.com/guide) to get started.

## Features

- Fast and reliable
- Easy to use
- Great support`,
  },
  {
    name: "product-features",
    markdown: `# Amazing Product Features

## Speed
Our platform is **lightning fast**. Visit our [benchmark results](https://perf.exmaple.com/results?v=2) to see for yourself.

## Security
Enterprise-grade security with [SOC2 compliance](https://security.exmaple.com/soc2#certification).

## Support
24/7 support via our [help center](https://help.exmaple.com/contact).`,
  },
  {
    name: "pricing-table",
    markdown: `# Pricing Plans

Choose the plan that works for you.

## Free
- 5 projects
- 1GB storage
- [Sign up free](https://app.exmaple.com/signup?plan=free)

## Pro - $29/mo
- Unlimited projects
- 100GB storage
- Priority support
- [Start trial](https://app.exmaple.com/signup?plan=pro&trial=14days)

## Enterprise
- Custom solutions
- Dedicated support
- [Contact sales](https://sales.exmaple.com/enterprise?ref=pricing)`,
  },
  {
    name: "tech-stack",
    markdown: `# Our Technology Stack

## Frontend
Built with [React](https://reactjs.org) and [TypeScript](https://typescriptlang.org).

## Backend
Powered by [Node.js](https://nodejs.org) with [PostgreSQL](https://postgresql.org/docs/current#intro).

## Infrastructure
Deployed on [AWS](https://aws.amazon.com/solutions) with [Kubernetes](https://kubernetes.io/docs/home/?k8s=true).`,
  },
  {
    name: "team-page",
    markdown: `# Meet Our Team

## Leadership

### Jane Smith - CEO
20 years of experience in tech. [LinkedIn](https://linkedin.com/in/janesmith-ceo)

### John Doe - CTO
Former Google engineer. [GitHub](https://github.com/johndoe-cto)

## Join Us
We're hiring! Check our [careers page](https://jobs.exmaple.com/openings?dept=all#remote).`,
  },
  {
    name: "changelog",
    markdown: `# What's New

## Version 2.0 - December 2024

### New Features
- Dark mode support
- Real-time collaboration
- [Migration guide](https://docs.exmaple.com/v2/migration?from=v1)

### Bug Fixes
- Fixed login issues
- Improved performance
- See [full changelog](https://github.com/exmaple/app/releases/v2.0.0)`,
  },
  {
    name: "tutorial-steps",
    markdown: `# Getting Started Tutorial

## Step 1: Install
Run the installer from our [downloads page](https://download.exmaple.com/installer?os=auto).

## Step 2: Configure
Follow the [configuration guide](https://docs.exmaple.com/setup/config#basics).

## Step 3: Deploy
Push to production using our [deployment docs](https://docs.exmaple.com/deploy?env=prod&region=us-east).

## Need Help?
Visit our [community forum](https://community.exmaple.com/support).`,
  },
  {
    name: "faq-section",
    markdown: `# Frequently Asked Questions

## How do I reset my password?
Visit [password reset](https://auth.exmaple.com/reset?flow=email) and follow the instructions.

## What payment methods do you accept?
We accept all major credit cards. See [billing FAQ](https://billing.exmaple.com/faq#methods).

## Can I cancel anytime?
Yes! No contracts. [Cancellation policy](https://legal.exmaple.com/terms#cancellation).

## More questions?
[Contact support](https://support.exmaple.com/ticket/new)`,
  },
  {
    name: "api-overview",
    markdown: `# API Reference

## Authentication
All requests require an API key. Get yours at [developer portal](https://api.exmaple.com/keys).

## Endpoints

### GET /users
Returns user list. [Full docs](https://api.exmaple.com/docs/users#list)

### POST /orders
Create an order. [Full docs](https://api.exmaple.com/docs/orders#create)

### DELETE /items/:id
Remove an item. [Full docs](https://api.exmaple.com/docs/items#delete)`,
  },
  {
    name: "newsletter-signup",
    markdown: `# Stay Updated

Join **50,000+ developers** who get our weekly newsletter.

## What You'll Get
- Industry insights
- Tutorial roundups
- Exclusive discounts

[Subscribe now](https://newsletter.exmaple.com/signup?source=landing)

## Past Issues
Browse our [archive](https://newsletter.exmaple.com/archive?year=2024).`,
  },
]

// Generate more test cases programmatically
const additionalCases = Array.from({ length: 10 }, (_, i) => ({
  name: `generated-${i + 1}`,
  markdown: `# Generated Test ${i + 1}

This is test case number ${i + 1} with [link ${i + 1}](https://test${i + 1}.exmaple.com/path?num=${i + 1}#section).

## Section A
Content for section A with [another link](https://a.exmaple.com/test${i + 1}).

## Section B
Content for section B with [yet another link](https://b.exmaple.com/test${i + 1}?param=value).`,
}))

const allTestCases = [...testCases, ...additionalCases]

test.describe("Visual Infographic Tests", () => {
  for (const testCase of allTestCases) {
    test(`renders ${testCase.name} as infographic`, async ({ page }) => {
      // Generate HTML document
      const html = await renderDocument(testCase.markdown)

      // Save HTML for inspection
      const htmlPath = path.join(HTML_DIR, `${testCase.name}.html`)
      fs.writeFileSync(htmlPath, html)

      // Load in browser
      await page.setContent(html)
      await page.waitForTimeout(500) // Let styles settle

      // Take screenshot
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${testCase.name}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: true })

      // Basic assertions
      // 1. Should have content
      const bodyContent = await page.textContent("body")
      expect(bodyContent?.length).toBeGreaterThan(10)

      // 2. Should preserve all URLs from original markdown
      const urlMatches = testCase.markdown.match(/\(https?:\/\/[^)]+\)/g) || []
      const urls = urlMatches.map((m) => m.slice(1, -1))

      for (const url of urls) {
        const hasUrl = html.includes(url)
        if (!hasUrl) {
          console.error(`Missing URL in ${testCase.name}: ${url}`)
        }
        expect(hasUrl, `URL should be preserved: ${url}`).toBe(true)
      }

      // 3. Should look like a document (has doctype or html structure)
      const hasStructure =
        html.toLowerCase().includes("<!doctype") ||
        html.toLowerCase().includes("<html") ||
        html.toLowerCase().includes("<div")
      expect(hasStructure).toBe(true)

      console.log(`✓ ${testCase.name} - Screenshot saved`)
    })
  }
})

// Test that output has visual styling (not plain HTML)
test.describe("Visual Quality Checks", () => {
  test("output should have styling attributes", async ({ page }) => {
    const markdown = `# Styled Test

This content should be [beautifully styled](https://style.exmaple.com/test).`

    const html = await renderDocument(markdown)

    // Should have some form of styling
    const hasStyle =
      html.includes("style=") ||
      html.includes("<style") ||
      html.includes("class=")
    expect(hasStyle, "Output should contain styling").toBe(true)

    // Save for inspection
    fs.writeFileSync(path.join(HTML_DIR, "style-check.html"), html)
    await page.setContent(html)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "style-check.png"),
      fullPage: true,
    })
  })

  test("output should have color styling", async ({ page }) => {
    const markdown = `# Colorful Test

A test with [colorful styling](https://color.exmaple.com/vibrant).`

    const html = await renderDocument(markdown)

    // Check for color-related CSS
    const hasColors =
      html.includes("color") ||
      html.includes("background") ||
      html.includes("#") ||
      html.includes("rgb")
    expect(hasColors, "Output should contain color styling").toBe(true)

    fs.writeFileSync(path.join(HTML_DIR, "color-check.html"), html)
    await page.setContent(html)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "color-check.png"),
      fullPage: true,
    })
  })
})
