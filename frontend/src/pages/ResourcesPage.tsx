import { useState, useEffect } from 'react'
import {
  BookOpen,
  Code2,
  ExternalLink,
  Filter,
  Search,
  Star,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Terminal,
  Cpu,
} from 'lucide-react'
import api from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorAlert from '../components/ui/ErrorAlert'

// ---- Types ----
interface Resource {
  title: string
  url: string
  type: 'course' | 'doc' | 'article' | 'video' | 'book'
  provider: string
  level: 'beginner' | 'intermediate' | 'advanced'
  free: boolean
}

interface Project {
  title: string
  description: string
  problemStatement: string
  detailedDescription: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tech: string[]
  estimatedHours: number
  keyFeatures: string[]
  implementationSteps: string[]
  resumeBullet: string
}

interface SkillContent {
  resources: Resource[]
  projects: Project[]
}

// ---- Curated content library with detailed specifications ----
const SKILL_CONTENT: Record<string, SkillContent> = {
  python: {
    resources: [
      { title: 'Python.org Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'doc', provider: 'Python.org', level: 'beginner', free: true },
      { title: 'Automate the Boring Stuff with Python', url: 'https://automatetheboringstuff.com/', type: 'book', provider: 'Al Sweigart', level: 'beginner', free: true },
      { title: 'Python for Everybody – Coursera', url: 'https://www.coursera.org/specializations/python', type: 'course', provider: 'Coursera / UMich', level: 'beginner', free: false },
      { title: 'Real Python Tutorials', url: 'https://realpython.com/', type: 'article', provider: 'Real Python', level: 'intermediate', free: false },
      { title: 'Fluent Python', url: 'https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/', type: 'book', provider: "O'Reilly", level: 'advanced', free: false },
    ],
    projects: [
      {
        title: 'CLI To-Do & Task Manager Daemon',
        description: 'Build a keyboard-first terminal productivity tool with local file persistence and tag filtering.',
        problemStatement: 'Developers and engineers frequently switch contexts; traditional browser-based to-do apps introduce friction and slow down terminal workflows.',
        detailedDescription: 'A modular command-line task management utility engineered in pure Python. It provides subcommands for creating, listing, modifying, and archiving tasks with priority levels, deadlines, and tags. Utilizes transactional JSON file persistence with automatic atomic backups to guarantee zero data loss on unexpected terminal exits.',
        difficulty: 'beginner',
        tech: ['Python 3', 'argparse', 'JSON Persistence', 'ANSI Colors'],
        estimatedHours: 8,
        keyFeatures: [
          'Subcommand routing (add, list, done, delete, filter) via argparse',
          'Atomic transactional file writes preventing corruption',
          'Rich ANSI terminal styling and formatted ASCII tables',
          'Filtering and sorting by due date, urgency, and category tags',
        ],
        implementationSteps: [
          'Design Task entity model and schema with UUID and ISO timestamps',
          'Implement CLI argument parsing and validation engine',
          'Build persistence manager with atomic file writing routines',
          'Add colorized terminal output and interactive completion toggles',
        ],
        resumeBullet: 'Engineered a modular command-line task manager in Python with atomic JSON persistence, supporting tag filtering and sub-second CLI command routing.',
      },
      {
        title: 'Automated Job Market Web Intelligence Scraper',
        description: 'Scrape, deduplicate, and analyze real-world tech job postings into structured formats.',
        problemStatement: 'Job listings are distributed across disparate sites without uniform schemas, making market salary and skill trend analysis difficult to perform manually.',
        detailedDescription: 'An automated web intelligence pipeline that crawls engineering career listings, bypasses anti-scraping blocks through header management, parses unstructured DOM markup into standardized models, and exports deduplicated datasets into CSV, JSON, and SQLite database storage.',
        difficulty: 'intermediate',
        tech: ['Python', 'BeautifulSoup4', 'pandas', 'SQLite', 'Requests'],
        estimatedHours: 16,
        keyFeatures: [
          'Polite crawling with randomized delays and rotating user-agent headers',
          'Robust DOM extraction with fallback XPath and CSS selectors',
          'Data cleaning pipeline removing duplicates and malformed entries',
          'Automated data transformation into pandas DataFrames and SQLite tables',
        ],
        implementationSteps: [
          'Inspect target site DOM structures and identify pagination patterns',
          'Write resilient scraping functions with exponential backoff on HTTP 429',
          'Process scraped HTML strings into normalized dictionaries',
          'Load records into pandas DataFrames for statistical analysis and storage',
        ],
        resumeBullet: 'Built an automated data scraping pipeline using BeautifulSoup and pandas, processing and deduplicating 2,500+ records per crawl with zero rate-limit blocks.',
      },
      {
        title: 'Enterprise REST API with FastAPI & SQLAlchemy',
        description: 'Build a production-grade backend service with OAuth2 JWT auth, relational schemas, and migrations.',
        problemStatement: 'Modern software backends must support high-throughput concurrency, strict schema validation, secure role-based access, and maintainable database migrations.',
        detailedDescription: 'A production-ready microservice built on FastAPI, SQLAlchemy ORM, and Pydantic v2. Implements secure JWT token authentication, role-based authorization guards, relational database models with foreign keys, Alembic database migrations, and self-documenting Swagger OpenAPI endpoints.',
        difficulty: 'advanced',
        tech: ['FastAPI', 'Python 3', 'SQLAlchemy 2', 'Alembic', 'PostgreSQL', 'pytest'],
        estimatedHours: 32,
        keyFeatures: [
          'OAuth2 Password Bearer flow with salted bcrypt password hashing',
          'Relational database models with cascading deletes and composite indexes',
          'Strict Pydantic request/response validation schemas',
          'Automated database version control with Alembic migration scripts',
          'Comprehensive test suite with pytest and FastAPI TestClient',
        ],
        implementationSteps: [
          'Model relational database schema with SQLAlchemy 2 declarative base',
          'Configure Alembic migrations and establish database connectivity',
          'Implement JWT authentication dependencies and route guards',
          'Write CRUD endpoints with pagination, query filtering, and unit tests',
        ],
        resumeBullet: 'Architected a secure RESTful API in FastAPI and PostgreSQL with JWT auth and SQLAlchemy ORM, achieving sub-40ms response times and 95% test coverage.',
      },
    ],
  },
  javascript: {
    resources: [
      { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'doc', provider: 'MDN', level: 'beginner', free: true },
      { title: 'The Odin Project – JavaScript Path', url: 'https://www.theodinproject.com/paths/full-stack-javascript', type: 'course', provider: 'The Odin Project', level: 'beginner', free: true },
      { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'doc', provider: 'javascript.info', level: 'intermediate', free: true },
      { title: "You Don't Know JS (Series)", url: 'https://github.com/getify/You-Dont-Know-JS', type: 'book', provider: 'Kyle Simpson', level: 'advanced', free: true },
    ],
    projects: [
      {
        title: 'Interactive Weather Radar & Forecast SPA',
        description: 'Fetch and display real-time weather using OpenWeatherMap API with client-side caching.',
        problemStatement: 'Users need instant meteorological forecasts with zero layout shifts and minimal network latency.',
        detailedDescription: 'A lightweight Single-Page Application leveraging modern ES6+ JavaScript. Features debounced location search, geolocation auto-detection, dynamic SVG weather illustration binding, and localStorage caching to eliminate redundant external API requests.',
        difficulty: 'beginner',
        tech: ['JavaScript ES6+', 'Fetch API', 'CSS Grid', 'LocalStorage'],
        estimatedHours: 10,
        keyFeatures: [
          'Debounced location autocomplete preventing API rate-limit overage',
          'Client-side cache layer storing 30-minute weather snapshots',
          'Metric and imperial temperature units toggle with instant recalculation',
          'Graceful error boundaries for offline states or invalid query tokens',
        ],
        implementationSteps: [
          'Configure OpenWeatherMap API credentials and async request wrapper',
          'Implement debounced search input with loading indicator states',
          'Render 5-day forecast cards dynamically using DOM manipulation',
          'Add localStorage caching to serve repeat queries instantly from disk',
        ],
        resumeBullet: 'Developed an asynchronous weather forecasting SPA using ES6+ and Fetch API, cutting external API requests by 45% via custom localStorage caching.',
      },
      {
        title: 'Drag-and-Drop Kanban Sprint Board',
        description: 'Interactive sprint board leveraging the native HTML5 Drag and Drop API with state persistence.',
        problemStatement: 'Agile development teams require intuitive visual task coordination without the baggage of heavy third-party UI libraries.',
        detailedDescription: 'A zero-dependency Kanban task board created with native HTML5 Drag and Drop events. Features multi-column organization (Backlog, Doing, Review, Done), inline card editing, custom modal dialogs, and persistent board state in the browser.',
        difficulty: 'intermediate',
        tech: ['JavaScript ES6+', 'HTML5 Drag & Drop API', 'CSS Flexbox', 'Web Storage'],
        estimatedHours: 20,
        keyFeatures: [
          'Hardware-accelerated 60fps drag-and-drop mechanics with visual drop targets',
          'Inline editing of task titles, descriptions, and tag badges',
          'Column reordering and automated card count recalculations',
          'Complete zero-dependency architecture for maximum performance',
        ],
        implementationSteps: [
          'Design JSON board and task schema with unique identifiers',
          'Bind dragstart, dragover, dragleave, and drop event handlers',
          'Implement card creation modal dialog and keyboard escape handling',
          'Synchronize state mutations to browser localStorage',
        ],
        resumeBullet: 'Engineered a zero-dependency Kanban board using native HTML5 Drag and Drop API, delivering smooth 60fps card transitions and persistent browser storage.',
      },
      {
        title: 'Full-Duplex Real-Time Collaboration Chat',
        description: 'Multi-room real-time messaging application powered by Node.js, Express, and Socket.io.',
        problemStatement: 'Modern distributed teams require instantaneous bi-directional communication channels with low overhead and room isolation.',
        detailedDescription: 'A real-time messaging system built on Node.js and Socket.io. Features ephemeral room creation, active user presence tracking, typing indicators, sanitize input protection against XSS vulnerabilities, and reconnection handling on network dropouts.',
        difficulty: 'advanced',
        tech: ['Node.js', 'Socket.io', 'Express', 'WebSockets', 'Tailwind CSS'],
        estimatedHours: 30,
        keyFeatures: [
          'WebSocket bi-directional event emission with sub-100ms latency',
          'Room-based isolation for multi-channel team conversations',
          'Live typing indicators and active participant count broadcasts',
          'Sanitized message payloads protecting against malicious XSS injections',
        ],
        implementationSteps: [
          'Set up Express HTTP server and attach Socket.io WebSocket instance',
          'Implement room join/leave event logic and socket room subscriptions',
          'Handle live message broadcasting and client-side DOM rendering',
          'Add audio notification cues and automatic scroll-to-bottom mechanics',
        ],
        resumeBullet: 'Architected a full-duplex real-time chat application with Node.js and Socket.io, supporting isolated rooms and live presence broadcasts with sub-100ms latency.',
      },
    ],
  },
  react: {
    resources: [
      { title: 'React Official Docs', url: 'https://react.dev/', type: 'doc', provider: 'React', level: 'beginner', free: true },
      { title: 'Full Stack Open', url: 'https://fullstackopen.com/', type: 'course', provider: 'University of Helsinki', level: 'intermediate', free: true },
      { title: 'Epic React by Kent C. Dodds', url: 'https://epicreact.dev/', type: 'course', provider: 'Kent C. Dodds', level: 'advanced', free: false },
    ],
    projects: [
      {
        title: 'Movie Discovery Portal with Custom Hooks',
        description: 'Modern React application integrating TMDB API with search debouncing and watchlist persistence.',
        problemStatement: 'Movie lovers encounter slow, laggy search experiences and loss of saved preferences across sessions.',
        detailedDescription: 'A sleek film discovery portal built with React 19 and Vite. Utilizes custom hooks (`useDebounce`, `useLocalStorage`), dynamic route parameters (`/movie/:id`), skeleton placeholder loading states, and responsive media cards with TMDB poster integrations.',
        difficulty: 'beginner',
        tech: ['React 19', 'Vite', 'Tailwind CSS', 'TMDB API', 'React Router'],
        estimatedHours: 12,
        keyFeatures: [
          'Custom useDebounce hook preventing redundant API traffic during typing',
          'Skeleton placeholder loaders preventing Content Layout Shifts (CLS)',
          'Global watchlist state persisted to browser storage',
          'Detailed modal overlay with trailer embeds and cast information',
        ],
        implementationSteps: [
          'Set up TMDB API service layer with Axios interceptors',
          'Build reusable MovieCard, Badge, and SkeletonLoader components',
          'Implement custom hooks for debouncing search and storing watchlists',
          'Add React Router routes for homepage and detailed movie views',
        ],
        resumeBullet: 'Developed a React film discovery application with custom hooks for search debouncing and local storage, eliminating layout shift and unnecessary API calls.',
      },
      {
        title: 'Full-Featured E-Commerce Storefront',
        description: 'Product catalogue, category filter matrix, shopping cart state, and mock checkout flow.',
        problemStatement: 'E-commerce web apps demand complex global state synchronization across cart drawers, discount coupons, and checkout forms.',
        detailedDescription: 'A production-grade e-commerce application featuring category filtering, price range sliders, a persistent sliding cart drawer managed via Context API and `useReducer`, and a multi-step checkout wizard with form validation and mock payment processing.',
        difficulty: 'intermediate',
        tech: ['React', 'Context API', 'useReducer', 'Tailwind CSS', 'Lucide React'],
        estimatedHours: 30,
        keyFeatures: [
          'Predictable global cart state management with useReducer action dispatchers',
          'Multi-attribute product filtering (category, price slider, in-stock only)',
          'Sliding slide-over cart drawer with animated item quantity counters',
          'Multi-step checkout wizard validating shipping, billing, and mock credit card data',
        ],
        implementationSteps: [
          'Construct product catalogue with search and multifaceted filter controls',
          'Implement CartContext with ADD_ITEM, REMOVE_ITEM, and CLEAR action reducers',
          'Build animated sliding drawer with item quantity recalculation',
          'Create multi-step checkout wizard with input validation and receipt modal',
        ],
        resumeBullet: 'Built a responsive React e-commerce application using Context API and useReducer, implementing multifaceted filtering and a multi-step checkout wizard.',
      },
      {
        title: 'GitHub Issue Tracker & Sprint Management Clone',
        description: 'Full CRUD issue tracker with TanStack React Query, markdown preview, and optimistic updates.',
        problemStatement: 'Software teams face high perceived latency and outdated data when managing bug reports on traditional web apps.',
        detailedDescription: 'An enterprise issue tracking system built with React, TypeScript, TanStack Query (React Query), and Tailwind CSS. Implements full CRUD on tickets, live Markdown preview with syntax highlighting, label filtering, optimistic UI mutations for instant feedback, and cached background data revalidation.',
        difficulty: 'advanced',
        tech: ['React', 'TypeScript', 'TanStack Query', 'Tailwind CSS', 'React Markdown'],
        estimatedHours: 50,
        keyFeatures: [
          'Strict TypeScript type definitions for issues, assignees, and label models',
          'TanStack Query caching, background revalidation, and garbage collection',
          'Optimistic UI mutations providing instant UI updates before server confirmation',
          'Live Markdown editor with split-screen preview and code syntax formatting',
        ],
        implementationSteps: [
          'Define strict TypeScript domain interfaces for issues, comments, and milestones',
          'Configure TanStack Query client with staleTime and cacheTime parameters',
          'Build Markdown editor with live preview tab and tag selection pills',
          'Implement optimistic updates for issue creation, status toggle, and deletion',
        ],
        resumeBullet: 'Architected an issue management system in React and TypeScript using TanStack Query, achieving near-zero perceived latency through optimistic UI mutations.',
      },
    ],
  },
  sql: {
    resources: [
      { title: 'SQLZoo', url: 'https://sqlzoo.net/', type: 'course', provider: 'SQLZoo', level: 'beginner', free: true },
      { title: 'Mode Analytics SQL Tutorial', url: 'https://mode.com/sql-tutorial/', type: 'article', provider: 'Mode', level: 'intermediate', free: true },
      { title: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com/', type: 'doc', provider: 'Markus Winand', level: 'advanced', free: true },
    ],
    projects: [
      {
        title: 'Normalized 3NF University Library Database',
        description: 'Design and query a relational book lending schema with foreign keys, checks, and loans.',
        problemStatement: 'Libraries face data anomalies, orphan records, and lost loan records without strict schema normalization.',
        detailedDescription: 'A fully normalized Third Normal Form (3NF) relational database design. Models Books, Authors, Borrowers, Loans, and Fines with primary keys, foreign key constraints, cascading rules, and check constraints to guarantee relational integrity.',
        difficulty: 'beginner',
        tech: ['SQL', 'PostgreSQL', 'Relational Schema Design', '3NF Normalization'],
        estimatedHours: 8,
        keyFeatures: [
          'Complete 3NF schema preventing insertion, update, and deletion anomalies',
          'Check constraints ensuring loan dates are valid and fines are non-negative',
          'Custom SQL views aggregating active overdue loans and unpaid balances',
          'Parameterized stored queries for checking book availability by title/ISBN',
        ],
        implementationSteps: [
          'Draft Entity-Relationship Diagram (ERD) defining 1:N and N:M relationships',
          'Write DDL SQL script with primary keys, foreign keys, and check constraints',
          'Populate database with synthetic sample data across all tables',
          'Author multi-table JOIN queries and views for library front-desk reporting',
        ],
        resumeBullet: 'Designed a 3NF normalized relational schema in PostgreSQL with foreign key constraints, check rules, and automated views for overdue loan tracking.',
      },
      {
        title: 'SaaS Sales & Cohort Retention Analytics Suite',
        description: 'Write complex analytical SQL queries using Window Functions and CTEs to power revenue dashboards.',
        problemStatement: 'SaaS executives require deep visibility into Monthly Recurring Revenue (MRR), churn rates, and customer lifetime value (LTV) from raw transaction records.',
        detailedDescription: 'An analytical SQL repository querying high-volume transactional data. Leverages advanced SQL features including Window Functions (`ROW_NUMBER`, `LAG`, `LEAD`, `DENSE_RANK`), Common Table Expressions (CTEs), and aggregation rollups to compute cohort retention matrices and Month-over-Month (MoM) revenue growth.',
        difficulty: 'intermediate',
        tech: ['PostgreSQL', 'Window Functions', 'CTEs', 'Analytical SQL'],
        estimatedHours: 16,
        keyFeatures: [
          'Multi-stage Common Table Expressions (CTEs) for clean query decomposition',
          'Window functions computing running totals and month-over-month growth',
          'Cohort analysis grouping customers by signup month and measuring retention',
          'Customer Lifetime Value (LTV) calculation based on historical purchase trends',
        ],
        implementationSteps: [
          'Import raw transaction datasets with dates, customer IDs, and amounts',
          'Author CTEs isolating customer first-purchase timestamps for cohort assignment',
          'Compute 30-day rolling revenue averages using window partition functions',
          'Construct materialized views for high-speed dashboard analytics',
        ],
        resumeBullet: 'Authored complex PostgreSQL analytics queries using Window Functions and CTEs, generating automated cohort retention matrices and MoM revenue reports.',
      },
      {
        title: 'Million-Row SQL Query Optimization Challenge',
        description: 'Profile and optimize slow-running queries using EXPLAIN ANALYZE, composite indexes, and plans.',
        problemStatement: 'Large-scale databases suffer from crippling latency when executing unindexed sequential scans across tables with millions of rows.',
        detailedDescription: 'A database performance tuning laboratory profiling slow queries on a synthetic 1,000,000+ row dataset. Uses `EXPLAIN (ANALYZE, BUFFERS)` to diagnose table sequential scans, temporary disk spillage, and inefficient nested loop joins, applying strategic B-Tree and GIN indexes to achieve over 90% query time reductions.',
        difficulty: 'advanced',
        tech: ['PostgreSQL', 'EXPLAIN ANALYZE', 'B-Tree Indexing', 'Database Tuning'],
        estimatedHours: 20,
        keyFeatures: [
          'Execution plan dissection identifying sequential scans and high-cost nodes',
          'Composite multi-column indexing tailored to common WHERE and ORDER BY clauses',
          'Partial indexes reducing index storage footprint by indexing only active rows',
          'Query refactoring replacing correlated subqueries with efficient JOIN operations',
        ],
        implementationSteps: [
          'Generate synthetic multi-million row table with skewed distributions',
          'Benchmark baseline execution times of unindexed filter and join queries',
          'Inspect execution plans using EXPLAIN (ANALYZE, BUFFERS)',
          'Implement composite indexes and document 10x-50x latency improvements',
        ],
        resumeBullet: 'Optimized complex SQL queries on 1M+ row datasets using EXPLAIN ANALYZE and composite B-Tree indexes, reducing query execution latency by 92%.',
      },
    ],
  },
  machine_learning: {
    resources: [
      { title: 'ML Course – Andrew Ng', url: 'https://www.coursera.org/specializations/machine-learning-introduction', type: 'course', provider: 'Coursera / Stanford', level: 'beginner', free: false },
      { title: 'fast.ai – Practical Deep Learning', url: 'https://course.fast.ai/', type: 'course', provider: 'fast.ai', level: 'intermediate', free: true },
      { title: 'Scikit-learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html', type: 'doc', provider: 'scikit-learn', level: 'intermediate', free: true },
      { title: 'Hands-On Machine Learning (Géron)', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/', type: 'book', provider: "O'Reilly", level: 'advanced', free: false },
    ],
    projects: [
      {
        title: 'End-to-End Passenger Survival Classifier',
        description: 'Classic ML classification with feature engineering, scikit-learn pipelines, and evaluation metrics.',
        problemStatement: 'Raw tabular datasets contain missing values, non-numeric strings, and skewed distributions that cause algorithms to underperform without preprocessing.',
        detailedDescription: 'An end-to-end binary classification pipeline developed using Python and scikit-learn. Implements missing data imputation, categorical one-hot encoding, feature scaling, and trains multiple classification algorithms (Logistic Regression, Random Forest, XGBoost) with k-fold cross-validation and ROC-AUC curve analysis.',
        difficulty: 'beginner',
        tech: ['Python', 'scikit-learn', 'pandas', 'matplotlib', 'seaborn'],
        estimatedHours: 12,
        keyFeatures: [
          'Scikit-learn Pipeline architecture preventing data leakage during training',
          'Feature engineering extracting titles from names and family size features',
          'Hyperparameter tuning via GridSearchCV with 5-fold cross-validation',
          'Comprehensive evaluation using Confusion Matrix, F1-Score, and ROC-AUC',
        ],
        implementationSteps: [
          'Perform Exploratory Data Analysis (EDA) and visualize correlation matrices',
          'Build ColumnTransformer preprocessing pipelines for numerical and categorical data',
          'Train baseline models and execute hyperparameter grid search',
          'Evaluate model generalizability on holdout test datasets',
        ],
        resumeBullet: 'Built an end-to-end classification pipeline with scikit-learn and Random Forest, applying feature engineering to achieve 84% accuracy with zero data leakage.',
      },
      {
        title: 'Convolutional Neural Network Image Classifier & API',
        description: 'Train a deep learning vision model with transfer learning and expose it via a FastAPI inference API.',
        problemStatement: 'Building computer vision models from scratch requires millions of images and compute hours that most individual developers lack.',
        detailedDescription: 'A deep learning computer vision service utilizing TensorFlow/Keras and transfer learning (MobileNetV2). Implements image data augmentation (rotations, flips, zoom), fine-tunes pretrained convolutional base layers, and wraps the resulting model into a lightweight FastAPI endpoint accepting image uploads and returning predicted classes with confidence percentages.',
        difficulty: 'intermediate',
        tech: ['TensorFlow', 'Keras', 'MobileNetV2', 'FastAPI', 'Pillow'],
        estimatedHours: 24,
        keyFeatures: [
          'Transfer learning leveraging pretrained weights on ImageNet',
          'Data augmentation pipeline preventing model overfitting on small datasets',
          'Early stopping and learning rate reduction callbacks during training',
          'Production REST API endpoint performing real-time inference in <80ms',
        ],
        implementationSteps: [
          'Collect and organize custom image dataset into train/validation splits',
          'Construct transfer learning architecture with frozen convolutional layers',
          'Train dense classification head with Adam optimizer and categorical crossentropy',
          'Expose trained model through a FastAPI endpoint accepting multipart image files',
        ],
        resumeBullet: 'Trained a computer vision classifier using MobileNetV2 and TensorFlow, deploying the model via a FastAPI endpoint for real-time inference with 92% top-1 accuracy.',
      },
      {
        title: 'Collaborative Filtering Recommendation Engine',
        description: 'Build a matrix factorization recommender system utilizing Singular Value Decomposition (SVD).',
        problemStatement: 'E-commerce and streaming services struggle with recommendation accuracy, leading to lower engagement and customer retention.',
        detailedDescription: 'A personalized recommendation engine built using matrix factorization techniques. Constructs sparse user-item interaction matrices and applies Singular Value Decomposition (SVD) along with cosine similarity to predict user ratings for unseen items and recommend personalized top-N suggestions.',
        difficulty: 'advanced',
        tech: ['Python', 'Surprise', 'Matrix Factorization', 'NumPy', 'SciPy'],
        estimatedHours: 40,
        keyFeatures: [
          'Sparse matrix representations handling millions of user-item ratings efficiently',
          'SVD algorithm decomposing user preferences into latent feature embeddings',
          'Cold-start handling heuristic falling back to popular items for new users',
          'Cross-validated Root Mean Squared Error (RMSE) performance benchmarking',
        ],
        implementationSteps: [
          'Preprocess rating datasets and construct sparse interaction matrices',
          'Implement Singular Value Decomposition (SVD) algorithm with regularization',
          'Tune latent factors, learning rate, and epochs using cross-validation',
          'Build recommendation query function returning top-10 personalized items',
        ],
        resumeBullet: 'Engineered a collaborative filtering recommender using Singular Value Decomposition (SVD), achieving an RMSE of 0.86 across 100k+ user interactions.',
      },
    ],
  },
  data_analysis: {
    resources: [
      { title: 'Kaggle Learn – Pandas', url: 'https://www.kaggle.com/learn/pandas', type: 'course', provider: 'Kaggle', level: 'beginner', free: true },
      { title: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/', type: 'doc', provider: 'pandas', level: 'intermediate', free: true },
      { title: 'Python for Data Analysis', url: 'https://wesmckinney.com/book/', type: 'book', provider: "O'Reilly", level: 'advanced', free: false },
    ],
    projects: [
      {
        title: 'Public Health Epidemiological Data Analysis',
        description: 'Clean, analyze, and visualize global pandemic trends using pandas and Matplotlib.',
        problemStatement: 'Epidemiological datasets from international agencies often feature disparate date formats, missing reporting periods, and noisy cumulative figures.',
        detailedDescription: 'A data analysis project in Python inspecting public health datasets. Performs time-series data cleaning, handles missing values, computes rolling 7-day averages to smooth weekend reporting lags, and produces publication-quality charts examining global outbreak trajectories.',
        difficulty: 'beginner',
        tech: ['Python', 'pandas', 'Matplotlib', 'Data Cleaning'],
        estimatedHours: 10,
        keyFeatures: [
          'Time-series date parsing and index alignment across 50+ countries',
          'Rolling window calculations smoothing stochastic reporting variations',
          'Custom Matplotlib styling with clear typography, axes, and legends',
          'Automated data transformation script producing CSV summaries',
        ],
        implementationSteps: [
          'Ingest raw CSV records from public health repositories',
          'Normalize column names and convert date strings into datetime objects',
          'Compute rolling 7-day metrics using pandas rolling window functions',
          'Generate comparison line charts and bar charts highlighting country trends',
        ],
        resumeBullet: 'Conducted exploratory time-series analysis on global public health data in pandas, engineering 7-day rolling metrics and publication-ready visualizations.',
      },
      {
        title: 'Interactive Financial Asset Portfolio Analysis',
        description: 'Analyze historical equity price data, compute volatility metrics, and generate Plotly charts.',
        problemStatement: 'Investors need to understand asset correlations and risk-adjusted returns rather than just looking at isolated price charts.',
        detailedDescription: 'A financial exploratory analysis application built with Python and Plotly. Pulls historical ticker prices, calculates daily percentage returns, volatility standard deviations, Sharpe ratios, and builds interactive heatmaps showing asset correlation across varying economic periods.',
        difficulty: 'intermediate',
        tech: ['Python', 'pandas', 'Plotly', 'yfinance', 'NumPy'],
        estimatedHours: 16,
        keyFeatures: [
          'Automated financial data ingestion via yfinance API',
          'Computation of daily logarithmic returns, volatility, and Sharpe ratios',
          'Interactive Plotly correlation heatmaps with hover data inspections',
          'Cumulative return comparison charts benchmarked against index baselines',
        ],
        implementationSteps: [
          'Fetch historical equity price records for target stock portfolios',
          'Calculate daily returns and covariance matrices using NumPy and pandas',
          'Compute annualized volatility and risk-adjusted Sharpe ratios',
          'Create interactive HTML visual dashboard using Plotly charts',
        ],
        resumeBullet: 'Developed an interactive portfolio risk analyzer in Python and Plotly, calculating Sharpe ratios and correlation heatmaps across historical asset datasets.',
      },
      {
        title: 'E-Commerce RFM Customer Segmentation Engine',
        description: 'Cluster customer cohorts using Recency, Frequency, Monetary (RFM) modeling and K-means.',
        problemStatement: 'Marketing teams waste budget on one-size-fits-all campaigns when customer spending patterns differ wildly.',
        detailedDescription: 'A machine learning customer analytics pipeline. Preprocesses transactional purchase logs into Recency, Frequency, and Monetary (RFM) metrics, applies log transformations to handle skewness, determines optimal clusters with the Elbow Method, and runs K-means clustering to segment customers into actionable marketing groups (champions, loyal, at-risk, churned).',
        difficulty: 'advanced',
        tech: ['Python', 'pandas', 'scikit-learn', 'K-means', 'Seaborn'],
        estimatedHours: 25,
        keyFeatures: [
          'Feature engineering calculating Recency, Frequency, and Monetary values',
          'Log transformations and StandardScaler normalization for algorithm stability',
          'Elbow method and Silhouette analysis identifying optimal k clusters',
          'Visual 2D/3D PCA cluster scatter plots and marketing persona summaries',
        ],
        implementationSteps: [
          'Aggregate raw purchase orders by CustomerID to extract RFM attributes',
          'Normalize skewed distributions using PowerTransformer / Log transforms',
          'Fit K-means clustering algorithm across cluster ranges k=2 to k=8',
          'Assign behavioral segment tags and visualize cluster profiles with Seaborn',
        ],
        resumeBullet: 'Segmented 50k+ e-commerce customers using RFM modeling and K-means clustering in scikit-learn, identifying high-churn risk cohorts to optimize retention campaigns.',
      },
    ],
  },
  git: {
    resources: [
      { title: 'Pro Git (Free Book)', url: 'https://git-scm.com/book/en/v2', type: 'book', provider: 'git-scm.com', level: 'beginner', free: true },
      { title: 'Learn Git Branching (Interactive)', url: 'https://learngitbranching.js.org/', type: 'course', provider: 'learngitbranching.js.org', level: 'beginner', free: true },
      { title: 'GitHub Docs – Getting Started', url: 'https://docs.github.com/en/get-started', type: 'doc', provider: 'GitHub', level: 'intermediate', free: true },
    ],
    projects: [
      {
        title: 'Open Source Repository Contribution',
        description: 'Find a beginner-friendly open-source project, identify an issue, and submit a pull request.',
        problemStatement: 'New engineers struggle with standard open-source collaboration workflows, pull request etiquette, and code reviews.',
        detailedDescription: 'A real-world collaboration project guiding students through contributing to open-source software. Covers forking repositories, configuring upstream remotes, creating focused feature branches, following contribution guidelines, resolving merge conflicts, and writing clean pull request descriptions.',
        difficulty: 'beginner',
        tech: ['Git', 'GitHub', 'Markdown', 'CLI'],
        estimatedHours: 6,
        keyFeatures: [
          'Fork and upstream synchronization remote management',
          'Conventional commit message formatting adhering to repository standards',
          'Interactive rebase and squashing of intermediate commits',
          'Pull request authorship with before/after screenshots and test evidence',
        ],
        implementationSteps: [
          'Identify repository with "good first issue" tags on GitHub',
          'Fork repository and clone locally with configured upstream remotes',
          'Create feature branch, resolve target issue, and run local test suites',
          'Push branch and open pull request with detailed description and PR template',
        ],
        resumeBullet: 'Contributed bug fixes and documentation improvements to active open-source repositories on GitHub, collaborating via code reviews and PR feedback.',
      },
      {
        title: 'Automated CI/CD Pipeline & Branch Protection Strategy',
        description: 'Design and document an enterprise branching strategy with automated GitHub Actions testing.',
        problemStatement: 'Software teams face broken production builds when code is merged without automated test validation or lint checks.',
        detailedDescription: 'An enterprise release engineering setup. Configures a trunk-based branching model with GitHub branch protection rules requiring status checks and approvals. Implements automated GitHub Actions workflows that run linters, type checks, and unit tests on every opened pull request before allowing merges.',
        difficulty: 'intermediate',
        tech: ['Git', 'GitHub Actions', 'YAML', 'CI/CD Pipelines'],
        estimatedHours: 10,
        keyFeatures: [
          'GitHub Actions workflow running unit tests across multiple runtime matrices',
          'Automated linting and formatting verification with pre-commit hooks',
          'Branch protection rules enforcing required status checks and linear history',
          'Semantic versioning release tagging triggered on merges to main',
        ],
        implementationSteps: [
          'Draft branching strategy specification (trunk-based development)',
          'Author .github/workflows/ci.yml pipeline executing test suites',
          'Configure branch protection rules on main requiring CI green checkmarks',
          'Simulate pull request review flow and test automated failure blocks',
        ],
        resumeBullet: 'Implemented automated CI/CD validation pipelines with GitHub Actions, enforcing branch protection rules and automated test coverage on all pull requests.',
      },
    ],
  },
  docker: {
    resources: [
      { title: 'Docker Official Docs – Get Started', url: 'https://docs.docker.com/get-started/', type: 'doc', provider: 'Docker', level: 'beginner', free: true },
      { title: 'Play with Docker', url: 'https://labs.play-with-docker.com/', type: 'course', provider: 'Docker', level: 'beginner', free: true },
      { title: 'Docker & Kubernetes: Practical Guide', url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', type: 'course', provider: 'Udemy', level: 'intermediate', free: false },
    ],
    projects: [
      {
        title: 'Production Multi-Stage Dockerfile Optimization',
        description: 'Containerize a web app with multi-stage builds, non-root users, and minimal Alpine images.',
        problemStatement: 'Single-stage Docker images include gigabytes of build tools and compilers, bloating deployment times and expanding attack surfaces.',
        detailedDescription: 'A container security and performance engineering project. Implements multi-stage Docker builds that separate the compilation/build environment from the lightweight production runner. Uses official Alpine/slim base images, enforces non-root user execution, and configures `.dockerignore` files to create secure, ultra-small images.',
        difficulty: 'beginner',
        tech: ['Docker', 'Dockerfile', 'Alpine Linux', 'Container Security'],
        estimatedHours: 8,
        keyFeatures: [
          'Multi-stage build separating compiler dependencies from runtime artifacts',
          'Creation and assignment of non-root system users for defense-in-depth',
          'Optimized layer caching ordering frequently changed code last',
          'Container healthcheck definitions verifying HTTP endpoint responsiveness',
        ],
        implementationSteps: [
          'Write initial single-stage Dockerfile and measure baseline image size',
          'Refactor into builder and runner stages using alpine base images',
          'Configure non-root user permissions and copy only compiled assets',
          'Verify container startup, healthchecks, and image size reduction (>70%)',
        ],
        resumeBullet: 'Optimized production Docker images using multi-stage builds and Alpine bases, slashing container image footprint by 75% and enforcing non-root security boundaries.',
      },
      {
        title: 'Multi-Service Orchestration with Docker Compose & Nginx',
        description: 'Orchestrate a microservices stack (API + Database + Frontend + Reverse Proxy) with Compose.',
        problemStatement: 'Full-stack applications require multiple coordinated services (frontend, backend, database, reverse proxy) that are tedious to configure individually.',
        detailedDescription: 'A local cloud-native stack orchestrating an API backend, a PostgreSQL relational database, and an Nginx reverse proxy using Docker Compose. Configures isolated virtual bridge networks, named persistent storage volumes for database durability, environment variable secrets injection, and reverse proxy routing.',
        difficulty: 'intermediate',
        tech: ['Docker', 'Docker Compose', 'Nginx', 'PostgreSQL', 'Microservices'],
        estimatedHours: 16,
        keyFeatures: [
          'Declarative docker-compose.yml configuration managing 3+ services',
          'Internal isolated network ensuring database is inaccessible from the host',
          'Named Docker volumes ensuring database persistence across container restarts',
          'Nginx reverse proxy routing port 80 traffic to frontend and API services',
        ],
        implementationSteps: [
          'Create individual Dockerfiles for frontend and backend applications',
          'Author docker-compose.yml with services, networks, volumes, and healthchecks',
          'Configure Nginx reverse proxy configuration routing /api requests to backend',
          'Verify end-to-end communication and database volume persistence across restarts',
        ],
        resumeBullet: 'Orchestrated a 3-tier microservice architecture using Docker Compose and Nginx, managing persistent database volumes and isolated bridge networks.',
      },
    ],
  },
  default: {
    resources: [
      { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org/', type: 'course', provider: 'freeCodeCamp', level: 'beginner', free: true },
      { title: 'The Odin Project', url: 'https://www.theodinproject.com/', type: 'course', provider: 'The Odin Project', level: 'beginner', free: true },
      { title: 'CS50 – Intro to CS', url: 'https://cs50.harvard.edu/x/', type: 'course', provider: 'Harvard / edX', level: 'beginner', free: true },
      { title: 'Coursera', url: 'https://www.coursera.org/', type: 'course', provider: 'Coursera', level: 'intermediate', free: false },
    ],
    projects: [
      {
        title: 'Personal Software Engineering Portfolio SPA',
        description: 'Showcase your skills, projects, and live benchmarks with a responsive neo-brutalist portfolio.',
        problemStatement: 'Engineers need a clean, distinctive online presence that stands out to recruiters and demonstrates responsive design craftsmanship.',
        detailedDescription: 'A personalized developer portfolio built with React and Tailwind CSS. Features dynamic project showcases with live preview links, interactive GitHub API activity widgets, responsive mobile drawer navigation, dark/light themes, and contact forms.',
        difficulty: 'beginner',
        tech: ['React', 'Tailwind CSS', 'Responsive Design', 'Vite'],
        estimatedHours: 12,
        keyFeatures: [
          'Neo-brutalist aesthetic with custom typography and drop shadows',
          'Interactive project modals showcasing architecture diagrams and tech stacks',
          'Contact form integration with client-side validation',
          'Lighthouse 95+ score for accessibility, SEO, and performance',
        ],
        implementationSteps: [
          'Design wireframes highlighting featured technical projects',
          'Implement component hierarchy for hero, projects, skills, and contact',
          'Add smooth scrolling and responsive mobile navigation',
          'Deploy to Vercel/Netlify with custom domain configuration',
        ],
        resumeBullet: 'Designed and deployed a responsive developer portfolio web application in React and Tailwind CSS, achieving 95+ Google Lighthouse performance scores.',
      },
      {
        title: 'Full-Stack Technical Blog & Documentation Engine',
        description: 'Full-stack blog platform with markdown authoring, user auth, tag filtering, and comments.',
        problemStatement: 'Knowledge-sharing within teams requires clean markdown authoring, tag indexing, and low-latency rendering.',
        detailedDescription: 'A full-stack publication platform featuring Markdown authoring, tag taxonomies, reader comments, and JWT authentication. Employs a decoupled architecture with a RESTful backend API and a fast reactive client interface.',
        difficulty: 'intermediate',
        tech: ['Full-Stack', 'REST API', 'Markdown', 'Relational DB'],
        estimatedHours: 40,
        keyFeatures: [
          'Full CRUD operations for articles with live Markdown preview',
          'Authentication and authorization restricting edits to article authors',
          'Tag-based filtering and search index across article titles and content',
          'Responsive reading mode with estimated reading time calculation',
        ],
        implementationSteps: [
          'Model database tables for users, articles, tags, and comments',
          'Build RESTful API endpoints for article creation and querying',
          'Implement frontend client with split-screen Markdown authoring',
          'Add user authentication and comment threads with optimistic updates',
        ],
        resumeBullet: 'Built a full-stack publication platform featuring Markdown rendering, tag-based search indexing, and JWT authorization for multi-author workflows.',
      },
      {
        title: 'Autonomous System Response & Monitoring Capstone',
        description: 'End-to-end distributed system monitoring live metrics, failure alerts, and automated responses.',
        problemStatement: 'Complex software deployments require real-time anomaly detection and autonomous self-healing to maintain 99.9% uptime SLAs.',
        detailedDescription: 'An enterprise capstone project modeling autonomous system health inspection. Continuously polls server metrics (CPU, memory, latency), triggers alerting thresholds, visualizes telemetry through real-time dashboards, and executes automated remediation webhooks.',
        difficulty: 'advanced',
        tech: ['Distributed Systems', 'Python / Go', 'Docker', 'WebSockets', 'Metrics'],
        estimatedHours: 80,
        keyFeatures: [
          'High-throughput metric collection pipeline with low memory overhead',
          'Threshold-based alerting engine dispatching webhook notifications',
          'Interactive real-time monitoring dashboard with live chart updates',
          'Automated remediation triggers restarting degraded services',
        ],
        implementationSteps: [
          'Design metric collection agent and ingest API schema',
          'Build time-series storage and evaluation engine with alerting rules',
          'Implement frontend dashboard with WebSocket data streaming',
          'Containerize all components and write automated failover tests',
        ],
        resumeBullet: 'Architected a distributed system health monitoring platform with real-time WebSocket telemetry and automated webhook remediation workflows.',
      },
    ],
  },
}

function matchSkillContent(skillName: string): SkillContent {
  const lower = skillName.toLowerCase().replace(/[\s-]/g, '_')
  for (const key of Object.keys(SKILL_CONTENT)) {
    if (key === 'default') continue
    if (lower.includes(key) || key.split('_').every((part) => lower.includes(part))) {
      return SKILL_CONTENT[key]
    }
  }
  return SKILL_CONTENT.default
}

// ---- Card components ----
const typeIcon: Record<string, string> = { course: '🎓', doc: '📄', article: '✍️', video: '🎬', book: '📚' }
const typeColor: Record<string, string> = {
  course: 'bg-blue-50 text-blue-700 border-blue-200',
  doc: 'bg-gray-50 text-gray-700 border-gray-200',
  article: 'bg-purple-50 text-purple-700 border-purple-200',
  video: 'bg-red-50 text-red-700 border-red-200',
  book: 'bg-amber-50 text-amber-700 border-amber-200',
}
const diffColor: Record<string, string> = {
  beginner: 'badge-green',
  intermediate: 'badge-yellow',
  advanced: 'badge-red',
}

function ResourceCard({ r }: { r: Resource }) {
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#18181B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#18181B] transition-all group"
    >
      <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-lg border border-black font-mono font-bold ${typeColor[r.type] || typeColor.doc}`}>
        {typeIcon[r.type]} {r.type.toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-neutral-900 group-hover:text-pink-600 transition-colors font-sans">
          {r.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="font-mono text-xs text-neutral-500">{r.provider}</span>
          <span className={diffColor[r.level]}>{r.level}</span>
          {r.free ? <span className="badge-green">Free</span> : <span className="badge-gray">Paid</span>}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-black flex-shrink-0 mt-1 transition-colors" />
    </a>
  )
}

function ProjectCard({ p }: { p: Project }) {
  const [expanded, setExpanded] = useState(false)
  const [copiedBullet, setCopiedBullet] = useState(false)

  const handleCopyBullet = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(p.resumeBullet)
    setCopiedBullet(true)
    setTimeout(() => setCopiedBullet(false), 2000)
  }

  return (
    <div className="card flex flex-col justify-between transition-all">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-black text-neutral-900 text-base font-sans tracking-tight">
            {p.title}
          </h3>
          <span className={`flex-shrink-0 ${diffColor[p.difficulty]}`}>
            {p.difficulty.toUpperCase()}
          </span>
        </div>

        {/* Problem Statement Box */}
        <div className="bg-[#FAF8F5] border border-black/20 rounded-xl p-2.5 my-2.5">
          <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-0.5">
            PROBLEM STATEMENT
          </span>
          <p className="text-xs text-neutral-800 leading-snug">{p.problemStatement}</p>
        </div>

        {/* Short Summary Description */}
        <p className="text-xs text-neutral-600 mb-3 leading-relaxed">{p.description}</p>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {p.tech.map((t) => (
            <span
              key={t}
              className="text-[11px] bg-white border border-black px-2 py-0.5 rounded-md font-mono font-bold text-neutral-800 shadow-[1px_1px_0px_#18181B]"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Detailed Blueprint Accordion */}
        {expanded && (
          <div className="mt-4 pt-4 border-t-2 border-black/10 space-y-4 animate-fade-in">
            {/* Detailed Architecture Description */}
            <div>
              <span className="font-mono text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Cpu className="w-3.5 h-3.5 text-neutral-800" />
                <span>ARCHITECTURAL SPECIFICATION & BLUEPRINT</span>
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed bg-white border border-black/20 p-3 rounded-xl shadow-inner">
                {p.detailedDescription}
              </p>
            </div>

            {/* Core Features & Deliverables */}
            <div>
              <span className="font-mono text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>KEY SYSTEM DELIVERABLES & FEATURES</span>
              </span>
              <ul className="space-y-1.5">
                {p.keyFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 flex-shrink-0"></span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step-by-Step Implementation Roadmap */}
            <div>
              <span className="font-mono text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Terminal className="w-3.5 h-3.5 text-neutral-800" />
                <span>STEP-BY-STEP IMPLEMENTATION ROADMAP</span>
              </span>
              <ol className="space-y-1.5">
                {p.implementationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                    <span className="w-4 h-4 rounded-full bg-neutral-900 text-white font-mono text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Ready-to-Use Resume Bullet Point */}
            <div className="bg-[#D1FAE5] border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#18181B]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-800" />
                  <span>RESUME BULLET POINT (XYZ FORMAT)</span>
                </span>
                <button
                  onClick={handleCopyBullet}
                  className="flex items-center gap-1 font-mono text-[10px] font-bold text-neutral-900 bg-white border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000] hover:bg-neutral-50"
                  title="Copy bullet point to clipboard"
                >
                  {copiedBullet ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-xs text-neutral-900 leading-snug">
                &bull; {p.resumeBullet}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Controls */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/10">
        <span className="font-mono text-xs text-neutral-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> ~{p.estimatedHours}h to build
        </span>

        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-secondary text-[10px] py-1 px-3"
        >
          <span>{expanded ? 'HIDE BLUEPRINT' : 'VIEW FULL BLUEPRINT'}</span>
          {expanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
        </button>
      </div>
    </div>
  )
}

// ---- Main Page ----
interface SkillGapEntry {
  skill_id: number
  skill_name: string
  gap_status: string
  importance: string
}
interface GapReport {
  has_target_career: boolean
  career: { id: number; title: string } | null
  skill_gaps: SkillGapEntry[]
}

const generalSkills: SkillGapEntry[] = [
  { skill_id: -1, skill_name: 'Python', gap_status: '', importance: 'critical' },
  { skill_id: -2, skill_name: 'JavaScript', gap_status: '', importance: 'critical' },
  { skill_id: -3, skill_name: 'SQL', gap_status: '', importance: 'important' },
  { skill_id: -4, skill_name: 'Git', gap_status: '', importance: 'important' },
  { skill_id: -5, skill_name: 'React', gap_status: '', importance: 'important' },
  { skill_id: -6, skill_name: 'Machine Learning', gap_status: '', importance: 'nice_to_have' },
  { skill_id: -7, skill_name: 'Docker', gap_status: '', importance: 'nice_to_have' },
  { skill_id: -8, skill_name: 'Data Analysis', gap_status: '', importance: 'important' },
]

export default function ResourcesPage() {
  const [report, setReport] = useState<GapReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'resources' | 'projects'>('projects')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  useEffect(() => {
    api.get('/api/v1/skill-gap')
      .then((res) => setReport(res.data))
      .catch(() => setError('Could not load your skill data. Showing general resources.'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !(prev[id] !== false) }))

  const baseSkills = report?.skill_gaps?.length ? report.skill_gaps : generalSkills
  const displaySkills = baseSkills.filter((s) =>
    s.skill_name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner text="Loading curriculum & engineering projects..." />

  return (
    <div className="space-y-8 pb-16">
      {/* Header matching Screenshot theme */}
      <div>
        <div className="neo-section-tag mb-1">
          <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
          <span>CURRICULUM & PORTFOLIO PROJECTS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight font-sans">
          Engineering <span className="neo-highlight">Project Blueprints</span> & Learning Hub
        </h1>
        {report?.career ? (
          <p className="text-sm text-neutral-600 mt-1">
            Curated project specifications tailored for:{' '}
            <strong className="text-black">{report.career.title}</strong>
          </p>
        ) : (
          <p className="text-sm text-neutral-600 mt-1">
            Hands-on portfolio specifications with problem statements, architecture blueprints, and resume bullets.
          </p>
        )}
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Tabs + Filter Controls matching theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Neo Pills for Tabs */}
        <div className="flex gap-2 p-1 bg-[#FAF8F5] border-2 border-black rounded-full shadow-[2px_2px_0px_#18181B] self-start sm:self-auto">
          {(['projects', 'resources'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-black text-white shadow-[2px_2px_0px_#EC4899]'
                  : 'text-neutral-700 hover:text-black hover:bg-neutral-200/50'
              }`}
            >
              {tab === 'projects' ? <Code2 className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
              <span>{tab === 'projects' ? 'Project Blueprints' : 'Tutorials & Docs'}</span>
            </button>
          ))}
        </div>

        {/* Search & Level Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-44 text-xs py-2"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="input-field w-36 text-xs font-mono font-bold cursor-pointer py-2"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Skill Sections */}
      <div className="space-y-4">
        {displaySkills.map((skill) => {
          const content = matchSkillContent(skill.skill_name)
          const isOpen = expanded[skill.skill_id] !== false

          const filteredResources = content.resources.filter(
            (r) => levelFilter === 'all' || r.level === levelFilter
          )
          const filteredProjects = content.projects.filter(
            (p) => levelFilter === 'all' || p.difficulty === levelFilter
          )
          const items = activeTab === 'resources' ? filteredResources : filteredProjects
          if (items.length === 0) return null

          return (
            <div key={skill.skill_id} className="card p-0 overflow-hidden">
              <button
                onClick={() => toggle(skill.skill_id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-neutral-50/70 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white border-2 border-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_#18181B]">
                    {activeTab === 'resources' ? (
                      <BookOpen className="w-4 h-4 text-black" />
                    ) : (
                      <Code2 className="w-4 h-4 text-black" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-black text-neutral-900 text-base font-sans tracking-tight">
                      {skill.skill_name}
                    </h2>
                    <p className="font-mono text-xs text-neutral-500 mt-0.5 uppercase">
                      {items.length} {activeTab === 'resources' ? 'Resource' : 'Blueprint'}
                      {items.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {skill.gap_status && skill.gap_status !== 'not_assessed' && (
                    <span
                      className={
                        skill.gap_status === 'critical_gap'
                          ? 'badge-red'
                          : skill.gap_status === 'needs_improvement'
                          ? 'badge-yellow'
                          : 'badge-blue'
                      }
                    >
                      {skill.gap_status === 'target_met' ? 'Target Met • Advance Level' : skill.gap_status.replace(/_/g, ' ')}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-600" />
                  )}
                </div>
              </button>

              {skill.gap_status === 'target_met' && (
                <div className="px-4 sm:px-5 py-2 bg-[#F0F9FF] border-t border-b border-[#0EA5E9]/30 flex items-center gap-2">
                  <span className="text-xs">🚀</span>
                  <p className="font-mono text-[11px] font-bold text-[#0369A1]">
                    You have mastered the target level for this skill! Showing advanced blueprints and deep-dive materials to push your expertise further.
                  </p>
                </div>
              )}

              {isOpen && (
                <div className="border-t-2 border-black/10 p-4 sm:p-5 bg-[#FAF8F5]/40">
                  {activeTab === 'resources' ? (
                    <div className="space-y-3">
                      {filteredResources.map((r, i) => (
                        <ResourceCard key={i} r={r} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredProjects.map((p, i) => (
                        <ProjectCard key={i} p={p} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {displaySkills.filter((s) => {
        const c = matchSkillContent(s.skill_name)
        const items =
          activeTab === 'resources'
            ? c.resources.filter((r) => levelFilter === 'all' || r.level === levelFilter)
            : c.projects.filter((p) => levelFilter === 'all' || p.difficulty === levelFilter)
        return items.length > 0
      }).length === 0 && (
        <div className="card text-center py-16 text-neutral-500">
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-40 text-black" />
          <p className="font-black text-neutral-800 text-lg font-sans">No blueprints matched your filters</p>
          <p className="font-mono text-xs text-neutral-500 mt-1">Try modifying your query or level filter.</p>
        </div>
      )}
    </div>
  )
}
