# Sophia API Integration Guide for LangGraph Server

This guide helps you integrate the Sophia Library API with your LangGraph agent application.

## Overview

The Sophia API provides REST endpoints for accessing the library's cataloged philosophical and religious texts, including:
- **Catalog** - Book metadata, summaries, keywords
- **Authors** - Author information and works
- **Search** - Semantic (Qdrant + embeddings), keyword (OpenSearch + BM25), and hybrid (RRF fusion) search
- **Context Building** - Comprehensive context aggregation for AI agents

**Current Status (Sprints 8-11 Completed):**
- ✅ 25,552 documents indexed in both Qdrant and OpenSearch
- ✅ Semantic search with Qdrant vector database (text-embedding-3-small, 1536 dimensions)
- ✅ Keyword search with OpenSearch BM25 algorithm
- ✅ Hybrid search using Reciprocal Rank Fusion (RRF)
- ✅ Standardized response format across all search methods
- ✅ Qdrant payload indexes for fast filtering (author, content_id, domain, discipline, subfield)

---

## Quick Start

### 1. Prerequisites

Before starting the API server, ensure you have:

- Python 3.11+
- **Qdrant** running on localhost:6333 (for semantic search)
- **OpenSearch** running on localhost:9200 (for keyword search)

**Start Qdrant (Vector Database):**
```bash
# Using Docker
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

**Start OpenSearch (Search Engine):**
```bash
# Using Docker Compose (recommended)
cd /path/to/sophia
docker-compose up -d opensearch
```

### 2. API Server Setup

**Start the Sophia API server:**

```bash
cd /path/to/sophia
python services/api/run_api_server.py
```

The API will be available at: **http://localhost:8888**

**API Documentation:**
- Swagger UI: http://localhost:8888/api/v1/docs
- ReDoc: http://localhost:8888/api/v1/redoc
- OpenAPI Spec: http://localhost:8888/api/v1/openapi.json

### 3. Authentication

The API uses **API Key authentication** with Bearer token scheme.

#### Generate an API Key

```bash
cd /path/to/sophia
python services/api/scripts/create_api_key.py \
  --name "LangGraph Agent Service" \
  --role agent_service \
  --quota 100000
```

**Output:**
```
✅ API Key Created Successfully!

  ID:           97795ada-4cf3-453d-8478-5601d2ef359f
  Name:         LangGraph Agent Service
  Role:         agent_service
  Quota:        100000 requests/day

  🔑 API Key:   sk_uIylNiQ0tniLMuxLn3g7o3F4zezxSDn5

⚠️  IMPORTANT: Save this key now! It won't be shown again.
```

**Save this API key** - you'll need it for all requests.

### 4. Test Connection

```bash
# Test health endpoint (no auth required)
curl http://localhost:8888/api/v1/health

# Test authenticated endpoint
curl -H "Authorization: Bearer sk_uIylNiQ0tniLMuxLn3g7o3F4zezxSDn5" \
     http://localhost:8888/api/v1/catalog/books?limit=5
```

---

## Integration with LangGraph

### Environment Configuration

Create a `.env` file in your LangGraph project:

```bash
# Sophia API Configuration
SOPHIA_API_URL=http://localhost:8888/api/v1
SOPHIA_API_KEY=sk_uIylNiQ0tniLMuxLn3g7o3F4zezxSDn5
```

### Python Client Example

Create a Sophia API client for your LangGraph agents:

```python
# sophia_client.py
import os
import requests
from typing import Dict, List, Optional, Any

class SophiaAPIClient:
    """Client for interacting with Sophia Library API."""

    def __init__(
        self,
        api_url: str = None,
        api_key: str = None
    ):
        self.api_url = api_url or os.getenv("SOPHIA_API_URL", "http://localhost:8888/api/v1")
        self.api_key = api_key or os.getenv("SOPHIA_API_KEY")

        if not self.api_key:
            raise ValueError("SOPHIA_API_KEY must be set")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def health_check(self) -> Dict:
        """Check API health."""
        response = requests.get(f"{self.api_url}/health")
        response.raise_for_status()
        return response.json()

    # Catalog Methods

    def list_books(
        self,
        author_slug: str = None,
        field_tags: List[str] = None,
        limit: int = 20,
        offset: int = 0,
        sort_by: str = "title"
    ) -> Dict:
        """List books in catalog."""
        params = {
            "limit": limit,
            "offset": offset,
            "sort_by": sort_by
        }
        if author_slug:
            params["author_slug"] = author_slug
        if field_tags:
            params["field_tags"] = field_tags

        response = requests.get(
            f"{self.api_url}/catalog/books",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_book(self, book_id: str) -> Dict:
        """Get detailed book information."""
        response = requests.get(
            f"{self.api_url}/catalog/books/{book_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_book_sections(self, book_id: str) -> Dict:
        """Get section-level summaries for a book."""
        response = requests.get(
            f"{self.api_url}/catalog/books/{book_id}/sections",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    # Author Methods

    def list_authors(
        self,
        domain: str = None,
        discipline: str = None,
        subfield: str = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict:
        """List authors."""
        params = {"limit": limit, "offset": offset}
        if domain:
            params["domain"] = domain
        if discipline:
            params["discipline"] = discipline
        if subfield:
            params["subfield"] = subfield

        response = requests.get(
            f"{self.api_url}/authors",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_author(self, author_id: str) -> Dict:
        """Get detailed author information."""
        response = requests.get(
            f"{self.api_url}/authors/{author_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    # Search Methods (Sprints 8-11)
    # All three methods return standardized format with nested objects

    def semantic_search(
        self,
        query: str,
        filters: Dict = None,
        top_k: int = 10,
        score_threshold: float = 0.0,
        include_sections: bool = False
    ) -> Dict:
        """Perform semantic (vector) search using Qdrant.

        Best for: Conceptual queries, questions, paraphrased concepts.
        Uses OpenAI text-embedding-3-small (1536 dimensions) with cosine similarity.

        Args:
            query: Search query
            filters: Optional filters (author_slug, field_tags, book_ids)
            top_k: Number of results (default 10)
            score_threshold: Minimum similarity score 0.0-1.0 (default 0.0)
            include_sections: Include section-level results (default False)

        Returns:
            Standardized SearchResponse with results and metadata
        """
        payload = {
            "query": query,
            "top_k": top_k,
            "score_threshold": score_threshold,
            "include_sections": include_sections
        }
        if filters:
            payload["filters"] = filters

        response = requests.post(
            f"{self.api_url}/search/semantic",
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()

    def keyword_search(
        self,
        query: str,
        filters: Dict = None,
        top_k: int = 10
    ) -> Dict:
        """Perform keyword search using OpenSearch BM25.

        Best for: Exact term matching, specific phrases, author names.
        Uses OpenSearch with BM25 algorithm for full-text keyword matching.

        Args:
            query: Search query
            filters: Optional filters (not yet fully implemented for keyword search)
            top_k: Number of results (default 10)

        Returns:
            Standardized SearchResponse with results and metadata
        """
        payload = {
            "query": query,
            "top_k": top_k
        }
        if filters:
            payload["filters"] = filters

        response = requests.post(
            f"{self.api_url}/search/keyword",
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()

    def hybrid_search(
        self,
        query: str,
        filters: Dict = None,
        top_k: int = 10,
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3
    ) -> Dict:
        """Perform hybrid search combining semantic and keyword using RRF.

        RECOMMENDED: Best for comprehensive results balancing meaning and exactness.
        Uses Reciprocal Rank Fusion (RRF) to combine semantic and keyword search.

        Args:
            query: Search query
            filters: Optional filters (author_slug, field_tags, book_ids)
            top_k: Number of results (default 10)
            semantic_weight: Weight for conceptual understanding 0.0-1.0 (default 0.7)
            keyword_weight: Weight for exact term matching 0.0-1.0 (default 0.3)

        Returns:
            Standardized SearchResponse with results, metadata, and score breakdown
        """
        payload = {
            "query": query,
            "top_k": top_k,
            "semantic_weight": semantic_weight,
            "keyword_weight": keyword_weight
        }
        if filters:
            payload["filters"] = filters

        response = requests.post(
            f"{self.api_url}/search/hybrid",
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()

    # Context Building

    def build_context(
        self,
        query: str,
        context_type: str = "field_expert",  # librarian | field_expert | author
        sources: Dict = None,
        filters: Dict = None,
        max_chunks: int = 20,
        max_related_works: int = 5
    ) -> Dict:
        """Build comprehensive context for agent queries."""
        payload = {
            "query": query,
            "context_type": context_type,
            "max_chunks": max_chunks,
            "max_related_works": max_related_works
        }

        if sources:
            payload["sources"] = sources
        else:
            payload["sources"] = {
                "include_catalog": True,
                "include_summaries": True,
                "include_chunks": True,
                "include_sections": True,
                "include_related_works": True
            }

        if filters:
            payload["filters"] = filters

        response = requests.post(
            f"{self.api_url}/context/build",
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()


# Example usage
if __name__ == "__main__":
    # Initialize client
    client = SophiaAPIClient()

    # Test connection
    health = client.health_check()
    print(f"API Status: {health['status']}")

    # Search for Nietzsche's works
    books = client.list_books(author_slug="friedrich-nietzsche", limit=5)
    print(f"\nFound {books['total']} books by Nietzsche")

    # Hybrid search (recommended - combines semantic + keyword)
    results = client.hybrid_search(
        query="What is the will to power?",
        filters={"author_slug": "friedrich-nietzsche"},
        top_k=5,
        semantic_weight=0.7,
        keyword_weight=0.3
    )

    # Access standardized response format (Sprint 11)
    print(f"\nHybrid search returned {results['metadata']['total_results']} results")
    print(f"Query time: {results['metadata']['query_time_ms']:.1f}ms\n")

    for result in results["results"]:
        # All scores normalized to 0.0-1.0 (comparable across methods)
        print(f"Score: {result['score']:.3f}")

        # Nested objects for clean structure
        print(f"Book: {result['book']['title']}")
        print(f"Author: {result['author']['name']}")
        print(f"Location: chunk {result['location']['chunk_index']}, "
              f"pages {result['location']['page_start']}-{result['location']['page_end']}")

        # Score breakdown (hybrid only)
        if result['search_metadata']:
            print(f"  Semantic score: {result['search_metadata']['semantic_score']}")
            print(f"  Keyword score: {result['search_metadata']['keyword_score']}")
            print(f"  Source type: {result['search_metadata']['source_type']}")

        print(f"Text: {result['text'][:200]}...\n")

    # Build context for field expert
    context = client.build_context(
        query="Explain Nietzsche's eternal recurrence",
        context_type="field_expert",
        filters={"author_slug": "friedrich-nietzsche"}
    )
    print(f"Context built with {context['metadata']['total_sources']} sources")
    print(f"Estimated tokens: {context['metadata']['context_tokens']}")
```

---

## Search Methods Explained (Sprints 8-11)

The Sophia API provides three search methods, all returning a **standardized response format** for easy integration:

### 1. Semantic Search (Sprint 8)

**Best for**: Conceptual queries, questions, paraphrased concepts

Uses Qdrant vector database with OpenAI text-embedding-3-small embeddings (1536 dimensions).

```python
results = client.semantic_search(
    query="How should we live?",
    filters={"author_slug": "plato"},
    top_k=10,
    score_threshold=0.0
)
```

**Features**:
- Understands meaning and context
- Cosine similarity scoring (0.0-1.0)
- Qdrant payload indexes for fast filtering
- ~600ms query time

### 2. Keyword Search (Sprint 9)

**Best for**: Exact term matching, specific phrases, author names

Uses OpenSearch with BM25 algorithm for full-text keyword matching.

```python
results = client.keyword_search(
    query="categorical imperative",
    filters={"author_slug": "immanuel-kant"},
    top_k=10
)
```

**Features**:
- Exact keyword matching
- BM25 scoring algorithm
- Field boosting (title^2.0, author^1.5)
- ~100-200ms query time

### 3. Hybrid Search (Sprint 10) - **RECOMMENDED**

**Best for**: Comprehensive results balancing meaning and exactness

Combines semantic and keyword search using Reciprocal Rank Fusion (RRF).

```python
results = client.hybrid_search(
    query="Einstein theory relativity",
    top_k=10,
    semantic_weight=0.7,   # Conceptual understanding
    keyword_weight=0.3     # Exact term matching
)
```

**Features**:
- Best of both worlds (semantic + keyword)
- RRF fusion algorithm (k=60)
- Configurable weights
- Score breakdown in response
- ~800ms query time

### Standardized Response Format (Sprint 11)

**All three search methods return identical structure:**

```python
{
    "results": [
        {
            "chunk_id": "7e8eec35-2b21-53a8-b62f-5437044e8bd0",
            "score": 0.8542,  # Normalized 0.0-1.0

            # Nested objects for clean structure
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
                "section_id": None,
                "section_title": None
            },

            "text": "The matched text content...",

            # Score breakdown (hybrid only)
            "search_metadata": {
                "semantic_score": 0.5029,
                "keyword_score": 15.2390,
                "semantic_rank": 1,
                "keyword_rank": 1,
                "source_type": "both"  # "semantic", "keyword", or "both"
            }
        }
    ],

    # Query metadata envelope
    "metadata": {
        "query": "theory of relativity",
        "search_type": "hybrid",
        "total_results": 10,
        "returned_results": 10,
        "query_time_ms": 842.5,
        "semantic_weight": 0.7,
        "keyword_weight": 0.3,
        "filters": None
    }
}
```

**Benefits**:
- ✅ Single parser for all search types
- ✅ Nested objects for clean structure
- ✅ Normalized scores (0.0-1.0, comparable across methods)
- ✅ Score breakdown for hybrid search
- ✅ Query metadata envelope

### Filtering with Qdrant Payload Indexes

Qdrant has been indexed with the following fields for fast filtering:

```python
# Filter by author
results = client.semantic_search(
    query="virtue ethics",
    filters={"author_slug": "aristotle"}
)

# Filter by field tags
results = client.hybrid_search(
    query="quantum mechanics",
    filters={"field_tags": ["Philosophy", "Science"]}
)

# Filter by book IDs
results = client.keyword_search(
    query="categorical imperative",
    filters={"book_ids": ["book-id-1", "book-id-2"]}
)
```

**Available Qdrant Payload Indexes**:
- `author` - Author name
- `content_id` - Book ID
- `domain` - Academic domain
- `discipline` - Academic discipline
- `subfield` - Academic subfield

---

## LangGraph Agent Integration

### Agent Tool Definition

Create tools for your LangGraph agents:

```python
from langchain.tools import tool
from sophia_client import SophiaAPIClient

# Initialize client once
sophia_client = SophiaAPIClient()

@tool
def search_library(query: str, author: str = None, search_type: str = "hybrid") -> str:
    """Search the Sophia philosophical library for relevant passages.

    Uses the standardized search response format from Sprints 8-11.

    Args:
        query: The search query
        author: Optional author slug to filter results (e.g., "friedrich-nietzsche")
        search_type: Type of search - "hybrid" (default), "semantic", or "keyword"

    Returns:
        Formatted search results with relevant passages and metadata
    """
    filters = {"author_slug": author} if author else None

    # Choose search method based on type
    if search_type == "semantic":
        results = sophia_client.semantic_search(
            query=query,
            filters=filters,
            top_k=5,
            score_threshold=0.0
        )
    elif search_type == "keyword":
        results = sophia_client.keyword_search(
            query=query,
            filters=filters,
            top_k=5
        )
    else:  # hybrid (recommended)
        results = sophia_client.hybrid_search(
            query=query,
            filters=filters,
            top_k=5,
            semantic_weight=0.7,
            keyword_weight=0.3
        )

    # Format results using standardized response structure
    formatted = []
    formatted.append(f"Search Query: {results['metadata']['query']}")
    formatted.append(f"Search Type: {results['metadata']['search_type']}")
    formatted.append(f"Results Found: {results['metadata']['total_results']}")
    formatted.append(f"Query Time: {results['metadata']['query_time_ms']:.1f}ms\n")

    for result in results["results"]:
        # Access nested objects (Sprint 11 standardized format)
        score = result['score']  # Normalized 0.0-1.0
        book_title = result['book']['title']
        author_name = result['author']['name']
        chunk_index = result['location']['chunk_index']
        pages = f"{result['location']['page_start']}-{result['location']['page_end']}"
        text = result['text']

        formatted.append(
            f"[Score: {score:.3f}] {book_title} by {author_name}\n"
            f"Location: Chunk {chunk_index}, Pages {pages}\n"
            f"{text[:500]}..."
        )

        # Include score breakdown for hybrid search
        if result.get('search_metadata') and results['metadata']['search_type'] == 'hybrid':
            sm = result['search_metadata']
            formatted.append(
                f"  (Semantic: {sm['semantic_score']:.3f}, "
                f"Keyword: {sm['keyword_score']:.2f}, "
                f"Source: {sm['source_type']})"
            )

    return "\n\n---\n\n".join(formatted)


@tool
def get_author_info(author_name: str) -> str:
    """Get information about a philosophical author.

    Args:
        author_name: Name of the author to lookup

    Returns:
        Author biography and works
    """
    # List authors and find match
    authors = sophia_client.list_authors(limit=100)

    # Simple name matching (improve with fuzzy matching if needed)
    author = next(
        (a for a in authors["authors"]
         if author_name.lower() in a["name"].lower()),
        None
    )

    if not author:
        return f"Author '{author_name}' not found in library."

    # Get detailed info
    details = sophia_client.get_author(author["id"])

    return f"""
**{details['name']}** ({details.get('birth_date', 'Unknown')} - {details.get('death_date', 'Unknown')})

{details.get('bio_short', 'No biography available.')}

**Notable Works:**
{', '.join(details.get('notable_works', []))}

**Works in Library:** {len(details['works'])}
"""


@tool
def build_expert_context(query: str, domain: str = None) -> str:
    """Build comprehensive context for answering philosophical questions.

    Args:
        query: The philosophical question or topic
        domain: Optional domain filter (e.g., "Philosophy", "Religious Studies")

    Returns:
        Rich context including relevant works, passages, and concepts
    """
    filters = None
    if domain:
        filters = {"field_tags": [domain]}

    context = sophia_client.build_context(
        query=query,
        context_type="field_expert",
        filters=filters,
        max_chunks=15
    )

    # Format context for agent
    formatted = []

    # Add catalog matches
    if context["context"]["catalog_matches"]:
        formatted.append("## Relevant Works:")
        for match in context["context"]["catalog_matches"][:3]:
            formatted.append(
                f"- {match['book']['title']} (relevance: {match['relevance_score']:.2f})\n"
                f"  {match['summary']}"
            )

    # Add key passages
    if context["context"]["content_chunks"]:
        formatted.append("\n## Key Passages:")
        for chunk in context["context"]["content_chunks"][:5]:
            formatted.append(
                f"- From {chunk['source']} (score: {chunk['score']:.2f})\n"
                f"  {chunk['text'][:400]}..."
            )

    # Add field context
    if context["context"]["field_context"]:
        fc = context["context"]["field_context"]
        formatted.append(
            f"\n## Field Context:\n"
            f"Domain: {fc['domain']}\n"
            f"Discipline: {fc['discipline']}\n"
            f"Key Concepts: {', '.join(fc.get('key_concepts', []))}"
        )

    return "\n\n".join(formatted)
```

### Agent Definition

```python
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

# Create tools list
tools = [search_library, get_author_info, build_expert_context]

# Create LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Create agent
agent = create_react_agent(
    llm,
    tools,
    state_modifier="""You are a philosophical research assistant with access to the Sophia Library,
a comprehensive collection of philosophical and religious texts.

When answering questions:
1. Use search_library to find relevant passages from specific works
2. Use get_author_info to provide context about philosophers
3. Use build_expert_context for comprehensive philosophical questions

Always cite your sources by mentioning the book titles and authors."""
)

# Example usage
response = agent.invoke({
    "messages": [("user", "What did Nietzsche think about the eternal recurrence?")]
})

print(response["messages"][-1].content)
```

---

## API Reference Summary

### Base URL
```
http://localhost:8888/api/v1
```

### Authentication
All endpoints (except `/health`) require authentication:
```
Authorization: Bearer YOUR_API_KEY
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (no auth) |
| GET | `/catalog/books` | List books with filters |
| GET | `/catalog/books/{id}` | Get book details |
| GET | `/catalog/books/{id}/sections` | Get book sections |
| GET | `/authors` | List authors |
| GET | `/authors/{id}` | Get author details |
| POST | `/search/semantic` | **Semantic search** (Qdrant + embeddings, Sprint 8) |
| POST | `/search/keyword` | **Keyword search** (OpenSearch + BM25, Sprint 9) |
| POST | `/search/hybrid` | **Hybrid search** (RRF fusion, Sprint 10) - RECOMMENDED |
| POST | `/context/build` | Build agent context |
| POST | `/auth/login` | Get JWT token |
| POST | `/auth/refresh` | Refresh token |

**Note**: All three search methods (`/search/semantic`, `/search/keyword`, `/search/hybrid`) return the **standardized response format** implemented in Sprint 11. This means:
- Identical response structure across all methods
- Normalized scores (0.0-1.0)
- Nested objects for book, author, location
- Query metadata envelope
- Single parser for all search types

### Rate Limits
- Default: 10,000 requests/day per API key
- Configurable per key
- Headers included: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Troubleshooting

### API Key Issues

**Problem:** 401 Unauthorized
```python
# Verify API key format
assert api_key.startswith("sk_"), "API key should start with 'sk_'"

# Check authentication header
headers = {"Authorization": f"Bearer {api_key}"}  # Note: "Bearer", not "Token"
```

### Connection Issues

**Problem:** Connection refused
```bash
# Check if API server is running
curl http://localhost:8888/api/v1/health

# Start the server
cd /path/to/sophia
python services/api/run_api_server.py
```

### Database Issues

**Problem:** Database errors
```bash
# Run migrations
cd /path/to/sophia
python services/api/migrations/run_migrations.py
```

### Qdrant Connection Issues

**Problem:** Qdrant not responding
```bash
# Check if Qdrant is running
curl http://localhost:6333/collections

# Check collection exists
curl http://localhost:6333/collections/sophia_library

# Verify documents indexed
python -c "
from services.qdrant.qdrant_service.client import QdrantService
qs = QdrantService()
info = qs.client.get_collection('sophia_library')
print(f'Vectors: {info.points_count}')
print(f'Indexes: {info.payload_schema}')
"
```

**Expected**: 25,552 vectors indexed with payload indexes for author, content_id, domain, discipline, subfield

### OpenSearch Connection Issues

**Problem:** OpenSearch not responding
```bash
# Check OpenSearch is running
python scripts/check_opensearch_connection.py

# Verify index exists
curl -X GET "localhost:9200/sophia_library/_count"

# Check cluster health
curl -X GET "localhost:9200/_cluster/health"

# View index mapping
curl -X GET "localhost:9200/sophia_library/_mapping"
```

**Expected**: 25,552 documents indexed with BM25 scoring enabled

---

## Next Steps

1. **Generate API Key**: Use the create_api_key.py script with `agent_service` role
2. **Test Connection**: Try the example client code with all three search methods
3. **Integrate Tools**: Add Sophia tools to your LangGraph agents
4. **Use Hybrid Search**: Recommended for most use cases (balances semantic + keyword)
5. **Apply Filters**: Use Qdrant payload indexes for fast author/domain filtering
6. **Monitor Usage**: Track API calls via the api_usage table
7. **Scale Up**: Adjust rate limits as needed for your use case

## Current System Status

**Search Implementation (Sprints 8-11): ✅ COMPLETED**

- ✅ **Sprint 8**: Semantic Search (Qdrant + text-embedding-3-small)
- ✅ **Sprint 9**: Keyword Search (OpenSearch + BM25)
- ✅ **Sprint 10**: Hybrid Search (RRF fusion)
- ✅ **Sprint 11**: Result Formatting (standardized responses)

**System Capabilities:**
- 25,552 documents indexed in both Qdrant and OpenSearch
- Qdrant payload indexes for fast filtering (author, content_id, domain, discipline, subfield)
- All three search methods operational with standardized API responses
- Query times: Semantic ~600ms, Keyword ~100-200ms, Hybrid ~800ms
- Production ready for LangGraph integration

## Support

- **API Documentation**: http://localhost:8888/api/v1/docs
- **Quick Start Guide**: [API_QUICK_START.md](./API_QUICK_START.md)
- **Search Result Format**: [SEARCH_RESULT_FORMAT_SUMMARY.md](./SEARCH_RESULT_FORMAT_SUMMARY.md)
- **Sprint Documentation**:
  - [Sprint 8: Semantic Search](./sprints/sprint-8-qdrant-semantic-search.md)
  - [Sprint 9: Keyword Search](./sprints/sprint-9-opensearch-keyword-search.md)
  - [Sprint 10: Hybrid Search](./sprints/sprint-10-hybrid-search-retriever.md)
  - [Sprint 11: Result Formatting](./sprints/sprint-11-search-result-formatting.md)
- **Source Code**: `/path/to/sophia/services/api/`
- **Issues**: Check logs in structured JSON format

---

## Example: Complete Agent Workflow with Standardized Format

```python
# 1. Initialize client
from sophia_client import SophiaAPIClient

client = SophiaAPIClient(
    api_url="http://localhost:8888/api/v1",
    api_key="sk_uIylNiQ0tniLMuxLn3g7o3F4zezxSDn5"
)

# 2. User asks a question
user_question = "What is Nietzsche's critique of traditional morality?"

# 3. Perform hybrid search (recommended - combines semantic + keyword)
search_results = client.hybrid_search(
    query=user_question,
    filters={"author_slug": "friedrich-nietzsche"},
    top_k=10,
    semantic_weight=0.7,
    keyword_weight=0.3
)

# 4. Parse standardized response format
print(f"Search Type: {search_results['metadata']['search_type']}")
print(f"Query Time: {search_results['metadata']['query_time_ms']:.1f}ms")
print(f"Results: {search_results['metadata']['total_results']}\n")

# 5. Extract relevant passages using nested objects
relevant_passages = []
for result in search_results['results'][:5]:
    passage = {
        'text': result['text'],
        'book': result['book']['title'],
        'author': result['author']['name'],
        'score': result['score'],  # Normalized 0.0-1.0
        'location': f"Chunk {result['location']['chunk_index']}, "
                    f"Pages {result['location']['page_start']}-{result['location']['page_end']}",
    }

    # For hybrid search, include score breakdown
    if result.get('search_metadata'):
        passage['semantic_score'] = result['search_metadata']['semantic_score']
        passage['keyword_score'] = result['search_metadata']['keyword_score']
        passage['source_type'] = result['search_metadata']['source_type']

    relevant_passages.append(passage)

# 6. Build agent prompt with search results
agent_prompt = f"""
Question: {user_question}

Relevant passages from the Sophia Library:

"""

for i, passage in enumerate(relevant_passages, 1):
    agent_prompt += f"""
Passage {i} (Score: {passage['score']:.3f}):
Source: {passage['book']} by {passage['author']}
Location: {passage['location']}
Text: {passage['text'][:400]}...

"""

agent_prompt += """
Based on these passages, provide a comprehensive answer to the question.
Cite specific books and page ranges in your response.
"""

# 7. Agent generates response using the enriched context
# Your LangGraph agent processes this and responds...

# Example: Using with LangGraph ReAct agent
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o", temperature=0)
agent = create_react_agent(llm, [search_library, get_author_info])

response = agent.invoke({
    "messages": [("user", user_question)]
})

print(response["messages"][-1].content)
```

---

This integration guide provides everything needed to connect your LangGraph agents to the Sophia API with the new search capabilities and standardized response format!
