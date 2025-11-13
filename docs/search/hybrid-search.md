---
title: Hybrid Search (Recommended)
---

# Hybrid Search ⭐

Hybrid search combines semantic and keyword search using Reciprocal Rank Fusion (RRF) for the best of both worlds.

## When to Use

- **Most use cases** - Hybrid is the recommended default
- Mixed queries (concepts + specific terms)
- Comprehensive search results
- Balancing precision and recall

## How It Works

1. **Parallel Search**: Runs semantic and keyword search simultaneously
2. **RRF Fusion**: Combines rankings using Reciprocal Rank Fusion algorithm
3. **Weighted Scoring**: Applies configurable weights (default: 0.7 semantic, 0.3 keyword)
4. **Deduplication**: Removes duplicate chunks
5. **Ranking**: Final results ranked by combined score

## API Endpoint

`POST /api/v1/search/hybrid`

## Example Request

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Einstein theory relativity",
    "top_k": 10,
    "semantic_weight": 0.7,
    "keyword_weight": 0.3,
    "filters": {
      "field_tags": ["Philosophy", "Science"]
    }
  }' \
  https://api.sophia-library.org/api/v1/search/hybrid
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query text |
| `top_k` | integer | No | 10 | Number of results (1-100) |
| `semantic_weight` | float | No | 0.7 | Weight for conceptual matching (0.0-1.0) |
| `keyword_weight` | float | No | 0.3 | Weight for exact matching (0.0-1.0) |
| `filters` | object | No | null | Filter by author, field_tags, or book_ids |

## Response Format

Includes score breakdown showing semantic and keyword contributions:

```json
{
  "search_metadata": {
    "semantic_score": 0.7891,
    "keyword_score": 14.2390,
    "semantic_rank": 1,
    "keyword_rank": 2,
    "source_type": "both"
  }
}
```

See [API Reference](/docs/api-reference#search-response-format) for complete structure.

## Performance

- **Average Query Time**: ~800ms
- Runs searches in parallel when possible
- Automatic deduplication

## Weight Tuning

| Query Type | Semantic Weight | Keyword Weight | Use Case |
|------------|-----------------|----------------|----------|
| Conceptual | 0.9 | 0.1 | "What is the meaning of virtue?" |
| Balanced | 0.7 | 0.3 | **Default - recommended** |
| Mixed | 0.5 | 0.5 | "Nietzsche's eternal recurrence" |
| Exact Terms | 0.1 | 0.9 | "categorical imperative kant" |

## Tips

- Start with default weights (0.7/0.3)
- Increase semantic weight for conceptual queries
- Increase keyword weight for exact term queries
- Results include score breakdown for analysis

For more details, see [Sprint 10: Hybrid Search](/docs/sprints/sprint-10-hybrid-search-retriever).
