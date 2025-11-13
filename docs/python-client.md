---
sidebar_position: 5
title: Python Client
---

# Python Client Library

A Python client for the Sophia Library API is included in the LangGraph Integration Guide.

See the [LangGraph Integration Guide](/docs/langgraph-integration#python-client-example) for the complete `SophiaAPIClient` implementation.

## Quick Example

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
    print(f"Text: {result['text'][:200]}...")
```

## Installation

The client is a single Python file you can copy into your project. No additional dependencies required beyond `requests`.

## Features

- All API endpoints supported
- Automatic authentication
- Error handling
- Type hints
- Retry logic

## Full Implementation

See the complete implementation in the [LangGraph Integration Guide](/docs/langgraph-integration).
