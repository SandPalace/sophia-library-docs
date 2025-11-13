// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Sophia Library API',
  tagline: 'AI-Powered Philosophical & Religious Text Search',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://sandpalace.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/sophia-library-docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'SandPalace', // Usually your GitHub org/user name.
  projectName: 'sophia-library-docs', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/YOUR_GITHUB_USERNAME/sophia/tree/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/sophia-social-card.jpg',
      navbar: {
        title: 'Sophia Library',
        logo: {
          alt: 'Sophia Library Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            to: '/docs/api-reference',
            label: 'API Reference',
            position: 'left',
          },
          {
            href: 'http://localhost:8888/api/v1/docs',
            label: 'Try It (Swagger)',
            position: 'right',
          },
          {
            href: 'https://github.com/SandPalace/sophia-library-docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Quick Start',
                to: '/docs/quick-start',
              },
              {
                label: 'API Reference',
                to: '/docs/api-reference',
              },
              {
                label: 'LangGraph Integration',
                to: '/docs/langgraph-integration',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Sprint Documentation',
                to: '/docs/category/sprints',
              },
              {
                label: 'OpenAPI Spec',
                href: 'http://localhost:8888/api/v1/openapi.json',
              },
              {
                label: 'Swagger UI',
                href: 'http://localhost:8888/api/v1/docs',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/SandPalace/sophia-library-docs',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Sophia Library. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'python', 'javascript', 'json'],
      },
      // Future: Add Algolia DocSearch for better search
      // algolia: {
      //   appId: 'YOUR_APP_ID',
      //   apiKey: 'YOUR_SEARCH_API_KEY',
      //   indexName: 'sophia-library',
      // },
      metadata: [
        {name: 'keywords', content: 'api, philosophy, religious texts, ai, search, semantic search, openai, qdrant, opensearch'},
        {name: 'description', content: 'Sophia Library API provides AI-powered search over 25,000+ philosophical and religious text chunks with semantic, keyword, and hybrid search capabilities.'},
      ],
    }),
};

export default config;
