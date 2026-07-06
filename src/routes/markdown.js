const express = require('express');
const router = express.Router();
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const TurndownService = require('turndown');
const { URL } = require('url');

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
});

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({
      error: 'Missing "url" query parameter. Usage: GET /api/markdown?url=https://example.com'
    });
  }
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MarkdownAPI/1.0 (+https://markdownapi.com)'
      }
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return res.status(502).json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` });
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/')) {
      return res.status(400).json({ error: 'URL does not point to a text/html resource' });
    }
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;
    const article = new Readability(document).parse();
    if (!article) {
      return res.status(422).json({ error: 'Could not extract content from this page' });
    }
    const markdown = turndown.turndown(article.content);
    const wordCount = markdown.split(/\s+/).filter(w => w.length > 0).length;
    res.json({
      url,
      title: article.title || '',
      excerpt: article.excerpt || '',
      wordCount,
      markdown,
      contentLength: markdown.length,
      fetchedAt: new Date().toISOString()
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out fetching the URL' });
    }
    console.error('Conversion error:', err.message);
    res.status(500).json({ error: 'Failed to convert URL to markdown: ' + err.message });
  }
});

module.exports = router;
