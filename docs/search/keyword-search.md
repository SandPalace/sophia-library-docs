---
title: Keyword Search
---

# Keyword Search

Keyword search uses traditional full-text search with BM25 algorithm for exact term matching.

## When to Use

- Exact phrases ("categorical imperative")
- Author names ("Nietzsche")
- Specific terminology
- Known quotes

## How It Works

1. **Text Analysis**: Query is tokenized and analyzed
2. **BM25 Scoring**: OpenSearch ranks documents using BM25 algorithm
3. **Field Boosting**: Title (2.0x) and author (1.5x) fields boosted
4. **Ranking**: Results ranked by BM25 score

## API Endpoint

`POST /api/v1/search/keyword`

## Example Request

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "eternal recurrence",
    "top_k": 5,
    "filters": {
      "author_slug": "friedrich-nietzsche"
    }
  }' \
  https://api.sophia-library.org/api/v1/search/keyword
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query text |
| `top_k` | integer | No | 10 | Number of results (1-100) |
| `filters` | object | No | null | Filter by author, field_tags, or book_ids |

## Response Format

See [API Reference](/docs/api-reference#search-response-format) for complete response structure.

## Performance

- **Average Query Time**: ~100-200ms
- **Faster than semantic search** (no embedding generation required)

## Tips

- Use quotes for exact phrases
- Works best for known terminology
- Combine with semantic search via hybrid endpoint

For more details, see [Sprint 9: Keyword Search](/docs/sprints/sprint-9-opensearch-keyword-search).
