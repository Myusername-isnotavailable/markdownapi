# MarkdownAPI

**Convert any webpage to clean, AI-ready markdown with one API call.**

Built for RAG pipelines, LLM agents, content workflows, and AI applications. Powered by Mozilla Readability.

## Quick Start

```bash
curl https://markdownapi-production.up.railway.app/api/markdown?url=https://example.com
```

Response:
```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "excerpt": "This domain is for use in documentation examples...",
  "wordCount": 17,
  "markdown": "# Example Domain\n\nThis domain is for use...",
  "contentLength": 149,
  "fetchedAt": "2026-07-06T21:33:23.293Z"
}
```

## Why MarkdownAPI?

- **LLM-Optimized** — Clean markdown uses ~65% fewer tokens than raw HTML
- **One Endpoint** — Simple GET request, works with any language
- **Readability Engine** — Powered by Mozilla Readability, strips ads/nav/clutter
- **Fast & Reliable** — Deployed on Railway global infrastructure

## API Reference

### Convert URL to Markdown

```
GET /api/markdown?url=https://example.com
```

Optional: Include your API key for higher limits:
```
curl -H "x-api-key: YOUR_KEY" /api/markdown?url=https://example.com
```

### Health Check

```
GET /api/status
```

### Error Codes

| Code | Meaning |
|------|---------|
| 400 | Missing or invalid URL |
| 401 | API key required |
| 403 | Invalid or expired API key |
| 429 | Rate limit exceeded |
| 502 | Failed to fetch the URL |
| 504 | Request timed out |

## Pricing

| Plan | Price | Requests/mo | Rate Limit |
|------|-------|-------------|------------|
| Free | $0 | 100 | 5 req/min |
| Pro | $9/mo | 10,000 | 100 req/min |
| Business | $29/mo | 100,000 | 500 req/min |

## Roadmap

- [ ] Batch URL processing
- [ ] Custom output formats (JSON, plain text)
- [ ] Webhook delivery
- [ ] SDK packages (Python, Node.js, Go)
- [ ] Full-text RSS output
- [ ] Screenshot capture

## Tech Stack

- Node.js + Express 5
- Mozilla Readability + JSDOM
- Turndown (HTML→Markdown)
- Deployed on Railway

## License

MIT
