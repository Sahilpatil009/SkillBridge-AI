# SkillBridge AI

### AI-Powered Career Guidance and Skill Gap Analysis Platform

**Tagline:** *Bridge Your Skills. Build Your Career.*

SkillBridge AI is a personalized career-development platform for college
students and early-career learners. It helps users understand their
current technical skills, choose a target career, identify skill gaps,
follow a structured learning roadmap, access relevant learning
resources, and measure improvement over time.

This README is both the product specification and the implementation
brief for an AI coding agent. Build the application as a functional,
integrated product---not just a collection of static pages or UI
mockups.

------------------------------------------------------------------------

## 1. Product Vision

Students often do not know which technical skills they need for a
particular career, how strong their current skills are, which topics
they should improve first, or which learning resources are appropriate
for their level.

SkillBridge AI addresses this by creating a feedback loop:

1.  Create a student profile.
2.  Choose a target career or explore career options.
3.  Select technical skills and complete MCQ-based assessments.
4.  Receive skill-wise scores, proficiency estimates, and topic-level
    feedback.
5.  Compare assessed skills against the requirements of the target
    career.
6.  Receive a prioritized skill-gap report.
7.  Follow a personalized learning roadmap with curated resources and
    practical activities.
8.  Track learning progress and retake assessments.
9.  Update the skill-gap report and roadmap based on new evidence.

The central differentiator is the complete cycle of **assessment →
skill-gap analysis → personalized roadmap → learning → retesting →
updated analysis**.

### Product principles

-   Build working end-to-end functionality before adding advanced AI
    features.
-   Keep assessment scoring, proficiency classification, gap
    calculation, and progress calculations deterministic and
    backend-driven.
-   Use AI to explain and personalize recommendations, not to invent
    scores or override calculated results.
-   Clearly distinguish self-declared skills from assessed skills.
-   Treat MCQ results as evidence of theoretical understanding, not
    proof of practical or industry readiness.
-   Never fabricate learning-resource URLs, prices, certifications,
    jobs, or course details.
-   Persist user data in the database; do not rely on in-memory frontend
    state as the source of truth.
-   Design a clean, responsive, accessible interface suitable for a
    student-facing product.

------------------------------------------------------------------------

## 2. Target Users

### Primary users

-   College students preparing for internships and placements.
-   Students exploring software and technology careers.
-   Learners who want to identify and improve technical skill gaps.

### Initial technology-career catalogue

Seed the application with at least these roles:

-   Full-Stack Developer
-   Frontend Developer
-   Backend Developer
-   Data Analyst
-   Data Scientist
-   Machine Learning Engineer
-   AI Engineer
-   Java Developer
-   Python Developer
-   DevOps Engineer
-   Cybersecurity Analyst
-   Cloud Engineer

Each career should have a description, common responsibilities, required
skills, target proficiency for each skill, prerequisite relationships
where applicable, and relevant project/resource mappings. Keep career
requirements in editable database-backed seed data rather than
scattering them through frontend code.

------------------------------------------------------------------------

## 3. Technology Stack

Use this stack unless a concrete compatibility issue requires a
documented alternative.

### Frontend

-   React
-   Vite
-   JavaScript or TypeScript (prefer TypeScript for maintainability if
    starting from scratch)
-   Tailwind CSS
-   React Router
-   Axios
-   Recharts for charts
-   Lucide icons or an equivalent consistent icon library
-   A reusable component system for forms, cards, badges, dialogs,
    tables, navigation, loading states, and alerts

### Backend

-   Python
-   FastAPI
-   SQLAlchemy
-   PostgreSQL
-   Pydantic
-   JWT-based authentication
-   A secure password-hashing library such as Argon2 or bcrypt via a
    maintained package
-   Alembic for database migrations

### AI integration

-   Groq API for optional LLM-powered explanations and recommendations
-   Read the API key from environment variables only
-   Keep AI features behind a service layer so the application can still
    run when the provider is unavailable
-   The core MVP must work without an AI API key

### Development and quality

-   Git
-   `.env` for local configuration, with `.env.example` committed
-   Backend tests using pytest
-   Frontend tests for important components and flows where practical
-   API documentation through FastAPI's OpenAPI/Swagger support

Do not put secrets in source code or expose backend API keys to the
frontend.

------------------------------------------------------------------------

## 4. Scope and Delivery Strategy

Implement the application in phases. Keep each phase working before
starting the next one. Do not implement every advanced feature before
the core product is usable.

### Phase 1 --- Foundation

-   Create the frontend and backend applications.
-   Configure environment variables and database connection.
-   Add database models and migrations.
-   Add health-check endpoint.
-   Add consistent API error handling.
-   Create the shared frontend layout, navigation, loading, empty,
    success, and error states.

### Phase 2 --- Authentication and profile

-   Registration, login, logout, current-user endpoint, and protected
    pages.
-   Secure password hashing and JWT handling.
-   Student profile and onboarding.
-   Searchable multi-select skill catalogue.
-   Save profile and skill selections to PostgreSQL.

### Phase 3 --- Careers and skill catalogue

-   Career catalogue and career detail pages.
-   Skill catalogue with categories and topics.
-   Career-to-skill requirements and target proficiency mappings.
-   Career selection and saved target career.

### Phase 4 --- Assessment engine

-   Curated MCQ question bank.
-   Skill-wise assessment flow.
-   Backend scoring and assessment history.
-   Results, answer explanations, topic-level feedback, and retakes.

### Phase 5 --- Proficiency and skill-gap analysis

-   Deterministic proficiency classification.
-   Career requirement comparison.
-   Skill-gap statuses and priority ranking.
-   Visual reports and clear explanations.

### Phase 6 --- Personalized learning roadmap

-   Ordered milestones and prerequisites.
-   Topic-specific resources and practical activities.
-   Roadmap status tracking.
-   Regenerate/update roadmap without unnecessarily losing completed
    progress.

### Phase 7 --- Dashboard and progress

-   Summary cards and charts.
-   Assessment history and score trends.
-   Roadmap completion and recent activity.
-   Contextual "next recommended action".

### Phase 8 --- Resource and project catalogues

-   Curated resources with direct links and metadata.
-   Project recommendations linked to skills and careers.
-   Saved resources and project status tracking.

### Phase 9 --- Optional AI features

-   AI explanations and learning assistant.
-   AI-assisted career exploration.
-   AI-assisted roadmap explanations.
-   Validate structured AI output and gracefully handle provider errors.

### Phase 10 --- Extended career features

-   Career comparison.
-   Resume analyzer.
-   Typed mock interviews.
-   Placement-readiness indicator.
-   Job/internship matching only when a reliable, permitted data source
    is configured.

### Phase 11 --- Quality and release

-   Tests, accessibility, security review, seed data, error handling,
    documentation, and deployment instructions.

------------------------------------------------------------------------

## 5. Detailed Functional Requirements

## 5.1 Registration, Authentication, and Account Settings

Implement:

-   Registration with name, email, and password.
-   Login and logout.
-   Email format validation and unique email enforcement.
-   Secure password hashing; never store plaintext passwords.
-   JWT authentication with expiration and secure token handling.
-   Protected API endpoints and protected frontend routes.
-   Current-user endpoint to restore authenticated state after refresh.
-   Profile and password update flows.
-   Password recovery only if an email delivery mechanism is configured;
    otherwise clearly document it as not configured.
-   Appropriate rate limiting or abuse protection for authentication
    endpoints when practical.
-   Authorization checks on every endpoint that reads or changes
    user-specific data.

Users must never be able to view or modify another user's profile,
assessments, roadmap, or progress by changing an ID in a request.

## 5.2 Student Profile and Onboarding

Collect:

-   Name and email.
-   College/institution.
-   Degree/program, branch/major, and year of study.
-   Career interests.
-   Existing skills and experience.
-   Previous coursework, internships, and projects (optional).
-   Preferred learning formats: video, documentation, guided practice,
    or mixed.
-   Available study time per day/week (optional).
-   Career goal: choose a target role, improve existing skills, or
    explore careers.

Features:

-   Editable profile.
-   Profile completion indicator.
-   Searchable, categorized, multi-select skill picker.
-   Skill categories such as programming languages, web development,
    databases, data/AI/ML, cloud/DevOps, and cybersecurity.
-   Add/remove skills later.
-   Distinguish **self-declared skills** from **assessment-verified
    theoretical proficiency**.
-   Persist onboarding information.

## 5.3 Career Catalogue and Career Guidance

For every career, show:

-   Role title and description.
-   Typical responsibilities.
-   Required technical and supporting skills.
-   Target proficiency per skill.
-   Skill importance/weight.
-   Prerequisites and recommended learning order.
-   Recommended projects and learning resources.

Features:

-   Browse/search careers.
-   Select one primary target career.
-   Save additional careers for comparison.
-   Career detail page.
-   Career exploration for undecided students.
-   Compare roles by shared skills, role-specific skills, and estimated
    learning needs.
-   Optional AI explanation of why a career may align with the user's
    stated interests and experience.

Career suggestions are guidance, not guarantees of employment or
suitability.

## 5.4 Skill Catalogue

Create a database-backed catalogue containing:

-   Skill name and category.
-   Description.
-   Related topics.
-   Difficulty/level metadata where useful.
-   Aliases/search keywords.
-   Prerequisite skills/topics where applicable.

Avoid duplicate skill records for equivalent names. Use stable IDs and
relationships rather than matching only on display strings.

## 5.5 MCQ Assessment System

The MVP must use a curated question bank. AI-generated questions may be
added later as a separate, validated feature.

Each question should contain:

-   Question text.
-   Answer options (usually four).
-   Correct answer, stored and returned only where appropriate after
    submission.
-   Explanation.
-   Skill and topic identifiers.
-   Difficulty: basic, intermediate, or advanced.
-   Optional reference resource.
-   Active/published status.

Assessment flow:

1.  Student selects a skill to assess.
2.  Backend returns eligible questions without exposing correct answers.
3.  Student answers and navigates questions.
4.  UI shows question progress and supports previous/next navigation.
5.  Student reviews and submits.
6.  Backend validates the submission and calculates the score.
7.  Result page shows score, proficiency estimate, topic
    strengths/weaknesses, and explanations.
8.  The attempt is saved permanently in assessment history.

Requirements:

-   Backend-only score calculation.
-   Prevent duplicate submission of the same attempt.
-   Validate question IDs and submitted options.
-   Tie each attempt to the authenticated user.
-   Save answers, score, topic-level performance, and timestamp.
-   Retakes create new attempts and never overwrite historical attempts.
-   Use alternative questions on retakes where the question bank
    permits.
-   Avoid repeating questions too often when enough questions exist.
-   Handle incomplete or invalid submissions cleanly.
-   Optional timer can be deferred.

Scoring formula:

`score_percentage = (correct_answers / total_questions) * 100`

Round for display consistently, but retain sufficient precision in
storage if useful.

### Suggested initial proficiency rules

Use configurable backend rules, not hardcoded frontend logic:

-   Below 40%: Beginner
-   40--69%: Intermediate / Developing
-   70--89%: Advanced
-   90--100%: Advanced, with strong theoretical performance

These are initial product thresholds and should be configurable and
reviewed against question difficulty. A 90% MCQ score must **not**
automatically grant "Industry-Ready".

Use a separate practical-readiness designation only after relevant
evidence such as practical tasks, projects, and career-specific
competencies has been reviewed.

## 5.6 Topic-Level Feedback

Where question topics are tagged, summarize:

-   Topics with stronger performance.
-   Topics with weaker performance.
-   Suggested topics to review.
-   Links to relevant resources.

Do not imply statistical certainty when only a few questions cover a
topic. If topic coverage is insufficient, display a message such as "Not
enough questions to estimate this topic yet."

## 5.7 Skill-Gap Analysis

Compare assessed proficiency with the selected career's required skills
and target proficiency.

For every required skill, show:

-   Current assessed level, if available.
-   Target level.
-   Gap/status.
-   Skill importance.
-   Prerequisite relationships.
-   Priority and reason.
-   Recommended next action.

Possible statuses:

-   **Target met** --- assessed level meets the career requirement.
-   **Needs improvement** --- some progress exists, but the target has
    not been met.
-   **Critical gap** --- a high-priority requirement is substantially
    below target.
-   **Not assessed** --- insufficient assessment evidence.

Never classify an unassessed skill as Beginner by default.

Gap prioritization should consider: - Difference between current and
target proficiency. - Importance for the target career. - Prerequisites
for other skills. - Available study time and existing roadmap progress
where known.

Use deterministic backend rules for scores and priority. AI may explain
a calculated result but must not invent or silently change it.

Show a readable report and charts comparing current and required
proficiency.

## 5.8 Personalized Learning Roadmap

Generate a roadmap based on:

-   Selected career.
-   Current assessed skills.
-   Critical and ordinary skill gaps.
-   Target proficiency.
-   Existing knowledge and experience.
-   Prerequisites.
-   Available study time.
-   Completed milestones.

Each milestone should include:

-   Skill and topic.
-   Current level, if assessed.
-   Target level.
-   Priority and reason.
-   Prerequisites.
-   Estimated effort (label estimates as approximate).
-   Recommended resources.
-   Practice activity or project where suitable.
-   Status: not started, in progress, completed.
-   Completion timestamp when completed.

Features:

-   Ordered milestones.
-   Clear milestone detail view.
-   Open related resources.
-   Mark milestone/activity complete.
-   Show completed and remaining milestones.
-   Show estimated remaining effort when data exists.
-   Update or regenerate roadmap after a new assessment or career
    change.
-   Preserve completed activities that remain relevant.
-   Make changes transparent where a new roadmap alters priorities.
-   Do not claim that estimated study time guarantees mastery.

Example sequence for a Machine Learning Engineer may include Python
foundations, mathematics/statistics, machine learning concepts, model
evaluation, and practical projects. Actual sequence must adapt to the
student's assessed gaps and prerequisite relationships.

## 5.9 Learning Resource Catalogue and Recommendations

Resource types may include:

-   YouTube videos/channels.
-   Udemy courses.
-   Official documentation.
-   Free courses.
-   Coding practice platforms.
-   Books/reference materials.
-   Certifications where relevant.

Each resource record should include:

-   Title.
-   Skill/topic relationship.
-   Platform/provider.
-   Resource type.
-   Difficulty.
-   Direct URL.
-   Estimated duration if known.
-   Free/paid status only when verified.
-   Short description and reason for recommendation.
-   Active/verified status and last-checked date where maintained.

For important topics, try to offer: 1. **Learn:** video or course. 2.
**Reference:** official documentation or reliable reference. 3.
**Practice:** exercises, coding problems, or a mini-project.

Features: - Topic-specific resource matching. - Filter by platform,
type, difficulty, and free/paid when known. - Save/bookmark a
resource. - Open the original provider. - Mark a resource as
completed. - Revisit saved resources from the roadmap.

Start with curated, seeded resources and valid URLs. Never fabricate
URLs, prices, or course details. If a direct link cannot be verified,
provide a known provider/search page or mark the resource unavailable.
The core application must not depend on live web scraping.

## 5.10 Project Recommendations

Recommend practical projects connected to the student's target career
and skill gaps.

Each project should contain:

-   Title and description.
-   Difficulty.
-   Skills developed.
-   Prerequisites.
-   Tools/technologies.
-   Expected deliverables.
-   Milestones/checklist.
-   Optional trusted reference or starter link.

Student actions: - Save a project. - Mark it planned, in progress, or
completed. - Add a GitHub repository or project URL. - Track project
completion.

A future project evaluator may provide rubric-based feedback on a
submitted project or repository, but it must not claim a formal code
review unless one is actually performed.

## 5.11 Student Dashboard

Build a responsive dashboard that aggregates real backend data:

-   Welcome message and target career.
-   Profile completion.
-   Total skills selected and assessed.
-   Skills meeting target.
-   Skills needing improvement.
-   Critical gaps and not-assessed skills.
-   Skill proficiency comparison chart.
-   Current roadmap milestone.
-   Roadmap completion and remaining milestones.
-   Estimated remaining effort where available.
-   Recent assessments and completed activities.
-   Assessment score trends.
-   Recent project/resource activity.
-   A context-aware next recommended action.

The next action must derive from the user's real state. Examples include
taking an uncompleted assessment, reviewing a weak topic, completing a
milestone, or retesting after learning.

Include loading, empty, error, and first-time-user states. Do not use
hardcoded demo values once backend integration is complete.

## 5.12 Progress Tracking and Retesting

Persist and display:

-   All assessment attempts and scores.
-   Historical proficiency estimates.
-   Completed roadmap milestones.
-   Resource completion state.
-   Project progress.
-   Activity timestamps.
-   Career-specific progress.

Compare current and earlier assessment results and display the
difference in percentage points. Keep theoretical assessment performance
separate from practical project evidence.

Do not claim to know how long a student studied or watched an external
video unless the application has reliable data for it.

Retesting should: - Create a new attempt. - Compare results with
previous attempts. - Identify persistent weak topics. - Update the
skill-gap analysis. - Reprioritize roadmap activities. - Preserve the
complete history.

## 5.13 AI Learning Assistant (Advanced)

Implement only after the deterministic core MVP works.

Possible capabilities: - Explain technical concepts in simpler
language. - Explain incorrect MCQ answers. - Provide examples and
practice questions. - Give hints and step-by-step guidance. - Recommend
a next topic based on the current roadmap. - Use the user's selected
career and assessed weak topics for personalization.

Use Groq through a backend service. Never expose the API key to the
browser.

Requirements: - The app must remain usable if the AI provider is
unavailable. - Keep prompts and response schemas controlled. - Validate
generated structured data before using it. - Do not allow the AI to
modify stored assessment scores or calculated gap statuses. - Do not let
the AI invent direct URLs or claim it verified a resource. - Clearly
label generated guidance as AI-assisted. - Keep conversations tied to
the authenticated user. - Apply sensible limits and error handling.

RAG over curated course material or approved documentation can be a
later extension.

## 5.14 Career Comparison and AI Career Exploration (Extended)

-   Compare two or more careers.
-   Show shared skills and role-specific skills.
-   Compare current preparation with each career's requirements.
-   Highlight transferable skills.
-   Show additional skills and roadmap work likely needed.
-   Let students change target career without losing historical
    assessments or completed learning activities.
-   Optionally explain career options based on stated interests,
    background, and preferred technologies.

Avoid claiming that the system can definitively determine the perfect
career for a student.

## 5.17 Placement-Readiness Indicator (Extended)

Create an explainable indicator based on available evidence such as:

-   Required skill assessments.
-   Completion of key roadmap milestones.
-   Practical project evidence.
-   Resume completeness, if analyzed.
-   Mock interview results, if available.

Show separate subscores where possible. Explain missing evidence and the
factors that lower the indicator. Make the formula and weights
transparent and configurable. Mark results provisional when evidence is
incomplete.

Do not label a student Industry-Ready based solely on MCQs, or guarantee
employability.

## 5.18 Internship and Job Matching (Future)

Only implement once a reliable, permitted job-listing data source has
been selected and configured.

Potential features: - Browse internships and entry-level roles. - Filter
by role, location, skills, experience, and other available listing
data. - Compare job requirements with assessed skills and profile. -
Identify matched, missing, and not-assessed requirements. - Recommend
relevant learning activities. - Save opportunities and optionally track
application status. - Explain why a listing was recommended.

Do not fabricate listings, scrape websites against their terms, or
present a match score as the probability of getting hired.

------------------------------------------------------------------------

## 6. Data Model Guidance

Design a normalized relational schema. Adapt names as appropriate, but
preserve the relationships and behavior.

Suggested entities:

-   `users`: identity, email, password hash, role, timestamps.
-   `student_profiles`: academic details, interests, learning
    preferences, study availability.
-   `skills`: canonical skill catalogue and categories.
-   `student_skills`: self-declared skill selections and optional
    experience metadata.
-   `careers`: role descriptions and catalogue metadata.
-   `career_skill_requirements`: career-to-skill mapping, target
    proficiency, importance/weight.
-   `skill_topics`: topics belonging to a skill and prerequisite
    relationships where needed.
-   `questions`: question text, skill/topic, difficulty, explanation,
    active status.
-   `question_options`: answer options and correctness, protected from
    pre-submission exposure.
-   `assessments`: attempt owner, skill, timestamps, score, result
    metadata.
-   `assessment_answers`: selected option and correctness for each
    question in an attempt.
-   `resources`: title, provider, type, URL, topic/skill mapping,
    metadata and verification status.
-   `projects`: project metadata, difficulty, prerequisites and
    associated skills.
-   `student_projects`: user progress, repository URL and timestamps.
-   `roadmaps`: owner, career, version, timestamps and status.
-   `roadmap_milestones`: ordered skill/topic activities, priorities,
    estimates, prerequisites and status.
-   `student_resources` or `resource_progress`: saved/completed resource
    state.
-   `activity_events` (optional): meaningful student activity history.
-   `ai_conversations` and `ai_messages` (advanced feature only).
-   `resume_analyses` (advanced feature only; avoid storing unnecessary
    raw resume data).
-   `mock_interviews` and `mock_interview_answers` (advanced feature
    only).

Use foreign keys, uniqueness constraints, indexes, created/updated
timestamps, and appropriate cascade behavior. Consider soft-deactivation
for shared catalogue items that are already referenced by student
records. Store sensitive data minimally.

Do not create every advanced table before its feature is implemented if
doing so creates unnecessary complexity. Use migrations for schema
changes.

------------------------------------------------------------------------

## 7. API Design Guidance

Use versioned REST endpoints, for example `/api/v1/...`. Exact endpoint
names may vary, but keep the API consistent and document it.

Possible endpoint groups:

### Authentication

-   `POST /api/v1/auth/register`
-   `POST /api/v1/auth/login`
-   `POST /api/v1/auth/logout` if the chosen token strategy requires it
-   `GET /api/v1/auth/me`
-   `POST /api/v1/auth/refresh` only if refresh tokens are implemented

### Profile

-   `GET /api/v1/profile`
-   `PUT /api/v1/profile`
-   `GET /api/v1/skills`
-   `GET /api/v1/careers`

### Career selection and analysis

-   `GET /api/v1/careers/{career_id}`
-   `PUT /api/v1/profile/target-career`
-   `GET /api/v1/careers/compare` or a clearly documented comparison
    endpoint
-   `GET /api/v1/skill-gap`
-   `POST /api/v1/skill-gap/recalculate`

### Assessments

-   `POST /api/v1/assessments` to create an attempt
-   `GET /api/v1/assessments/{assessment_id}`
-   `POST /api/v1/assessments/{assessment_id}/submit`
-   `GET /api/v1/assessments/history`
-   `GET /api/v1/assessments/{assessment_id}/result`

### Roadmap and progress

-   `GET /api/v1/roadmap`
-   `POST /api/v1/roadmap/generate`
-   `PATCH /api/v1/roadmap/milestones/{milestone_id}`
-   `GET /api/v1/progress`
-   `GET /api/v1/dashboard`

### Resources and projects

-   `GET /api/v1/resources`
-   `POST /api/v1/resources/{resource_id}/save`
-   `PATCH /api/v1/resources/{resource_id}/progress`
-   `GET /api/v1/projects`
-   `POST /api/v1/projects/{project_id}/save`
-   `PATCH /api/v1/projects/{project_id}/progress`

### AI (later)

-   `POST /api/v1/ai/assistant/messages`
-   `POST /api/v1/ai/career-recommendations`
-   `POST /api/v1/ai/roadmap-explanation`

Use Pydantic request/response schemas. Do not expose ORM objects
blindly. Validate ownership and authorization in the backend. Return
appropriate HTTP status codes and consistent error structures.

------------------------------------------------------------------------

## 8. Frontend UX and Design Requirements

Create a polished, modern, student-friendly product. Avoid a generic
unstyled admin template.

### Main application areas

-   Public landing page.
-   Registration and login.
-   Onboarding/profile.
-   Student dashboard.
-   Career catalogue and career detail.
-   Skill selection.
-   Assessment experience.
-   Assessment result.
-   Skill-gap report.
-   Learning roadmap.
-   Resource catalogue/detail.
-   Project recommendations.
-   Progress/history.
-   Account settings.
-   Admin pages for authorized admins.

### UI behavior

-   Responsive layouts for desktop, tablet, and mobile.
-   Consistent spacing, typography, colors, and reusable components.
-   Clear page hierarchy and navigation.
-   Forms with inline validation.
-   Confirmation before destructive or irreversible actions.
-   Loading skeletons or spinners.
-   Useful empty states for new users.
-   Friendly, actionable error messages.
-   Toasts or inline feedback for successful actions.
-   Accessible labels, keyboard navigation, visible focus states, and
    sufficient contrast.
-   Charts with readable labels and accessible summaries.
-   Clear status labels; do not rely on color alone.
-   No dead buttons, placeholder links, or decorative controls that do
    nothing.
-   No fake dashboard metrics once real backend data is available.

The landing page should clearly communicate the product value and guide
new students to register or sign in.

------------------------------------------------------------------------

## 9. Security, Privacy, and Reliability

Implement security from the beginning:

-   Hash passwords with a maintained secure library.
-   Keep secrets in environment variables.
-   Include `.env.example` but never commit `.env`.
-   Validate inputs on both frontend and backend.
-   Enforce user ownership for private records.
-   Enforce admin roles server-side.
-   Never return correct MCQ answers before submission.
-   Calculate scores on the backend.
-   Use safe upload validation for resume files.
-   Apply appropriate CORS settings.
-   Avoid logging passwords, tokens, API keys, or sensitive resume
    content.
-   Add rate limiting where appropriate.
-   Handle database and AI provider failures gracefully.
-   Use transactions for multi-step writes where appropriate.
-   Add database migrations.
-   Provide account-data deletion/retention behavior appropriate to the
    implementation.
-   Do not send private student data to an AI provider unless needed,
    disclosed, and appropriately handled.

------------------------------------------------------------------------

## 10. Environment Configuration

Provide a `.env.example` with documented placeholders such as:

``` dotenv
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/skillbridge_ai
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
GROQ_API_KEY=
GROQ_MODEL=
```

Adjust the database driver and variable names to match the actual
implementation. Never use the example secret in production. Do not
require `GROQ_API_KEY` for the core MVP.

If email recovery is implemented, add documented email-provider
configuration. If it is not configured, explain the limitation in the
README and UI.

------------------------------------------------------------------------

## 11. Seed Data

The application should be useful immediately after setup. Provide
repeatable seed scripts for:

-   Initial technology skills and topics.
-   The initial career catalogue.
-   Career-to-skill requirements and target levels.
-   A curated set of MCQs for each supported initial skill.
-   Learning resources with known, sensible URLs.
-   Starter project recommendations.

Seed scripts must be safe to rerun without creating duplicates. Keep
seed data in maintainable files or seed modules rather than embedding
large lists inside request handlers.

Do not claim a resource is verified unless it has actually been
reviewed. Include enough curated questions and resources for a
meaningful demonstration; avoid presenting a career or skill as fully
supported if it has too little content.

------------------------------------------------------------------------

## 12. Testing and Acceptance Criteria

### Authentication

-   A user can register, log in, and access protected pages.
-   Invalid credentials are rejected.
-   Passwords are not stored as plaintext.
-   One user cannot access another user's private records.
-   Refreshing the browser restores valid authentication according to
    the chosen token design.

### Assessment

-   Questions are retrieved for the selected skill.
-   Correct answers are not exposed before submission.
-   Backend scoring returns the correct result for known test cases.
-   Invalid question IDs/options are rejected.
-   Duplicate submission is prevented.
-   Retakes create new attempts.
-   Assessment history is preserved.

### Skill-gap analysis

-   Required career skills are compared against assessed results.
-   Not-assessed skills remain distinct from Beginner.
-   Target-met and gap statuses follow deterministic rules.
-   Priority ranking is explainable and reproducible.
-   Charts match API results.

### Roadmap

-   Roadmap milestones reflect actual gaps and prerequisites.
-   Students can update milestone status.
-   Completion survives logout/login and page refresh.
-   Updating a roadmap preserves completed work where still relevant.
-   Estimated effort is clearly identified as approximate.

### Resources

-   Links come from stored resource records.
-   The system does not invent direct URLs.
-   Students can save/complete resources.
-   Unavailable resources are handled clearly.

### Dashboard and progress

-   Metrics are calculated from real data.
-   Empty/new-user states are helpful.
-   Score trends use actual historical attempts.
-   Progress persists after refresh and login.

### General quality

-   Core user flows work without an AI API key.
-   Backend tests cover scoring, authorization, and gap calculations.
-   Frontend handles loading, empty, success, and error states.
-   Database migrations and seed scripts work from a clean setup.
-   No important button or link is inert.
-   Setup instructions are accurate and reproducible.

------------------------------------------------------------------------

## 13. Out of Scope for the Initial MVP

Do not delay the core product by implementing all of the following
immediately:

-   AI-generated question banks without review.
-   Resume parsing and analysis.
-   AI mock interviews.
-   Live job scraping or third-party job integrations.
-   Automated repository/code evaluation.
-   Voice interview support.
-   Email/browser notifications requiring additional infrastructure.
-   Complex RAG pipelines.
-   Predictive claims about hiring outcomes.

Build the architecture so these features can be added later, but
prioritize a stable end-to-end MVP.

------------------------------------------------------------------------

## 14. Instructions to the AI Coding Agent

Treat this README as the product requirements document.

1.  **Inspect the existing repository first.** If code already exists,
    understand it and extend it without unnecessarily replacing working
    functionality.
2.  **Plan before editing.** Summarize the implementation approach and
    identify any important assumptions.
3.  **Implement in phases.** Complete and verify one phase before
    starting the next. Do not generate the entire application as
    disconnected mock screens.
4.  **Create real backend functionality.** Frontend screens must use
    actual API calls and persistent database records.
5.  **Use clean architecture.** Separate API routes, business
    logic/services, database models, schemas, authentication, and
    configuration.
6.  **Keep calculations deterministic.** Assessment scores, proficiency
    levels, skill gaps, priorities, and progress metrics must be
    calculated by backend logic.
7.  **Seed usable demo content.** Provide initial careers, skills, MCQs,
    resources, and projects so the application can be demonstrated after
    setup.
8.  **Do not fabricate content.** Use real resource URLs where known;
    otherwise mark a resource as needing verification.
9.  **Implement useful UI states.** Loading, empty, error, success, and
    validation states are part of the feature, not optional polish.
10. **Protect data.** Enforce authentication, ownership, and admin
    authorization at the backend.
11. **Add tests.** At minimum, test authentication boundaries,
    assessment scoring, duplicate submission handling, skill-gap rules,
    and roadmap persistence.
12. **Keep setup reproducible.** Add dependency manifests, migrations,
    seed scripts, `.env.example`, and clear run instructions.
13. **Update documentation.** Document implemented features,
    configuration, commands, API behavior, seed data, and known
    limitations.
14. **Do not silently skip requirements.** If a requirement cannot be
    implemented, state why and document the limitation.
15. **Do not claim a feature is complete unless it works.** Avoid
    TODO-only implementations for core MVP requirements.
16. **Report progress clearly.** At the end of each phase, summarize
    files/modules changed, commands run, tests passed, and remaining
    work.
17. **Do not expose secrets.** Never write API keys or real credentials
    into code, logs, or documentation.
18. **Keep advanced features behind clear boundaries.** The core MVP
    must run without the Groq API key.

### Expected completion deliverables

-   Working React frontend.
-   Working FastAPI backend.
-   PostgreSQL schema and migrations.
-   Repeatable seed data.
-   Authentication and authorization.
-   Functional core MVP flows.
-   API documentation.
-   `.env.example`.
-   Frontend and backend dependency manifests.
-   Test suite for critical business rules.
-   Clear setup and troubleshooting instructions.
-   A list of features implemented and any remaining limitations.

------------------------------------------------------------------------

## 15. Definition of Done for the Core MVP

The core MVP is complete only when a new student can perform this full
flow:

1.  Register and log in.
2.  Complete their profile.
3.  Select technical skills.
4.  Choose a target career.
5.  Take an MCQ assessment for a selected skill.
6.  Receive a backend-calculated score and proficiency estimate.
7.  View strong and weak topics.
8.  See how assessed skills compare with the selected career's
    requirements.
9.  View prioritized skill gaps.
10. Receive an ordered roadmap with useful learning resources.
11. Mark milestones and resources as complete.
12. Return later and see persisted progress.
13. Retake the assessment.
14. See historical score changes and an updated skill-gap report.
15. Use the main product without requiring an AI API key.

**Final instruction:** Prioritize correctness, integration, security,
and a usable end-to-end student journey over adding many unfinished
features. Build SkillBridge AI as a real application that can be run
locally, tested, demonstrated, and extended.
