"""
Seed script for SkillBridge AI - Careers and Skills catalogue.
Safe to rerun: uses upsert pattern (check-before-insert).
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.base import SessionLocal
from app.models.skill import SkillCategory, Skill, SkillTopic
from app.models.career import Career, CareerSkillRequirement


def upsert_category(db, name, description):
    obj = db.query(SkillCategory).filter(SkillCategory.name == name).first()
    if not obj:
        obj = SkillCategory(name=name, description=description)
        db.add(obj)
        db.flush()
    return obj


def upsert_skill(db, name, slug, category_id, description, keywords):
    obj = db.query(Skill).filter(Skill.slug == slug).first()
    if not obj:
        obj = Skill(name=name, slug=slug, category_id=category_id,
                    description=description, keywords=keywords, is_active=True)
        db.add(obj)
        db.flush()
    return obj


def upsert_topic(db, skill_id, name, description, order_index):
    obj = db.query(SkillTopic).filter(
        SkillTopic.skill_id == skill_id, SkillTopic.name == name).first()
    if not obj:
        obj = SkillTopic(skill_id=skill_id, name=name,
                         description=description, order_index=order_index)
        db.add(obj)
        db.flush()
    return obj


def upsert_career(db, title, slug, description, responsibilities):
    obj = db.query(Career).filter(Career.slug == slug).first()
    if not obj:
        obj = Career(title=title, slug=slug, description=description,
                     responsibilities=responsibilities, is_active=True)
        db.add(obj)
        db.flush()
    return obj


def upsert_req(db, career_id, skill_id, target_proficiency, importance, weight, notes=None):
    obj = db.query(CareerSkillRequirement).filter(
        CareerSkillRequirement.career_id == career_id,
        CareerSkillRequirement.skill_id == skill_id).first()
    if not obj:
        obj = CareerSkillRequirement(career_id=career_id, skill_id=skill_id,
                                     target_proficiency=target_proficiency,
                                     importance=importance, weight=weight, notes=notes)
        db.add(obj)
        db.flush()
    return obj


def seed():
    db = SessionLocal()
    try:
        print("Seeding skill categories...")
        cat_prog  = upsert_category(db, "Programming Languages",
                                    "Core programming languages used in software development")
        cat_web   = upsert_category(db, "Web Development",
                                    "Frameworks, libraries, and tools for building web applications")
        cat_db    = upsert_category(db, "Databases",
                                    "Relational and NoSQL database systems and query languages")
        cat_data  = upsert_category(db, "Data/AI/ML",
                                    "Data science, artificial intelligence, and machine learning tools and techniques")
        cat_cloud = upsert_category(db, "Cloud/DevOps",
                                    "Cloud platforms, containerisation, and DevOps practices")
        cat_cyber = upsert_category(db, "Cybersecurity",
                                    "Security concepts, tools, and practices for protecting systems and data")
        db.commit()
        print("  Categories seeded.")

        print("Seeding skills...")
        python      = upsert_skill(db, "Python", "python", cat_prog.id,
                                   "A versatile high-level programming language widely used in data science, web development, and automation.",
                                   "python, scripting, backend, automation, data science")
        javascript  = upsert_skill(db, "JavaScript", "javascript", cat_prog.id,
                                   "The primary language of the web, enabling interactive front-end and server-side development via Node.js.",
                                   "javascript, js, frontend, browser, node")
        typescript  = upsert_skill(db, "TypeScript", "typescript", cat_prog.id,
                                   "A statically typed superset of JavaScript that compiles to plain JS, improving code quality and maintainability.",
                                   "typescript, ts, static typing, javascript")
        java        = upsert_skill(db, "Java", "java", cat_prog.id,
                                   "A robust, object-oriented language widely used in enterprise applications and Android development.",
                                   "java, oop, enterprise, jvm, android")
        sql         = upsert_skill(db, "SQL", "sql", cat_prog.id,
                                   "Structured Query Language for managing and querying relational databases.",
                                   "sql, database, queries, relational, data")
        html_css    = upsert_skill(db, "HTML & CSS", "html-css", cat_web.id,
                                   "The foundational markup and styling languages for building and designing web pages.",
                                   "html, css, markup, styling, web, frontend")
        react       = upsert_skill(db, "React", "react", cat_web.id,
                                   "A popular JavaScript library developed by Meta for building component-based user interfaces.",
                                   "react, reactjs, frontend, ui, components, hooks")
        nodejs      = upsert_skill(db, "Node.js", "nodejs", cat_web.id,
                                   "A JavaScript runtime built on Chrome's V8 engine for building scalable server-side applications.",
                                   "nodejs, node, backend, server, javascript, express")
        fastapi     = upsert_skill(db, "FastAPI", "fastapi", cat_web.id,
                                   "A modern, high-performance Python web framework for building APIs with automatic documentation.",
                                   "fastapi, python, api, backend, rest, openapi")
        spring_boot = upsert_skill(db, "Spring Boot", "spring-boot", cat_web.id,
                                   "A Java-based framework for building production-ready, stand-alone Spring applications with minimal configuration.",
                                   "spring, spring boot, java, backend, microservices")
        postgresql  = upsert_skill(db, "PostgreSQL", "postgresql", cat_db.id,
                                   "A powerful, open-source object-relational database known for reliability and advanced feature set.",
                                   "postgresql, postgres, sql, relational, database")
        mongodb     = upsert_skill(db, "MongoDB", "mongodb", cat_db.id,
                                   "A leading NoSQL document-oriented database that stores data in flexible, JSON-like documents.",
                                   "mongodb, nosql, document, database, json")
        pandas      = upsert_skill(db, "Pandas", "pandas", cat_data.id,
                                   "A fast, powerful Python data analysis and manipulation library built on NumPy.",
                                   "pandas, python, data analysis, dataframe, data science")
        numpy       = upsert_skill(db, "NumPy", "numpy", cat_data.id,
                                   "The fundamental package for scientific computing in Python, providing N-dimensional array objects.",
                                   "numpy, python, numerical, arrays, scientific computing")
        sklearn     = upsert_skill(db, "Scikit-Learn", "scikit-learn", cat_data.id,
                                   "A simple and efficient Python library for classical machine learning algorithms and data mining.",
                                   "scikit-learn, sklearn, machine learning, python, ml")
        tensorflow  = upsert_skill(db, "TensorFlow", "tensorflow", cat_data.id,
                                   "An end-to-end open-source platform for machine learning, developed by Google Brain.",
                                   "tensorflow, deep learning, neural networks, google, ml, ai")
        data_viz    = upsert_skill(db, "Data Visualization", "data-visualization", cat_data.id,
                                   "Techniques and tools (Matplotlib, Seaborn, Plotly) to graphically represent data for insight discovery.",
                                   "data visualization, matplotlib, seaborn, plotly, charts, graphs")
        stats       = upsert_skill(db, "Statistics & Probability", "statistics-probability", cat_data.id,
                                   "Mathematical foundations of statistical analysis and probability theory essential for data science and ML.",
                                   "statistics, probability, math, data science, inference")
        docker      = upsert_skill(db, "Docker", "docker", cat_cloud.id,
                                   "A platform for developing, shipping, and running applications in lightweight, portable containers.",
                                   "docker, containers, devops, deployment, virtualisation")
        kubernetes  = upsert_skill(db, "Kubernetes", "kubernetes", cat_cloud.id,
                                   "An open-source container-orchestration system for automating deployment, scaling, and management of containerised applications.",
                                   "kubernetes, k8s, orchestration, containers, devops")
        aws         = upsert_skill(db, "AWS", "aws", cat_cloud.id,
                                   "Amazon Web Services - the world's most comprehensive cloud platform offering over 200 services.",
                                   "aws, amazon, cloud, ec2, s3, lambda, devops")
        linux       = upsert_skill(db, "Linux", "linux", cat_cloud.id,
                                   "Knowledge of the Linux operating system, shell scripting, and system administration.",
                                   "linux, bash, shell, unix, sysadmin, command line")
        git         = upsert_skill(db, "Git", "git", cat_cloud.id,
                                   "A distributed version control system for tracking changes in source code during software development.",
                                   "git, version control, github, gitlab, branching")
        networking  = upsert_skill(db, "Networking Fundamentals", "networking-fundamentals", cat_cyber.id,
                                   "Core concepts of computer networking including TCP/IP, DNS, HTTP, firewalls, and network architecture.",
                                   "networking, tcp/ip, dns, http, firewall, protocols")
        cyber_fund  = upsert_skill(db, "Cybersecurity Fundamentals", "cybersecurity-fundamentals", cat_cyber.id,
                                   "Core principles of information security including threats, vulnerabilities, cryptography, and defensive practices.",
                                   "cybersecurity, security, cryptography, threats, vulnerabilities, OWASP")
        db.commit()
        print("  Skills seeded.")

        print("Seeding skill topics...")
        upsert_topic(db, python.id, "Python Basics & Syntax", "Variables, data types, control flow, functions, and modules.", 1)
        upsert_topic(db, python.id, "Object-Oriented Programming", "Classes, inheritance, encapsulation, polymorphism, and magic methods.", 2)
        upsert_topic(db, python.id, "File I/O & Exception Handling", "Reading/writing files, context managers, and handling exceptions gracefully.", 3)
        upsert_topic(db, python.id, "Standard Library & Packages", "Key standard library modules and using pip to manage third-party packages.", 4)
        upsert_topic(db, python.id, "Asynchronous Python", "Async/await, asyncio event loops, and concurrent programming patterns.", 5)
        upsert_topic(db, javascript.id, "JavaScript Fundamentals", "Variables, data types, functions, closures, and the event loop.", 1)
        upsert_topic(db, javascript.id, "DOM Manipulation & Browser APIs", "Selecting elements, event listeners, fetch API, and local storage.", 2)
        upsert_topic(db, javascript.id, "Modern JavaScript (ES6+)", "Arrow functions, destructuring, modules, Promises, async/await.", 3)
        upsert_topic(db, react.id, "React Core Concepts", "JSX, components, props, and the virtual DOM.", 1)
        upsert_topic(db, react.id, "State & Hooks", "useState, useEffect, useContext, useRef, and custom hooks.", 2)
        upsert_topic(db, react.id, "Routing & State Management", "React Router, Redux Toolkit, and Zustand for application state.", 3)
        upsert_topic(db, react.id, "Testing React Applications", "Unit testing with Jest, component testing with React Testing Library.", 4)
        upsert_topic(db, sql.id, "SQL Basics & CRUD", "SELECT, INSERT, UPDATE, DELETE, and basic WHERE clauses.", 1)
        upsert_topic(db, sql.id, "Joins & Aggregations", "INNER/LEFT/RIGHT JOIN, GROUP BY, HAVING, and aggregate functions.", 2)
        upsert_topic(db, sql.id, "Subqueries & CTEs", "Nested queries, WITH clauses, and query optimisation strategies.", 3)
        upsert_topic(db, sql.id, "Indexing & Performance", "Index types, query plans, EXPLAIN, and database normalisation.", 4)
        upsert_topic(db, sklearn.id, "Data Preprocessing", "Scaling, encoding categorical variables, handling missing values.", 1)
        upsert_topic(db, sklearn.id, "Supervised Learning", "Linear/logistic regression, decision trees, SVMs, and ensemble methods.", 2)
        upsert_topic(db, sklearn.id, "Model Evaluation", "Cross-validation, confusion matrix, ROC-AUC, precision, recall, F1.", 3)
        upsert_topic(db, sklearn.id, "Unsupervised Learning", "K-means clustering, PCA, dimensionality reduction techniques.", 4)
        upsert_topic(db, cyber_fund.id, "Security Concepts & CIA Triad", "Confidentiality, integrity, availability, and threat modelling.", 1)
        upsert_topic(db, cyber_fund.id, "Cryptography Basics", "Symmetric/asymmetric encryption, hashing, TLS/SSL, PKI.", 2)
        upsert_topic(db, cyber_fund.id, "Common Vulnerabilities & OWASP Top 10", "Injection, XSS, CSRF, broken authentication, and secure coding practices.", 3)
        upsert_topic(db, cyber_fund.id, "Incident Response & Defensive Tools", "Log analysis, SIEM basics, firewalls, IDS/IPS, and vulnerability scanning.", 4)
        db.commit()
        print("  Topics seeded.")

        print("Seeding careers...")
        fullstack    = upsert_career(db, "Full-Stack Developer", "full-stack-developer",
                                     "A versatile developer who builds both the front-end (client-side) and back-end (server-side) of web applications.",
                                     "Design and implement UI components; build RESTful APIs; manage databases; deploy to cloud infrastructure; collaborate with product teams.")
        frontend     = upsert_career(db, "Frontend Developer", "frontend-developer",
                                     "A developer focused on creating the visual and interactive elements of web applications that users interact with directly.",
                                     "Build responsive UIs; implement designs with HTML/CSS; write clean JavaScript/TypeScript; optimise for performance and accessibility.")
        backend      = upsert_career(db, "Backend Developer", "backend-developer",
                                     "A developer who designs and maintains the server-side logic, databases, and APIs that power web applications.",
                                     "Design RESTful/GraphQL APIs; model and query databases; implement authentication and authorisation; ensure scalability and security.")
        data_analyst = upsert_career(db, "Data Analyst", "data-analyst",
                                     "A professional who collects, cleans, and analyses data to generate actionable business insights and reports.",
                                     "Write SQL queries; create dashboards and visualisations; perform statistical analysis; communicate findings to stakeholders.")
        data_scientist = upsert_career(db, "Data Scientist", "data-scientist",
                                       "A professional who uses statistical modelling, machine learning, and domain expertise to extract knowledge from data.",
                                       "Build and evaluate ML models; feature engineering; A/B testing; present results and recommendations to business teams.")
        ml_engineer  = upsert_career(db, "ML Engineer", "ml-engineer",
                                     "An engineer who designs, builds, and deploys machine learning systems and pipelines at scale.",
                                     "Productionise ML models; build data pipelines; monitor model performance; collaborate with data scientists and platform teams.")
        ai_engineer  = upsert_career(db, "AI Engineer", "ai-engineer",
                                     "An engineer who designs and integrates AI solutions including LLMs, generative AI, and intelligent agents into products.",
                                     "Integrate AI/ML APIs; build RAG and LLM-powered features; evaluate model quality; ensure responsible AI practices.")
        java_dev     = upsert_career(db, "Java Developer", "java-developer",
                                     "A developer specialising in building enterprise-grade applications using the Java ecosystem.",
                                     "Build microservices with Spring Boot; write unit and integration tests; work with relational databases; maintain CI/CD pipelines.")
        python_dev   = upsert_career(db, "Python Developer", "python-developer",
                                     "A developer who uses Python to build web applications, automation scripts, data pipelines, and APIs.",
                                     "Develop REST APIs with FastAPI/Django/Flask; write automation scripts; work with SQL and NoSQL databases; contribute to open-source.")
        devops_eng   = upsert_career(db, "DevOps Engineer", "devops-engineer",
                                     "An engineer who bridges development and operations, focusing on automation, CI/CD, and cloud infrastructure.",
                                     "Manage Kubernetes clusters; build CI/CD pipelines; automate infrastructure with IaC; monitor systems and respond to incidents.")
        cyber_analyst = upsert_career(db, "Cybersecurity Analyst", "cybersecurity-analyst",
                                      "A professional who protects an organisation's systems and data by monitoring threats, analysing incidents, and implementing defences.",
                                      "Monitor SIEM dashboards; conduct vulnerability assessments; respond to security incidents; implement security policies.")
        cloud_eng    = upsert_career(db, "Cloud Engineer", "cloud-engineer",
                                     "An engineer who designs, implements, and manages cloud infrastructure and services on platforms such as AWS, Azure, or GCP.",
                                     "Provision cloud resources; implement security controls; optimise costs; manage networking and IAM; support DevOps teams.")
        db.commit()
        print("  Careers seeded.")

        print("Seeding career skill requirements...")
        for skill, prof, imp, wt in [(html_css,"intermediate","critical",2.0),(javascript,"advanced","critical",2.0),(typescript,"intermediate","important",1.5),(react,"intermediate","critical",2.0),(nodejs,"intermediate","critical",1.5),(sql,"intermediate","important",1.5),(postgresql,"beginner","important",1.0),(git,"intermediate","critical",1.5),(docker,"beginner","nice_to_have",1.0)]:
            upsert_req(db, fullstack.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(html_css,"advanced","critical",2.0),(javascript,"advanced","critical",2.0),(typescript,"intermediate","important",1.5),(react,"advanced","critical",2.0),(git,"intermediate","important",1.5)]:
            upsert_req(db, frontend.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(python,"intermediate","important",1.5),(javascript,"beginner","nice_to_have",1.0),(sql,"advanced","critical",2.0),(postgresql,"intermediate","critical",2.0),(fastapi,"intermediate","important",1.5),(nodejs,"intermediate","important",1.5),(docker,"intermediate","important",1.5),(git,"intermediate","critical",1.5),(linux,"beginner","important",1.0)]:
            upsert_req(db, backend.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(sql,"advanced","critical",2.0),(python,"intermediate","critical",2.0),(pandas,"intermediate","critical",2.0),(numpy,"beginner","important",1.0),(data_viz,"intermediate","critical",2.0),(stats,"intermediate","critical",2.0),(postgresql,"intermediate","important",1.5)]:
            upsert_req(db, data_analyst.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(python,"advanced","critical",2.0),(sql,"intermediate","critical",1.5),(pandas,"advanced","critical",2.0),(numpy,"intermediate","critical",1.5),(sklearn,"advanced","critical",2.0),(tensorflow,"intermediate","important",1.5),(stats,"advanced","critical",2.0),(data_viz,"intermediate","important",1.5),(git,"beginner","important",1.0)]:
            upsert_req(db, data_scientist.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(python,"advanced","critical",2.0),(sklearn,"advanced","critical",2.0),(tensorflow,"advanced","critical",2.0),(pandas,"intermediate","important",1.5),(numpy,"intermediate","important",1.5),(docker,"intermediate","critical",1.5),(linux,"intermediate","important",1.5),(sql,"intermediate","important",1.0),(git,"intermediate","critical",1.5),(aws,"beginner","nice_to_have",1.0)]:
            upsert_req(db, ml_engineer.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(python,"advanced","critical",2.0),(tensorflow,"intermediate","important",1.5),(sklearn,"intermediate","important",1.5),(fastapi,"intermediate","important",1.5),(docker,"intermediate","important",1.5),(aws,"beginner","important",1.0),(git,"intermediate","critical",1.5),(sql,"beginner","nice_to_have",1.0)]:
            upsert_req(db, ai_engineer.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(java,"advanced","critical",2.0),(spring_boot,"intermediate","critical",2.0),(sql,"intermediate","critical",1.5),(postgresql,"intermediate","important",1.5),(docker,"beginner","important",1.0),(git,"intermediate","critical",1.5),(linux,"beginner","important",1.0)]:
            upsert_req(db, java_dev.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(python,"advanced","critical",2.0),(fastapi,"intermediate","critical",2.0),(sql,"intermediate","important",1.5),(postgresql,"intermediate","important",1.5),(docker,"beginner","important",1.0),(git,"intermediate","critical",1.5),(linux,"beginner","important",1.0),(html_css,"beginner","nice_to_have",1.0)]:
            upsert_req(db, python_dev.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(linux,"advanced","critical",2.0),(docker,"advanced","critical",2.0),(kubernetes,"advanced","critical",2.0),(aws,"intermediate","critical",2.0),(git,"advanced","critical",1.5),(python,"beginner","important",1.0),(networking,"intermediate","important",1.5)]:
            upsert_req(db, devops_eng.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(cyber_fund,"advanced","critical",2.0),(networking,"advanced","critical",2.0),(linux,"intermediate","critical",1.5),(python,"beginner","important",1.0),(sql,"beginner","nice_to_have",0.5),(aws,"beginner","nice_to_have",0.5)]:
            upsert_req(db, cyber_analyst.id, skill.id, prof, imp, wt)
        for skill, prof, imp, wt in [(aws,"advanced","critical",2.0),(linux,"advanced","critical",2.0),(docker,"intermediate","critical",1.5),(kubernetes,"intermediate","important",1.5),(networking,"intermediate","important",1.5),(python,"beginner","important",1.0),(git,"intermediate","important",1.5),(cyber_fund,"beginner","nice_to_have",0.5)]:
            upsert_req(db, cloud_eng.id, skill.id, prof, imp, wt)
        db.commit()
        print("  Career skill requirements seeded.")
        print("Seed complete.")
    except Exception as exc:
        db.rollback()
        print(f"Error during seeding: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
