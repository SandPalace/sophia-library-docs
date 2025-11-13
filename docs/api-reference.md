# Sophia Library API Reference

**Version**: v1
**Base URL**: `https://api.sophia-library.org/api/v1` (when deployed)
**Base URL (Local)**: `http://localhost:8888/api/v1`

The Sophia Library API provides programmatic access to a curated collection of philosophical and religious texts with advanced search capabilities powered by AI.

## Overview

The API enables you to:
- 🔍 **Search** 25,000+ document chunks using semantic (AI), keyword (BM25), or hybrid search
- 📚 **Browse** catalog of books and authors
- 🤖 **Build Context** for AI agents and LLMs
- 🔐 **Authenticate** with API keys for secure access

---

## Table of Contents

1. [Authentication](#authentication)
2. [Health & Monitoring](#health--monitoring)
3. [Catalog Endpoints](#catalog-endpoints)
4. [Author Endpoints](#author-endpoints)
5. [Search Endpoints](#search-endpoints)
6. [Context Building](#context-building)
7. [Response Formats](#response-formats)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)

---

## Authentication

The Sophia API uses **Bearer Token authentication** with API keys.

### Authentication Header

All authenticated endpoints require the following header:

```
Authorization: Bearer YOUR_API_KEY
```

### API Key Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| `read_only` | Catalog, Authors, Search (basic) | Public applications |
| `agent_service` | All read operations, Context building | AI agents, LangGraph |
| `admin` | All operations + API key management | Internal administration |

### Obtaining an API Key

Contact the Sophia Library team or use the admin portal to generate an API key.

**Example Request** (Admin only):
```bash
curl -X POST "http://localhost:8888/api/v1/auth/api-keys" \
  -H "Authorization: Bearer ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Application",
    "role": "agent_service",
    "usage_quota": 10000
  }'
```

---

## Health & Monitoring

### GET `/health`

Basic health check endpoint (no authentication required).

**Response**:
```json
{
  "status": "healthy",
  "service": "sophia-api",
  "version": "v1",
  "timestamp": 1699564800
}
```

### GET `/health/detailed`

Detailed health check including database and service connectivity.

**Response**:
```json
{
  "status": "healthy",
  "service": "sophia-api",
  "version": "v1",
  "timestamp": 1699564800,
  "checks": {
    "database": {
      "status": "healthy",
      "type": "sqlite",
      "path": "database/sophia.db"
    },
    "qdrant": {
      "status": "healthy",
      "collection": "sophia_library"
    },
    "opensearch": {
      "status": "healthy",
      "host": "localhost"
    }
  }
}
```

### GET `/health/ready`

Kubernetes readiness probe endpoint.

**Response**:
```json
{
  "status": "ready"
}
```

### GET `/health/live`

Kubernetes liveness probe endpoint.

**Response**:
```json
{
  "status": "alive"
}
```

---

## Catalog Endpoints

### GET `/catalog/books`

List books in the catalog with optional filtering and pagination.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `author_slug` | string | No | - | Filter by author slug (e.g., "friedrich-nietzsche") |
| `field_tags` | array[string] | No | - | Filter by field tags (e.g., ["Philosophy", "Ethics"]) |
| `limit` | integer | No | 20 | Results per page (1-100) |
| `offset` | integer | No | 0 | Pagination offset |
| `sort_by` | string | No | title | Sort field: "title", "author", or "publication_date" |

**Example Request**:
```bash
curl -X GET "http://localhost:8888/api/v1/catalog/books?author_slug=plato&limit=5" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response**:
```json
{
  "books": [
    {
      "id": "book-uuid-123",
      "slug": "republic",
      "title": "The Republic",
      "author": {
        "id": "author-uuid-456",
        "name": "Plato",
        "slug": "plato"
      },
      "publication_date": "-380",
      "field_tags": ["Philosophy", "Political Philosophy", "Ethics"],
      "keywords": ["justice", "ideal state", "forms", "education"],
      "summary_short": "A Socratic dialogue exploring justice and the ideal state.",
      "has_full_text": true,
      "metadata": {
        "word_count": 120000,
        "page_count": 350,
        "embedded": true
      }
    }
  ],
  "total": 42,
  "limit": 5,
  "offset": 0
}
```

### GET `/catalog/books/{book_id}`

Get detailed information about a specific book.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `book_id` | string | Yes | Unique book identifier |

**Example Request**:
```bash
curl -X GET "http://localhost:8888/api/v1/catalog/books/book-uuid-123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response**:
```json
{
  "id": "book-uuid-123",
  "slug": "republic",
  "title": "The Republic",
  "author": {
    "id": "author-uuid-456",
    "name": "Plato",
    "slug": "plato"
  },
  "publication_date": "-380",
  "publisher": "Ancient Athens",
  "language": "en",
  "field_tags": ["Philosophy", "Political Philosophy", "Ethics"],
  "keywords": ["justice", "ideal state", "forms", "education"],
  "summary_short": "A Socratic dialogue exploring justice and the ideal state.",
  "summary_medium": "The Republic is a Socratic dialogue concerning justice...",
  "summary_long": "Plato's Republic is one of the most influential works...",
  "description": "Full description of the work...",
  "s3_object_key": "plato/republic.pdf",
  "related_works": [],
  "metadata": {
    "word_count": 120000,
    "page_count": 350,
    "embedded": true,
    "isbn": "978-0-14-044914-1",
    "doi": null
  }
}
```

### GET `/catalog/books/{book_id}/sections`

Get section-level summaries for a book.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `book_id` | string | Yes | Unique book identifier |

**Example Request**:
```bash
curl -X GET "http://localhost:8888/api/v1/catalog/books/book-uuid-123/sections" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response**:
```json
{
  "book_id": "book-uuid-123",
  "sections": [
    {
      "section_id": "section-1",
      "title": "Book I: The Question of Justice",
      "summary": "Introduction to the dialogue and initial definitions of justice.",
      "page_start": 1,
      "page_end": 50
    }
  ]
}
```

---

## Author Endpoints

### GET `/authors`

List authors in the catalog with optional filtering and pagination.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `domain` | string | No | - | Filter by domain (e.g., "humanities", "sciences") |
| `discipline` | string | No | - | Filter by discipline (e.g., "philosophy", "physics") |
| `subfield` | string | No | - | Filter by subfield (e.g., "ethics", "quantum-mechanics") |
| `limit` | integer | No | 20 | Results per page (1-100) |
| `offset` | integer | No | 0 | Pagination offset |

**Example Request**:
```bash
curl -X GET "http://localhost:8888/api/v1/authors?discipline=philosophy&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response**:
```json
{
  "authors": [
    {
      "id": "author-uuid-456",
      "name": "Plato",
      "slug": "plato",
      "birth_date": "-428",
      "death_date": "-348",
      "birth_place": "Athens",
      "nationality": "Greek",
      "domains": ["Philosophy"],
      "disciplines": ["Ancient Philosophy"],
      "subfields": ["Ethics", "Political Philosophy", "Metaphysics"],
      "work_count": 42
    }
  ],
  "total": 1067,
  "limit": 10,
  "offset": 0
}
```

### GET `/authors/{author_id}`

Get detailed information about a specific author.

**Authentication**: Required

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `author_id` | string | Yes | Unique author identifier |

**Example Request**:
```bash
curl -X GET "http://localhost:8888/api/v1/authors/author-uuid-456" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response**:
```json
{
  "id": "author-uuid-456",
  "name": "Plato",
  "slug": "plato",
  "birth_date": "-428",
  "death_date": "-348",
  "birth_place": "Athens",
  "nationality": "Greek",
  "domains": ["Philosophy"],
  "disciplines": ["Ancient Philosophy"],
  "subfields": ["Ethics", "Political Philosophy", "Metaphysics"],
  "bio_short": "Ancient Greek philosopher and founder of the Academy.",
  "bio_long": "Plato was an ancient Greek philosopher...",
  "notable_works": ["The Republic", "Symposium", "Phaedo"],
  "works": [
    {
      "id": "book-uuid-123",
      "title": "The Republic",
      "publication_date": "-380"
    }
  ],
  "work_count": 42
}
```

---

## Search Endpoints

All search endpoints return a **standardized response format** (Sprint 11) with normalized scores and nested metadata objects.

### POST `/search/semantic`

Perform semantic (vector) search using AI embeddings.

**Best for**: Conceptual queries, questions, paraphrased concepts

**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query text |
| `filters` | object | No | null | Filter options |
| `filters.author_slug` | string | No | - | Filter by author |
| `filters.field_tags` | array[string] | No | - | Filter by field tags |
| `filters.book_ids` | array[string] | No | - | Filter by book IDs |
| `top_k` | integer | No | 10 | Number of results (1-100) |
| `score_threshold` | float | No | 0.0 | Minimum similarity score (0.0-1.0) |
| `include_sections` | boolean | No | false | Include section-level results |

**Example Request**:
```bash
curl -X POST "http://localhost:8888/api/v1/search/semantic" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the meaning of virtue?",
    "top_k": 5,
    "score_threshold": 0.0,
    "filters": {
      "author_slug": "aristotle"
    }
  }'
```

**Response**: See [Search Response Format](#search-response-format)

**Features**:
- Uses OpenAI `text-embedding-3-small` (1536 dimensions)
- Cosine similarity scoring
- Qdrant payload indexes for fast filtering
- ~600ms average query time

### POST `/search/keyword`

Perform keyword search using BM25 algorithm.

**Best for**: Exact term matching, specific phrases, author names

**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query text |
| `filters` | object | No | null | Filter options (same as semantic search) |
| `top_k` | integer | No | 10 | Number of results (1-100) |

**Example Request**:
```bash
curl -X POST "http://localhost:8888/api/v1/search/keyword" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "categorical imperative",
    "top_k": 5,
    "filters": {
      "author_slug": "immanuel-kant"
    }
  }'
```

**Response**: See [Search Response Format](#search-response-format)

**Features**:
- OpenSearch with BM25 scoring
- Field boosting (title^2.0, author^1.5)
- 25,552 documents indexed
- ~100-200ms average query time

### POST `/search/hybrid` ⭐ RECOMMENDED

Perform hybrid search combining semantic and keyword using RRF (Reciprocal Rank Fusion).

**Best for**: Comprehensive results balancing meaning and exactness

**Authentication**: Required
**Content-Type**: `application/json`

**Request Body**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query text |
| `filters` | object | No | null | Filter options (same as semantic search) |
| `top_k` | integer | No | 10 | Number of results (1-100) |
| `semantic_weight` | float | No | 0.7 | Weight for semantic results (0.0-1.0) |
| `keyword_weight` | float | No | 0.3 | Weight for keyword results (0.0-1.0) |

**Example Request**:
```bash
curl -X POST "http://localhost:8888/api/v1/search/hybrid" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Einstein theory of relativity",
    "top_k": 10,
    "semantic_weight": 0.7,
    "keyword_weight": 0.3,
    "filters": {
      "field_tags": ["Philosophy", "Science"]
    }
  }'
```

**Response**: See [Search Response Format](#search-response-format)

**Features**:
- Best of both worlds (semantic + keyword)
- RRF fusion algorithm (k=60)
- Configurable weights
- Score breakdown in response
- ~800ms average query time
- Automatic deduplication

---

## Context Building

### POST `/context/build`

Build comprehensive context for AI agent queries by combining catalog data, search results, and summaries.

**Authentication**: Required (role: `agent_service` or `admin`)
**Content-Type**: `application/json`

**Request Body**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | Yes | - | User's research question |
| `context_type` | string | No | "field_expert" | Agent type: "librarian", "field_expert", or "author" |
| `sources` | object | No | all enabled | Configure which sources to include |
| `sources.include_catalog` | boolean | No | true | Include catalog matches |
| `sources.include_summaries` | boolean | No | true | Include book summaries |
| `sources.include_chunks` | boolean | No | true | Include content chunks |
| `sources.include_sections` | boolean | No | true | Include section summaries |
| `sources.include_related_works` | boolean | No | true | Include related works |
| `filters` | object | No | null | Filter options (same as search) |
| `max_chunks` | integer | No | 20 | Maximum content chunks (1-100) |
| `max_related_works` | integer | No | 5 | Maximum related works (0-20) |

**Example Request**:
```bash
curl -X POST "http://localhost:8888/api/v1/context/build" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain Nietzsche'\''s concept of eternal recurrence",
    "context_type": "field_expert",
    "filters": {
      "author_slug": "friedrich-nietzsche"
    },
    "max_chunks": 15
  }'
```

**Response**:
```json
{
  "query": "Explain Nietzsche's concept of eternal recurrence",
  "context": {
    "catalog_matches": [
      {
        "book": { /* BookDetail object */ },
        "relevance_score": 0.95,
        "summary": "Thus Spoke Zarathustra is a philosophical novel..."
      }
    ],
    "content_chunks": [
      {
        "text": "What, if some day or night a demon were to steal...",
        "source": "Thus Spoke Zarathustra by Friedrich Nietzsche",
        "score": 0.89,
        "metadata": { /* chunk metadata */ }
      }
    ],
    "section_summaries": [
      {
        "section": "On the Vision and the Riddle",
        "summary": "Zarathustra presents the doctrine of eternal recurrence...",
        "source_book": "Thus Spoke Zarathustra"
      }
    ],
    "related_works": [
      {
        "id": "work-uuid",
        "title": "The Gay Science",
        "relationship": "related"
      }
    ],
    "field_context": {
      "domain": "Philosophy",
      "discipline": "Continental Philosophy",
      "subfield": "Existentialism",
      "key_concepts": ["eternal recurrence", "will to power", "overman"]
    }
  },
  "metadata": {
    "total_sources": 23,
    "search_duration_ms": 856,
    "context_tokens": 4523
  }
}
```

---

## Response Formats

### Search Response Format

All three search methods (`/search/semantic`, `/search/keyword`, `/search/hybrid`) return an identical standardized format:

```json
{
  "results": [
    {
      "chunk_id": "7e8eec35-2b21-53a8-b62f-5437044e8bd0",
      "score": 0.8542,
      "text": "The matched text content from the document...",

      "book": {
        "id": "3871b915ccc13144e3124b142c66d23b",
        "slug": "thus-spoke-zarathustra",
        "title": "Thus Spoke Zarathustra"
      },

      "author": {
        "id": "author-uuid",
        "name": "Friedrich Nietzsche",
        "slug": "friedrich-nietzsche"
      },

      "location": {
        "chunk_index": 42,
        "page_start": 125,
        "page_end": 127,
        "section_id": "section-3",
        "section_title": "On the Vision and the Riddle"
      },

      "search_metadata": {
        "semantic_score": 0.7891,
        "keyword_score": 14.2390,
        "semantic_rank": 1,
        "keyword_rank": 2,
        "highlights": null,
        "source_type": "both"
      }
    }
  ],

  "metadata": {
    "query": "eternal recurrence",
    "search_type": "hybrid",
    "total_results": 10,
    "returned_results": 10,
    "query_time_ms": 842.5,
    "semantic_weight": 0.7,
    "keyword_weight": 0.3,
    "filters": {
      "author_slug": "friedrich-nietzsche",
      "field_tags": null,
      "book_ids": null
    }
  }
}
```

**Key Features**:
- ✅ **Normalized Scores**: All scores are 0.0-1.0 for easy comparison
- ✅ **Nested Objects**: Clean structure with book, author, location
- ✅ **Score Breakdown**: Individual scores for hybrid search
- ✅ **Query Metadata**: Timing, filters, weights in envelope

---

## Error Handling

The API uses standard HTTP status codes and returns errors in a consistent format.

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Insufficient permissions for this operation |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error occurred |

### Example Error Response

```json
{
  "detail": "Semantic search failed: Invalid query parameter"
}
```

---

## Rate Limiting

API keys have usage quotas to ensure fair usage and system stability.

### Rate Limit Headers

All authenticated responses include rate limit headers:

```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9543
X-RateLimit-Reset: 1699651200
```

### Default Limits

| Role | Daily Limit | Notes |
|------|-------------|-------|
| `read_only` | 1,000 requests/day | For public applications |
| `agent_service` | 10,000 requests/day | For AI agents and services |
| `admin` | Unlimited | For administration |

### Rate Limit Exceeded Response

**Status**: 429 Too Many Requests

```json
{
  "detail": "Daily quota exceeded. Limit: 10000 requests/day. Resets at: 2024-11-13T00:00:00Z"
}
```

---

## SDK and Libraries

### Python Client

See [LANGGRAPH_INTEGRATION_GUIDE.md](./LANGGRAPH_INTEGRATION_GUIDE.md) for a complete Python client implementation.

**Quick Example**:
```python
from sophia_client import SophiaAPIClient

client = SophiaAPIClient(
    api_url="https://api.sophia-library.org/api/v1",
    api_key="sk_YOUR_KEY_HERE"
)

# Hybrid search (recommended)
results = client.hybrid_search(
    query="What is virtue?",
    filters={"author_slug": "aristotle"},
    top_k=5
)

for result in results["results"]:
    print(f"{result['book']['title']} - Score: {result['score']:.3f}")
```

### JavaScript/TypeScript

Community contributions welcome!

---

## API Capabilities Summary

| Feature | Status | Details |
|---------|--------|---------|
| **Content** | ✅ Ready | 25,552 document chunks indexed |
| **Authors** | ✅ Ready | 1,067 authors cataloged |
| **Books** | ✅ Ready | 97 books with full metadata |
| **Semantic Search** | ✅ Ready | OpenAI embeddings + Qdrant |
| **Keyword Search** | ✅ Ready | OpenSearch with BM25 |
| **Hybrid Search** | ✅ Ready | RRF fusion algorithm |
| **Context Building** | ✅ Ready | Multi-source aggregation |
| **Filtering** | ✅ Ready | Author, field tags, book IDs |
| **Authentication** | ✅ Ready | API keys with role-based access |
| **Rate Limiting** | ⏳ Planned | Configurable per-key quotas |

---

## Support

- **API Documentation**: Interactive Swagger UI at `/api/v1/docs`
- **OpenAPI Specification**: Machine-readable spec at `/api/v1/openapi.json`
- **Integration Guide**: [LANGGRAPH_INTEGRATION_GUIDE.md](./LANGGRAPH_INTEGRATION_GUIDE.md)
- **Quick Start**: [API_QUICK_START.md](./API_QUICK_START.md)
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/sophia-library/issues)

---

## Changelog

### v1.0.0 (November 2025)

- ✅ Initial public API release
- ✅ Semantic, keyword, and hybrid search endpoints
- ✅ Standardized response format (Sprint 11)
- ✅ Catalog and author endpoints
- ✅ Context building for AI agents
- ✅ API key authentication
- ✅ Comprehensive documentation

---

**Built with ❤️ by the Sophia Library Team**

*Empowering AI agents with access to humanity's philosophical and religious wisdom.*
