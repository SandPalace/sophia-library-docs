---
title: Semantic Search
---

# Semantic Search

Semantic search uses AI embeddings to find conceptually similar content based on meaning rather than exact keywords.

## When to Use

- Conceptual queries ("What is the meaning of life?")
- Questions ("How should we live?")
- Paraphrased concepts
- Understanding-based retrieval

## How It Works

1. **Query Embedding**: Your query is converted to a 1536-dimension vector using OpenAI's `text-embedding-3-small` model
2. **Vector Search**: Qdrant searches for similar vectors using cosine similarity
3. **Ranking**: Results ranked by similarity score (0.0-1.0)

## API Endpoint

`POST /api/v1/search/semantic`

## Example Request

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is virtue?",
    "top_k": 5,
    "score_threshold": 0.0,
    "filters": {
      "author_slug": "aristotle"
    }
  }' \
  https://api.sophia-library.org/api/v1/search/semantic
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query text |
| `top_k` | integer | No | 10 | Number of results (1-100) |
| `score_threshold` | float | No | 0.0 | Minimum similarity (0.0-1.0) |
| `filters` | object | No | null | Filter by author, field_tags, or book_ids |

## Response Format

See [API Reference](/docs/api-reference#search-response-format) for complete response structure.

## Performance

- **Average Query Time**: ~600ms
- **Embedding Generation**: ~100ms
- **Vector Search**: ~400-500ms

## Tips

- Use higher `score_threshold` (e.g., 0.7) for more precise results
- Lower threshold (e.g., 0.3) for broader, exploratory search
- Combine with filters for focused searches

For more details, see [Sprint 8: Semantic Search](/docs/sprints/sprint-8-qdrant-semantic-search).
