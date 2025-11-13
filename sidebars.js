/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Main documentation sidebar
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'quick-start',
      label: 'Quick Start',
    },
    {
      type: 'doc',
      id: 'api-reference',
      label: 'API Reference',
    },
    {
      type: 'category',
      label: 'Integration Guides',
      items: [
        'langgraph-integration',
        'python-client',
      ],
    },
    {
      type: 'category',
      label: 'Search Methods',
      items: [
        'search/semantic-search',
        'search/keyword-search',
        'search/hybrid-search',
      ],
    },
    {
      type: 'category',
      label: 'Sprints',
      link: {
        type: 'generated-index',
        title: 'Sprint Documentation',
        description: 'Implementation sprints for the Sophia Library API',
      },
      items: [
        'sprints/sprint-8-qdrant-semantic-search',
        'sprints/sprint-9-opensearch-keyword-search',
        'sprints/sprint-10-hybrid-search-retriever',
        'sprints/sprint-11-search-result-formatting',
      ],
    },
  ],
};

export default sidebars;
