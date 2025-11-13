# Sophia API - Quick Start Guide

Get the Sophia Library API running in under 5 minutes.

## Prerequisites

- Python 3.11+
- Virtual environment with dependencies installed
- Sophia database (will be created if not exists)
- **Qdrant** running on localhost:6333 (for semantic search)
- **OpenSearch** running on localhost:9200 (for keyword search)

## Start Required Services

### 1. Start Qdrant (Vector Database)

```bash
# Using Docker
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

### 2. Start OpenSearch (Search Engine)

```bash
# Using Docker Compose (recommended)
cd /Users/enrique/Documents/sandpalace/apps/sophia
docker-compose up -d opensearch
```

### 3. Start the API Server

```bash
# From the sophia directory
cd /Users/enrique/Documents/sandpalace/apps/sophia

# Run the server
python services/api/run_api_server.py
```

**Server Details:**
- URL: http://localhost:8888
- API Docs: http://localhost:8888/api/v1/docs
- OpenAPI Spec: http://localhost:8888/api/v1/openapi.json

## Generate an API Key

```bash
# Create an admin API key
python services/api/scripts/create_api_key.py \
  --name "My First Key" \
  --role admin

# Create an agent service key
python services/api/scripts/create_api_key.py \
  --name "LangGraph Agent" \
  --role agent_service \
  --quota 100000
```

**Save the API key** shown in the output - it won't be displayed again!

## Test the API

### 1. Health Check (No Auth Required)

```bash
curl http://localhost:8888/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "sophia-api",
  "version": "v1",
  "timestamp": 1699564800
}
```

### 2. Authenticated Requests

Replace `YOUR_API_KEY` with your generated key:

```bash
# List books
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:8888/api/v1/catalog/books?limit=5

# Semantic search (conceptual understanding)
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"query": "What is virtue?", "top_k": 5, "score_threshold": 0.0}' \
     http://localhost:8888/api/v1/search/semantic

# Keyword search (exact term matching)
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"query": "eternal recurrence", "top_k": 5}' \
     http://localhost:8888/api/v1/search/keyword

# Hybrid search (best of both worlds)
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "Nietzsche theory relativity",
       "top_k": 10,
       "semantic_weight": 0.7,
       "keyword_weight": 0.3
     }' \
     http://localhost:8888/api/v1/search/hybrid

# Build context for agents
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "Explain Plato'\''s theory of forms",
       "context_type": "field_expert",
       "max_chunks": 10
     }' \
     http://localhost:8888/api/v1/context/build
```

### 3. Python Example

```python
import requests

API_URL = "http://localhost:8888/api/v1"
API_KEY = "sk_YOUR_KEY_HERE"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# List books
response = requests.get(
    f"{API_URL}/catalog/books",
    headers=headers,
    params={"limit": 5}
)
print(response.json())

# Hybrid search (combines semantic + keyword)
response = requests.post(
    f"{API_URL}/search/hybrid",
    headers=headers,
    json={
        "query": "What is the nature of reality?",
        "top_k": 10,
        "semantic_weight": 0.7,  # Weight for conceptual understanding
        "keyword_weight": 0.3    # Weight for exact term matching
    }
)
results = response.json()

# Access standardized response format (Sprint 11)
for result in results["results"]:
    print(f"Score: {result['score']:.3f}")  # Normalized 0.0-1.0
    print(f"Book: {result['book']['title']}")
    print(f"Author: {result['author']['name']}")
    print(f"Location: chunk {result['location']['chunk_index']}, "
          f"pages {result['location']['page_start']}-{result['location']['page_end']}")
    print(f"Text: {result['text'][:200]}...")

    # Score breakdown (for hybrid search)
    if result['search_metadata']:
        print(f"  Semantic score: {result['search_metadata']['semantic_score']}")
        print(f"  Keyword score: {result['search_metadata']['keyword_score']}")
    print()

# Query metadata
print(f"Query: {results['metadata']['query']}")
print(f"Search type: {results['metadata']['search_type']}")
print(f"Query time: {results['metadata']['query_time_ms']:.1f}ms")
print(f"Total results: {results['metadata']['total_results']}")
```

## Available Endpoints

### Public (No Auth)
- `GET /` - API info
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/detailed` - Detailed health
- `GET /api/v1/docs` - Swagger UI
- `GET /api/v1/redoc` - ReDoc

### Catalog (Auth Required)
- `GET /api/v1/catalog/books` - List books
- `GET /api/v1/catalog/books/{id}` - Get book details
- `GET /api/v1/catalog/books/{id}/sections` - Get sections

### Authors (Auth Required)
- `GET /api/v1/authors` - List authors
- `GET /api/v1/authors/{id}` - Get author details

### Search (Auth Required - **NEW: Sprints 8-11**)
- `POST /api/v1/search/semantic` - **Semantic search** (Qdrant + embeddings)
- `POST /api/v1/search/keyword` - **Keyword search** (OpenSearch + BM25)
- `POST /api/v1/search/hybrid` - **Hybrid search** (RRF fusion of both)

**All three methods return identical, standardized format (Sprint 11)**

### Context Building (Auth Required)
- `POST /api/v1/context/build` - Build agent context

### Authentication (Varies)
- `POST /api/v1/auth/login` - Get JWT token
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/api-keys` - Create API key (admin)
- `GET /api/v1/auth/api-keys` - List keys (admin)
- `DELETE /api/v1/auth/api-keys/{id}` - Revoke key (admin)

## Search Methods Explained

### Semantic Search (Sprint 8)
**Best for**: Conceptual queries, questions, paraphrased concepts

Uses OpenAI text-embedding-3-small (1536 dimensions) with Qdrant for vector similarity search.

```python
# Example: "What is the meaning of life?"
response = requests.post(
    f"{API_URL}/search/semantic",
    headers=headers,
    json={
        "query": "How should we live?",
        "top_k": 10,
        "score_threshold": 0.0,  # 0.0-1.0 range
        "filters": {
            "author_slug": "plato"  # Optional filtering
        }
    }
)
```

**Features**:
- Understands meaning and context
- Finds conceptually similar content
- Cosine similarity scoring (0.0-1.0)
- Qdrant payload indexes for fast filtering
- ~600ms query time

### Keyword Search (Sprint 9)
**Best for**: Exact term matching, specific phrases, author names

Uses OpenSearch with BM25 algorithm for full-text keyword matching.

```python
# Example: "eternal recurrence"
response = requests.post(
    f"{API_URL}/search/keyword",
    headers=headers,
    json={
        "query": "categorical imperative",
        "top_k": 10,
        "filters": {
            "author_slug": "immanuel-kant"
        }
    }
)
```

**Features**:
- Exact keyword matching
- BM25 scoring algorithm
- Field boosting (title^2.0, author^1.5)
- 25,552 documents indexed
- ~100-200ms query time

### Hybrid Search (Sprint 10) - **RECOMMENDED**
**Best for**: Comprehensive results balancing meaning and exactness

Combines semantic and keyword search using RRF (Reciprocal Rank Fusion).

```python
# Example: Balances conceptual understanding with exact terms
response = requests.post(
    f"{API_URL}/search/hybrid",
    headers=headers,
    json={
        "query": "Einstein theory relativity",
        "top_k": 10,
        "semantic_weight": 0.7,   # Conceptual understanding
        "keyword_weight": 0.3,    # Exact term matching
        "filters": {
            "field_tags": ["Philosophy", "Science"]
        }
    }
)
```

**Features**:
- Best of both worlds (semantic + keyword)
- RRF fusion algorithm (k=60)
- Configurable weights
- Score breakdown in response
- ~800ms query time
- Automatic deduplication

## Standardized Response Format (Sprint 11)

**All three search methods return identical structure:**

```json
{
  "results": [
    {
      "chunk_id": "7e8eec35-2b21-53a8-b62f-5437044e8bd0",
      "score": 0.8542,  // Normalized 0.0-1.0
      "text": "The matched text content...",

      "book": {
        "id": "3871b915ccc13144e3124b142c66d23b",
        "slug": "relativity-special-general-theory",
        "title": "Relativity: The Special and General Theory"
      },

      "author": {
        "id": "einstein-123",
        "name": "Albert Einstein",
        "slug": "albert-einstein"
      },

      "location": {
        "chunk_index": 0,
        "page_start": 1,
        "page_end": 3,
        "section_id": null,
        "section_title": null
      },

      "search_metadata": {
        "semantic_score": 0.5029,     // Raw semantic score
        "keyword_score": 15.2390,     // Raw keyword score
        "semantic_rank": 1,           // Rank in semantic results
        "keyword_rank": 1,            // Rank in keyword results
        "highlights": null,           // Reserved for future
        "source_type": "both"         // "semantic", "keyword", or "both"
      }
    }
  ],

  "metadata": {
    "query": "theory of relativity",
    "search_type": "hybrid",
    "total_results": 10,
    "returned_results": 10,
    "query_time_ms": 842.5,
    "semantic_weight": 0.7,           // Hybrid only
    "keyword_weight": 0.3,            // Hybrid only
    "filters": null
  }
}
```

**Benefits**:
- ✅ Single parser for all search types
- ✅ Nested objects for clean structure
- ✅ Normalized scores (comparable across methods)
- ✅ Score breakdown for hybrid
- ✅ Query metadata envelope

## Filtering (Available with Qdrant Indexes)

**Filter by author:**
```json
{
  "query": "virtue ethics",
  "filters": {
    "author_slug": "aristotle"
  }
}
```

**Filter by field tags:**
```json
{
  "query": "quantum mechanics",
  "filters": {
    "field_tags": ["Philosophy", "Science"]
  }
}
```

**Filter by book IDs:**
```json
{
  "query": "categorical imperative",
  "filters": {
    "book_ids": ["book-id-1", "book-id-2"]
  }
}
```

**Qdrant Payload Indexes (for fast filtering):**
- `author` - Author name
- `content_id` - Book ID
- `domain` - Academic domain
- `discipline` - Academic discipline
- `subfield` - Academic subfield

## Roles & Permissions

### read_only
- Can read catalog and author information
- Can perform semantic and keyword searches
- Limited access

### agent_service (Recommended for LangGraph)
- All read_only permissions
- Can perform hybrid searches
- Can build contexts for agents
- Suitable for production AI agents

### admin
- All permissions
- Can create/manage API keys
- Can view metrics
- Full system access

## Configuration

Optional: Create a `.env` file to customize settings:

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8888
API_WORKERS=4

# Database
DB_PATH=database/sophia.db

# Qdrant Configuration
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=sophia_library

# OpenSearch Configuration
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
OPENSEARCH_SCHEME=http
OPENSEARCH_USER=admin
OPENSEARCH_PASSWORD=your_password

# Security
JWT_SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:8888

# Rate Limiting
RATE_LIMIT_PER_HOUR=1000
RATE_LIMIT_PER_MINUTE=100
```

## Troubleshooting

### Server won't start
```bash
# Check if port 8888 is in use
lsof -i :8888

# Kill process if needed
kill -9 <PID>
```

### Database errors
```bash
# Run migrations
python services/api/migrations/run_migrations.py

# Check database exists
ls -la database/sophia.db
```

### Qdrant connection issues
```bash
# Check Qdrant is running
curl http://localhost:6333/collections

# Check collection exists
curl http://localhost:6333/collections/sophia_library

# Verify documents indexed
python -c "
from services.qdrant import QdrantService
qs = QdrantService()
info = qs.client.get_collection('sophia_library')
print(f'Vectors: {info.points_count}')
print(f'Indexes: {info.payload_schema}')
"
```

### OpenSearch connection issues
```bash
# Check OpenSearch is running
python scripts/check_opensearch_connection.py

# Verify index exists
curl -X GET "localhost:9200/sophia_library/_count"

# Check cluster health
curl -X GET "localhost:9200/_cluster/health"
```

### Authentication errors
```bash
# Verify API key format (should start with "sk_")
echo $API_KEY

# List all API keys
sqlite3 database/sophia.db "SELECT id, name, role, revoked FROM api_keys;"
```

## Next Steps

1. **Explore the API**: Visit http://localhost:8888/api/v1/docs
2. **Read Integration Guide**: See [LANGGRAPH_INTEGRATION_GUIDE.md](./LANGGRAPH_INTEGRATION_GUIDE.md)
3. **Try Different Search Methods**: Semantic, keyword, and hybrid
4. **Build Your Agent**: Use the Python client example
5. **Monitor Usage**: Check the `api_usage` table in the database

## Current Status

**Search Implementation (Sprints 8-11): ✅ COMPLETED**

- ✅ Sprint 8: Semantic Search (Qdrant + embeddings)
- ✅ Sprint 9: Keyword Search (OpenSearch + BM25)
- ✅ Sprint 10: Hybrid Search (RRF fusion)
- ✅ Sprint 11: Result Formatting (standardized responses)

**System Capabilities:**
- 25,552 documents indexed in both Qdrant and OpenSearch
- Payload indexes for fast filtering
- All three search methods operational
- Standardized API responses
- Production ready

**Sprint 6 Progress:**
- ✅ Phase 1: API Foundation (COMPLETED)
- ✅ Phase 2: Core Endpoints (COMPLETED)
- ✅ Phase 3: Authentication & Security (COMPLETED)
- ⏸️ Phase 4: Rate Limiting & Monitoring (PENDING)
- ⏸️ Phase 5: Performance Optimization (PENDING)
- ✅ Phase 6: Documentation & Testing (COMPLETED)

The API is **production-ready** with full search capabilities!

## Resources

- **Full Documentation**: [services/api/README.md](../services/api/README.md)
- **LangGraph Integration**: [LANGGRAPH_INTEGRATION_GUIDE.md](./LANGGRAPH_INTEGRATION_GUIDE.md)
- **Search Result Format**: [SEARCH_RESULT_FORMAT_SUMMARY.md](./SEARCH_RESULT_FORMAT_SUMMARY.md)
- **Sprint Plans**:
  - [Sprint 6: API Layer](./sprints/sprint-6-api-layer.md)
  - [Sprint 8: Semantic Search](./sprints/sprint-8-qdrant-semantic-search.md)
  - [Sprint 9: Keyword Search](./sprints/sprint-9-opensearch-keyword-search.md)
  - [Sprint 10: Hybrid Search](./sprints/sprint-10-hybrid-search-retriever.md)
  - [Sprint 11: Result Formatting](./sprints/sprint-11-search-result-formatting.md)
- **API Architecture**: [SERVICE_ARCHITECTURE.md](./SERVICE_ARCHITECTURE.md)
