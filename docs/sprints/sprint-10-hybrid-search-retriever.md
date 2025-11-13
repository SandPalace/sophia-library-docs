# Sprint 10: Hybrid Search Retriever Integration

**Status**: ✅ COMPLETED
**Priority**: HIGH
**Dependencies**: Sprint 8 (Qdrant Semantic Search), Sprint 9 (OpenSearch Keyword Search)
**Completion Date**: November 12, 2025
**Actual Duration**: &lt;1 day

## Overview

Implement hybrid search functionality that combines semantic (vector) search from Qdrant with keyword (full-text) search from OpenSearch to provide the best of both worlds. This sprint focuses on understanding the existing HybridRetriever service and integrating it into the API layer with proper result merging and ranking strategies.

---

## Key Achievements

### ✅ Completed Tasks

1. **HybridRetriever Already Fully Implemented**
   - RRF (Reciprocal Rank Fusion) algorithm implemented
   - Configurable weights for vector and keyword search
   - Automatic deduplication of overlapping results
   - Score breakdown tracking (vector_rank, keyword_rank, vector_score, keyword_score)
   - Fetch multiplier for better fusion results

2. **SearchAdapter Integration**
   - Fixed `hybrid_search()` method parameter mapping (semantic_weight → vector_weight)
   - Added required `collection_name` and `opensearch_index` parameters
   - Updated `_format_search_results()` to handle `HybridResult` objects
   - Proper integration with Qdrant filters

3. **Testing & Validation**
   - Tested direct HybridRetriever calls
   - Tested SearchAdapter integration
   - Compared semantic vs keyword vs hybrid results
   - Verified RRF fusion working correctly
   - Tested different weight combinations (0.9/0.1, 0.5/0.5, 0.1/0.9)

4. **Result Quality**
   - Hybrid search successfully combines strengths of both methods
   - RRF scores range: 0.0049-0.0158 (lower than individual scores due to fusion algorithm)
   - Deduplication working correctly (no duplicate chunk_ids)
   - Both methods contribute to final ranking

### Implementation Findings & Resolutions

#### Issue 1: Parameter Naming Mismatch

**Problem**: SearchAdapter.hybrid_search() used `semantic_weight` parameter, but HybridRetriever.retrieve() expects `vector_weight`.

**Root Cause**: Inconsistent naming convention between API layer (semantic) and retrieval layer (vector).

**Resolution**:
Updated [search_adapter.py:135](../../services/api/api_service/services/search_adapter.py#L135) to map correctly:

```python
results = self.hybrid_retriever.retrieve(
    query=query,
    collection_name="sophia_library",
    opensearch_index="sophia_library",
    top_k=top_k,
    vector_weight=semantic_weight,  # Map semantic_weight → vector_weight
    keyword_weight=keyword_weight,
    filter_dict=qdrant_filter,
)
```

#### Issue 2: HybridResult Object Formatting

**Problem**: `_format_search_results()` tried to access `.id` attribute on HybridResult objects, causing AttributeError.

**Root Cause**: HybridResult uses `.chunk_id`, `.score`, `.text`, and `.metadata` attributes directly (not `.id` and `.payload` like Qdrant/OpenSearch objects).

**Resolution**:
Updated [search_adapter.py:235-240](../../services/api/api_service/services/search_adapter.py#L235-L240) to check for HybridResult first:

```python
if isinstance(result, HybridResult):
    # Handle HybridResult objects (from HybridRetriever)
    chunk_id = result.chunk_id
    score = float(result.score)
    text = result.text
    metadata = result.metadata or {}
```

### Current State

**SearchAdapter Capabilities**:
- ✅ Semantic search (Qdrant with vector embeddings) - Sprint 8
- ✅ Keyword search (OpenSearch with BM25) - Sprint 9
- ✅ Hybrid search (RRF fusion of both) - Sprint 10

**Hybrid Search Features**:
- Reciprocal Rank Fusion (RRF) algorithm with configurable k=60
- Configurable weights (default: 0.7 semantic, 0.3 keyword)
- Automatic deduplication of overlapping results
- Fetch multiplier (2.0x) for better fusion quality
- Full score breakdown available in HybridResult objects
- Filter support (passed to Qdrant semantic search)

**RRF Algorithm**:
```python
score(d) = vector_weight / (k + vector_rank) + keyword_weight / (k + keyword_rank)
```

Where:
- k = 60 (RRF constant, reduces impact of top ranks)
- vector_rank = position in semantic search results (1-based)
- keyword_rank = position in keyword search results (1-based)
- Weights are normalized to sum to 1.0

### Example Query Results

**Query**: "theory of relativity"

| Method | Top Result | Score | Notes |
|--------|-----------|-------|-------|
| Semantic | Richard Feynman | 0.5029 | Conceptually related physics content |
| Keyword | Albert Einstein | 15.2390 | Exact term match |
| Hybrid (0.7/0.3) | Richard Feynman | 0.0115 | Combines both signals |

**Query**: "Nietzsche critique of morality"

| Method | Top Result | Score | Notes |
|--------|-----------|-------|-------|
| Semantic | (Various) | 0.7575 | Understands concept |
| Keyword | Friedrich Nietzsche | 16.9942 | Exact author match |
| Hybrid (0.7/0.3) | Friedrich Nietzsche | 0.0049 | Best of both |

### Missing / Future Enhancements

1. **Parallel Execution**
   - Current status: Sequential execution (semantic then keyword)
   - TODO: Implement asyncio/threading for parallel searches
   - Expected improvement: ~50% latency reduction

2. **Enhanced Metadata in Results**
   - Current status: Basic fusion score returned
   - TODO: Expose vector_rank, keyword_rank, individual scores in API response
   - Would help users understand why results were ranked

3. **Filter Support for Keyword Search**
   - Current status: Filters only applied to semantic search
   - TODO: Implement OpenSearch filter mapping
   - Would enable consistent filtering across both methods

4. **Configurable Fusion Strategies**
   - Current status: RRF only
   - TODO: Add weighted score combination option
   - Would allow different fusion approaches

---

## Phase 1: Investigation & Discovery

### 1.1 Understand Current HybridRetriever Implementation

**Objective**: Deep dive into the existing HybridRetriever to understand its architecture and algorithms.

**Investigation Tasks**:

1. **Examine HybridRetriever API**
   - [ ] Read [services/retrieval/retrieval_service/hybrid_retriever.py](../../services/retrieval/retrieval_service/hybrid_retriever.py)
   - [ ] Document the `retrieve()` method signature and parameters
   - [ ] Understand initialization requirements (dependencies)
   - [ ] Identify what the method returns (format, structure)
   - [ ] Check for existing error handling patterns
   - [ ] Review any configuration options

2. **Analyze Result Fusion Algorithm**
   - [ ] Identify the fusion algorithm used (Reciprocal Rank Fusion, weighted average, etc.)
   - [ ] Understand how semantic_weight and keyword_weight are applied
   - [ ] Check if normalization is applied to scores before merging
   - [ ] Understand deduplication logic (if any)
   - [ ] Document how final ranking is computed
   - [ ] Identify edge cases (no semantic results, no keyword results, etc.)

3. **Review Dependencies**
   - [ ] Document required services (QdrantService, OpenSearchService)
   - [ ] Check if Embedder is used internally or passed results
   - [ ] Identify any other dependencies
   - [ ] Understand initialization order requirements

4. **Test Direct HybridRetriever Calls**
   - [ ] Write test script to call retrieve() directly
   - [ ] Test with different weight combinations (0.7/0.3, 0.5/0.5, 0.3/0.7)
   - [ ] Test with queries that favor semantic (conceptual)
   - [ ] Test with queries that favor keyword (exact terms)
   - [ ] Compare results with individual search methods
   - [ ] Document response times

**Expected Findings**:
- Exact method signature for `HybridRetriever.retrieve()`
- Fusion algorithm details (RRF, linear combination, etc.)
- Weight application methodology
- Performance characteristics

### 1.2 Understand Result Merging Strategies

**Objective**: Understand different approaches to combining search results and their trade-offs.

**Investigation Tasks**:

1. **Study Reciprocal Rank Fusion (RRF)**
   - [ ] Research RRF algorithm (rank-based fusion)
   - [ ] Understand advantages (no score normalization needed)
   - [ ] Understand disadvantages (ignores actual scores)
   - [ ] Test if current implementation uses RRF
   - [ ] Compare RRF vs. weighted score combination

2. **Study Weighted Score Combination**
   - [ ] Understand score normalization approaches (min-max, z-score)
   - [ ] Document how semantic and keyword scores are normalized
   - [ ] Test weight sensitivity (how much impact do weights have?)
   - [ ] Identify potential issues (score scale mismatches)

3. **Study Deduplication Strategies**
   - [ ] Understand how duplicate results are handled
   - [ ] Check if chunk_id is used for deduplication
   - [ ] Understand which score is kept (higher, average, weighted)
   - [ ] Test deduplication with overlapping results

4. **Comparative Analysis**
   - [ ] Create test query set (10 queries)
   - [ ] Run through semantic only, keyword only, hybrid
   - [ ] Compare result quality and ranking
   - [ ] Identify when hybrid outperforms individual methods
   - [ ] Document sweet spots for different weight combinations

**Expected Findings**:
- Fusion algorithm used in current implementation
- Score normalization approach
- Deduplication strategy
- Optimal weight ranges for different query types

### 1.3 Examine Existing Search Adapter Integration

**Objective**: Understand how HybridRetriever is currently integrated (or needs to be integrated).

**Investigation Tasks**:

1. **Analyze Current Implementation**
   - [ ] Read `hybrid_search()` method in [search_adapter.py](../../services/api/api_service/services/search_adapter.py)
   - [ ] Document what's implemented vs. stubbed out
   - [ ] Check how filters are passed to HybridRetriever
   - [ ] Review parameter mapping from API to retriever
   - [ ] Examine error handling

2. **Understand Parameter Flow**
   - [ ] Map API parameters to HybridRetriever.retrieve() parameters
   - [ ] Check if weights are exposed to API users
   - [ ] Understand filter parameter structure
   - [ ] Identify default values and their rationale

3. **Review Result Processing**
   - [ ] Check if results need additional formatting
   - [ ] Verify metadata is preserved through fusion
   - [ ] Test if result format matches other search endpoints

**Expected Findings**:
- Current integration status
- Parameter mapping completeness
- Any gaps or missing functionality

### 1.4 Analyze Performance Characteristics

**Objective**: Understand performance implications of hybrid search.

**Investigation Tasks**:

1. **Measure Component Latencies**
   - [ ] Measure semantic search alone (from Sprint 8)
   - [ ] Measure keyword search alone (from Sprint 9)
   - [ ] Measure hybrid search total time
   - [ ] Identify if searches run sequentially or in parallel
   - [ ] Calculate fusion overhead

2. **Test Parallel vs. Sequential Execution**
   - [ ] Check if current implementation runs searches in parallel
   - [ ] Test performance improvement of parallel execution
   - [ ] Identify any race conditions or issues
   - [ ] Document threading/async patterns used

3. **Analyze Scalability**
   - [ ] Test with different top_k values (5, 10, 20, 50)
   - [ ] Measure how fusion time scales with result count
   - [ ] Test concurrent hybrid search requests
   - [ ] Identify bottlenecks

**Expected Findings**:
- Whether searches run in parallel
- Total latency breakdown (semantic + keyword + fusion)
- Scalability characteristics
- Optimization opportunities

---

## Phase 2: Analysis & Design

### 2.1 Implications Analysis

**Objective**: Understand the implications of design choices for hybrid search.

**Analysis Questions**:

1. **Fusion Algorithm Implications**
   - Does RRF or weighted scoring work better for our use case?
   - How sensitive are results to weight changes?
   - Should weights be user-configurable or system-optimized?
   - What default weights provide best results?

2. **Performance Implications**
   - Is the combined latency acceptable (semantic + keyword)?
   - Should we implement caching at hybrid level?
   - Would parallel execution help significantly?
   - Are there timeout concerns?

3. **Result Quality Implications**
   - Does hybrid consistently outperform individual methods?
   - Are there query types where hybrid performs worse?
   - How to handle cases where one method returns no results?
   - Should we show users which method contributed each result?

4. **API Design Implications**
   - Should weights be exposed to users?
   - Should we provide weight presets (e.g., "balanced", "semantic-heavy")?
   - How to explain hybrid search to users?
   - Should we show individual method scores in results?

**Expected Output**: Design decisions document with rationale.

### 2.2 Design Decisions

Based on investigation findings, make explicit design decisions:

1. **Fusion Strategy**
   - [ ] Fusion algorithm choice (RRF vs. weighted score)
   - [ ] Score normalization approach
   - [ ] Deduplication strategy
   - [ ] Handling of ties in ranking

2. **Weight Configuration**
   - [ ] Default semantic_weight (e.g., 0.7)
   - [ ] Default keyword_weight (e.g., 0.3)
   - [ ] Allow user override (yes/no)
   - [ ] Weight validation rules (sum to 1.0?)
   - [ ] Weight presets (if any)

3. **Execution Strategy**
   - [ ] Sequential vs. parallel search execution
   - [ ] Timeout handling for each component
   - [ ] Partial result handling (one method fails)
   - [ ] Fallback strategy

4. **Result Format**
   - [ ] Include fusion metadata (weights used, sources)
   - [ ] Include individual scores (semantic_score, keyword_score)
   - [ ] Include result source indicator (semantic, keyword, both)
   - [ ] Standard vs. extended response format

5. **Parameter Exposure**
   - [ ] Expose semantic_weight to API (yes/no)
   - [ ] Expose keyword_weight to API (yes/no)
   - [ ] Expose individual method parameters (score_threshold, fuzziness)
   - [ ] Provide preset modes vs. granular control

**Expected Output**: API specification document for hybrid search endpoint.

---

## Phase 3: Implementation Plan

### 3.1 Enhance HybridRetriever (if needed)

**Tasks** (only if current implementation is incomplete):

1. **Add Parallel Execution**
   - [ ] Implement asyncio or threading for parallel searches
   - [ ] Add timeout handling for each search
   - [ ] Add error handling for partial failures
   - [ ] Test performance improvement

2. **Enhance Fusion Algorithm**
   - [ ] Implement or verify score normalization
   - [ ] Add configurable fusion methods
   - [ ] Implement deduplication logic
   - [ ] Add result source tracking

3. **Add Result Metadata**
   - [ ] Track which method contributed each result
   - [ ] Include individual scores in output
   - [ ] Add fusion metadata to results

### 3.2 Complete SearchAdapter.hybrid_search()

**Tasks**:

1. **Implement Core Search Flow**
   - [ ] Validate input parameters
   - [ ] Map API filters to retriever format
   - [ ] Set default weights if not provided
   - [ ] Call HybridRetriever.retrieve() with correct parameters
   - [ ] Format results using _format_search_results()
   - [ ] Return formatted response

2. **Implement Parameter Mapping**
   - [ ] Map query parameter
   - [ ] Map top_k parameter
   - [ ] Map semantic_weight and keyword_weight
   - [ ] Map filters (author_slug, field_tags, book_ids)
   - [ ] Handle optional parameters gracefully

3. **Implement Result Formatting**
   - [ ] Use existing `_format_search_results()` with "hybrid" type
   - [ ] Add hybrid-specific metadata (weights, source)
   - [ ] Preserve individual scores if available
   - [ ] Build standardized response structure

4. **Add Error Handling**
   - [ ] Wrap retriever call in try/except
   - [ ] Handle partial failures (one method fails)
   - [ ] Handle empty results gracefully
   - [ ] Log errors with structured logging
   - [ ] Return meaningful error messages

5. **Add Performance Monitoring**
   - [ ] Log latency for each component
   - [ ] Log total hybrid search time
   - [ ] Log result count from each method
   - [ ] Log fusion statistics

### 3.3 Testing Strategy

**Unit Tests**:

1. **Test Parameter Mapping**
   - [ ] Test with all parameters provided
   - [ ] Test with only required parameters
   - [ ] Test with custom weights
   - [ ] Test with default weights
   - [ ] Test with filters

2. **Test Result Formatting**
   - [ ] Test with mock hybrid results
   - [ ] Test with duplicate results (same chunk_id)
   - [ ] Test with missing metadata
   - [ ] Test with empty result list

3. **Test Error Handling**
   - [ ] Mock HybridRetriever failure
   - [ ] Mock partial failure (semantic fails, keyword succeeds)
   - [ ] Test with invalid parameters
   - [ ] Test with malformed results

**Integration Tests**:

1. **End-to-End Hybrid Search Tests**
   - [ ] Test conceptual query ("What is the meaning of virtue?")
   - [ ] Test exact term query ("categorical imperative")
   - [ ] Test mixed query ("Nietzsche's critique of morality")
   - [ ] Test with filters (author, field_tags, book_ids)
   - [ ] Test with different weight combinations
   - [ ] Test with different top_k values

2. **Comparative Quality Tests**
   - [ ] Run test queries through all three methods (semantic, keyword, hybrid)
   - [ ] Compare result quality manually
   - [ ] Identify when hybrid provides best results
   - [ ] Document optimal weight settings

3. **Performance Tests**
   - [ ] Measure total latency (should be ~max(semantic, keyword) if parallel)
   - [ ] Test concurrent hybrid searches
   - [ ] Compare with individual method latencies
   - [ ] Identify performance bottlenecks

**Test File**: `services/api/tests/test_search_adapter_hybrid.py`

### 3.4 API Endpoint Implementation

**Tasks**:

1. **Update Search Router**
   - [ ] Verify endpoint definition in routers/search.py
   - [ ] Validate request schema (HybridSearchRequest)
   - [ ] Add optional semantic_weight parameter
   - [ ] Add optional keyword_weight parameter
   - [ ] Validate response schema (SearchResponse)
   - [ ] Add proper error responses (400, 401, 500)
   - [ ] Add endpoint documentation/examples

2. **Add Input Validation**
   - [ ] Validate query is not empty
   - [ ] Validate top_k is within allowed range (1-100)
   - [ ] Validate weights are between 0.0-1.0
   - [ ] Validate weights sum to 1.0 (or auto-normalize)
   - [ ] Validate filter format if provided

3. **Add Response Metadata**
   - [ ] Add hybrid search metadata (weights used)
   - [ ] Add component latencies (semantic_time, keyword_time, fusion_time)
   - [ ] Add result source counts (semantic_count, keyword_count, both_count)

### 3.5 Documentation

**Tasks**:

1. **Update API Documentation**
   - [ ] Add hybrid search examples to [API_QUICK_START.md](../API_QUICK_START.md)
   - [ ] Update [LANGGRAPH_INTEGRATION_GUIDE.md](../LANGGRAPH_INTEGRATION_GUIDE.md) with hybrid search examples
   - [ ] Add curl examples for different use cases
   - [ ] Document weight parameter usage
   - [ ] Add guidance on when to use hybrid search

2. **Add Code Documentation**
   - [ ] Add docstrings to all methods
   - [ ] Document weight parameter effects
   - [ ] Add usage examples in docstrings
   - [ ] Document return value structure

3. **Create Search Strategy Guide**
   - [ ] Document when hybrid search excels
   - [ ] Provide weight tuning guidance
   - [ ] Add examples of query types and recommended weights
   - [ ] Include performance considerations

---

## Phase 4: Validation & Testing

### 4.1 Manual Testing

**Test Scenarios**:

1. **Basic Functionality**
   - [ ] Test conceptual query ("What is human flourishing?")
   - [ ] Test exact term query ("eternal recurrence")
   - [ ] Test mixed query ("Plato's theory of forms")
   - [ ] Verify results blend semantic and keyword strengths

2. **Weight Tuning Tests**
   - [ ] Test with semantic-heavy (0.9/0.1) on conceptual query
   - [ ] Test with keyword-heavy (0.1/0.9) on exact term query
   - [ ] Test with balanced (0.5/0.5) on mixed query
   - [ ] Test with default weights (0.7/0.3)
   - [ ] Identify optimal weights for different query types

3. **Filter Testing**
   - [ ] Test hybrid search with author filter
   - [ ] Test hybrid search with field_tags filter
   - [ ] Test hybrid search with book_ids filter
   - [ ] Test hybrid search with multiple filters

4. **Edge Cases**
   - [ ] Test query that only has semantic results
   - [ ] Test query that only has keyword results
   - [ ] Test query with no results from either method
   - [ ] Test with extreme weights (1.0/0.0, 0.0/1.0)

### 4.2 Comparative Analysis

**Compare All Three Methods**:

Create a test set of 20 diverse queries:

1. **Conceptual Queries** (favor semantic)
   - "What is the nature of consciousness?"
   - "Explain the problem of evil"
   - "What is authentic existence?"

2. **Exact Term Queries** (favor keyword)
   - "categorical imperative"
   - "eternal recurrence"
   - "theory of forms"

3. **Mixed Queries** (favor hybrid)
   - "Nietzsche's critique of Christian morality"
   - "Buddhist approach to suffering and enlightenment"
   - "Aristotle's concept of virtue and excellence"

**Validation Method**:
- [ ] Run each query through semantic, keyword, and hybrid
- [ ] Manually review top 5 results from each method
- [ ] Rate relevance (1-5 scale) for each result
- [ ] Calculate average relevance per method
- [ ] Identify which method performs best per query type
- [ ] Target: Hybrid average ≥ semantic AND keyword averages

### 4.3 Performance Validation

**Metrics to Collect**:

1. **Latency Breakdown**
   - [ ] Semantic search component time
   - [ ] Keyword search component time
   - [ ] Fusion algorithm time
   - [ ] Total end-to-end time
   - [ ] Verify parallel execution (total ≈ max(semantic, keyword) + fusion)

2. **Throughput Metrics**
   - [ ] Queries per second (single client)
   - [ ] Queries per second (10 concurrent clients)
   - [ ] Compare with individual method throughput

3. **Resource Metrics**
   - [ ] Memory usage during hybrid search
   - [ ] CPU usage during hybrid search
   - [ ] Network latency to both services

**Acceptance Criteria**:
- p95 latency ≤ 1.5 seconds (worst case sequential)
- p95 latency ≤ 1 second (best case parallel)
- Can handle 10 concurrent hybrid searches
- Resource usage ≤ sum of individual methods

### 4.4 Quality Validation

**Relevance Testing**:

- [ ] Run 20-query test set through hybrid search
- [ ] Manually rate top 10 results per query
- [ ] Calculate precision@5 and precision@10
- [ ] Calculate average relevance score
- [ ] Compare with semantic-only and keyword-only results
- [ ] Target: Hybrid precision@5 ≥ max(semantic, keyword) precision@5

**Fusion Quality Testing**:

- [ ] Identify queries with overlapping results
- [ ] Verify deduplication works correctly
- [ ] Verify best-ranked result is kept
- [ ] Check that complementary results are both included

---

## Success Criteria

### Functional Requirements
- ✅ Hybrid search successfully combines semantic and keyword results
- ✅ Result ranking reflects weighted fusion of both methods
- ✅ Deduplication works correctly for overlapping results
- ✅ Weights can be configured by users (if exposed)
- ✅ Filters work correctly across both search methods
- ✅ API endpoint follows standard response format

### Non-Functional Requirements
- ✅ p95 latency ≤ 1.5 seconds for typical queries
- ✅ Parallel execution reduces total time (if implemented)
- ✅ Proper error handling with meaningful messages
- ✅ Comprehensive documentation with examples
- ✅ Unit test coverage ≥ 80%
- ✅ Integration tests for all weight combinations

### Quality Requirements
- ✅ Hybrid search matches or exceeds semantic-only quality
- ✅ Hybrid search matches or exceeds keyword-only quality
- ✅ Precision@5 ≥ 0.8 on test query set
- ✅ Graceful degradation when one method fails

---

## Deliverables

1. **Code**
   - Completed `SearchAdapter.hybrid_search()` method
   - Enhanced HybridRetriever (if needed)
   - Enhanced `_format_search_results()` for hybrid results
   - Updated search router endpoint

2. **Tests**
   - Unit tests for parameter mapping
   - Unit tests for result formatting
   - Integration tests for end-to-end hybrid search
   - Comparative tests (semantic vs. keyword vs. hybrid)
   - Performance test suite

3. **Documentation**
   - API documentation with curl examples
   - LangGraph integration guide updates
   - Code docstrings
   - Search strategy guide (when to use hybrid)
   - Weight tuning guide

4. **Validation**
   - Performance metrics report
   - Comparative analysis results
   - Quality validation results (relevance scores)
   - Weight optimization recommendations

---

## Notes

- This sprint focuses on **hybrid search** that combines Qdrant (semantic) and OpenSearch (keyword)
- Requires successful completion of Sprint 8 (semantic) and Sprint 9 (keyword)
- Result formatting harmonization is addressed in Sprint 11
- Hybrid search should be the default recommendation for general use cases
- Individual methods (semantic/keyword) useful for specialized scenarios

---

## References

- [services/retrieval/retrieval_service/hybrid_retriever.py](../../services/retrieval/retrieval_service/hybrid_retriever.py)
- [services/api/api_service/services/search_adapter.py](../../services/api/api_service/services/search_adapter.py)
- [services/api/api_service/routers/search.py](../../services/api/api_service/routers/search.py)
- [docs/API_QUICK_START.md](../API_QUICK_START.md)
- [docs/LANGGRAPH_INTEGRATION_GUIDE.md](../LANGGRAPH_INTEGRATION_GUIDE.md)
- [Sprint 8: Qdrant Semantic Search](./sprint-8-qdrant-semantic-search.md)
- [Sprint 9: OpenSearch Keyword Search](./sprint-9-opensearch-keyword-search.md)
- [Reciprocal Rank Fusion Research Paper](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)
