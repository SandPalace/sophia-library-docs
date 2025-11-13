import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started →
          </Link>
          <Link
            className="button button--secondary button--lg margin-left--md"
            to="/docs/quick-start">
            Quick Start Guide
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>🔍 Semantic Search</h3>
              <p>
                AI-powered search using OpenAI embeddings and Qdrant vector database
                for conceptual understanding and meaning-based retrieval.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>📝 Keyword Search</h3>
              <p>
                Traditional full-text search with BM25 scoring via OpenSearch
                for exact term matching and fast lookups.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>🔄 Hybrid Search</h3>
              <p>
                Best of both worlds using Reciprocal Rank Fusion (RRF) to combine
                semantic and keyword results for optimal relevance.
              </p>
            </div>
          </div>
        </div>
        <div className="row margin-top--lg">
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>📚 Rich Catalog</h3>
              <p>
                Access 25,552 philosophical and religious text chunks from
                97 books by 1,067 authors.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>🤖 AI-Ready</h3>
              <p>
                Built for AI agents and LLMs with context building, structured responses,
                and LangGraph integration.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className="text--center padding-horiz--md">
              <h3>🔐 Secure</h3>
              <p>
                Role-based API key authentication with usage quotas and
                rate limiting for production use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="AI-Powered Philosophical & Religious Text Search API">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
