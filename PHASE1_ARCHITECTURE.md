# CampusConnect - Phase 1: Requirements and Architecture

## 1. Repository assessment

The repository contains only the academic PDF, the complete development prompt, and four UI reference images. It does not yet contain an application, source code, database configuration, or test suite.

## 2. Scope

CampusConnect is a responsive Next.js platform for students to publish help requests, offer assistance, organize study sessions, review participants, and consult personal activity. Administrators moderate reported publications and manage account status.

The core journey is:

1. A visitor registers and authenticates.
2. A student publishes a help request.
3. Other students submit proposals.
4. The request owner accepts one proposal.
5. A study session is created.
6. Participants complete the session and submit reviews.
7. The request is completed and the activity appears in dashboards.

## 3. Actors and permissions

| Actor | Permissions |
|---|---|
| Visitor | View public landing and authentication pages; register and log in |
| Student | Manage own profile; publish and search requests; submit proposals; manage own proposals and received proposals; manage participant sessions; submit eligible reviews; report publications; view notifications |
| Administrator | View and inspect reports; hide or restore publications; resolve reports; view users; suspend or reactivate accounts |

All sensitive operations are authorized again in the Server Actions or route handlers. UI access checks are never the only protection.

## 4. Functional requirements

- Registration, credential login, logout, session management, profile management, and role-based routing.
- Persistent student profile: name, email, picture, specialty, level, biography, skills, and availability.
- Help requests with title, description, subject, required level, availability, author, publication date, and status.
- Database-backed search and combined filters: keyword, subject, level, status, sorting, pagination, and reset.
- Help proposals with message and status.
- Study sessions with date, time, duration, meeting mode, location or URL, and status.
- Reviews with a 1-5 rating and comment after completed sessions.
- Student and administrator dashboards.
- Internal notifications and unread notification count.
- Report management.
- Transparent Smart Matching recommendations.
- Loading, empty, error, and success states; confirmation dialogs and responsive accessible navigation.

## 5. Business rules

### Requests

- Only the authenticated author can update or delete their request.
- Students cannot submit proposals to their own request.
- A completed or closed request cannot receive proposals.
- The workflow is `OPEN -> HELP_ACCEPTED -> COMPLETED`.
- No proposal acceptance is allowed once a request leaves `OPEN`.

### Proposals

- One student cannot submit duplicate pending or accepted proposals to the same request.
- Only the request owner may accept or reject proposals.
- Accepting a proposal atomically rejects all other pending proposals, sets the request to `HELP_ACCEPTED`, creates the session, and creates relevant notifications.
- A closed or completed request cannot accept new help.

### Sessions

- A session is created only after proposal acceptance.
- Only one of the session participants may complete or cancel it according to the authorized workflow.
- Completing a session sets it to `COMPLETED` and sets the associated request to `COMPLETED`.
- Cancellation does not complete the request unless explicitly defined by a domain rule.

### Reviews

- Reviews require a completed session.
- Only the two session participants may review.
- Participants cannot review themselves.
- A reviewer can submit at most one review for the same reviewed participant and session.
- Deletion or modification of a review is not required by the academic scope.

### Administration

- Only `ADMIN` accounts may access moderation operations.
- Moderation actions have explicit audit-relevant report and publication status.
- Suspended users cannot authenticate or perform student operations.

### Smart Matching

- The score is calculated in the application or domain layer.
- Suggested weights are transparent and bounded:
  - Skill overlap: 40%
  - Specialty match: 20%
  - Academic level compatibility: 15%
  - Availability overlap: 15%
  - Average rating: 10%
- The response includes matching skills, total compatibility, and a human-readable explanation.

## 6. Application workflows

### Registration and login

Register validates input, hashes the password, creates a user and student profile, and starts an authenticated session. Login must reject invalid credentials and inactive accounts.

### Accept proposal

1. Load the request and selected proposal.
2. Verify that the current student owns the request.
3. Verify that the request is `OPEN`.
4. Verify that the proposal is `PENDING`.
5. Run all status changes, session creation, and notification creation in one database transaction.
6. Reject every other pending proposal.

### Complete session

1. Verify that the current student is a participant.
2. Verify that the session is `SCHEDULED`.
3. Update the session to `COMPLETED`.
4. Update the associated request to `COMPLETED`.
5. Create notifications for both participants.

All verification and mutation steps are performed server-side.

## 7. Clean Architecture

```text
src/
  app/
  modules/
    users/
      domain/
      application/
      infrastructure/
      presentation/
    requests/
    proposals/
    sessions/
    reviews/
    notifications/
    reports/
    matching/
  shared/
    domain/
    application/
    infrastructure/
    presentation/
  components/
  lib/
tests/
  unit/
  integration/
  e2e/
prisma/
```

Dependency direction:

```text
Presentation -> Application -> Domain
Infrastructure -> Application / Domain
```

- Domain entities, value objects, enums, invariants, exceptions, and repository contracts contain no framework or database imports.
- Use Cases coordinate authorization, validation, transaction orchestration, and repository operations. They never import Prisma.
- Infrastructure owns Prisma repositories and explicit database-domain mappers.
- Presentation owns pages, components, Server Actions, route handlers, and Zod schemas.
- A composition root creates real repositories and injects them into use cases.

## 8. Prisma relational model

### Core entities

- `User`: credentials, role, account status, timestamps.
- `StudentProfile`: personal and academic profile fields, availability, and ratings derived from reviews.
- `Skill`: reusable skill name.
- `Subject`: normalized subject name.
- `Availability`: day, start/end time or structured time range.
- `HelpRequest`: title, description, subject, level, availability, author, status, timestamps.
- `HelpProposal`: request, student, motivation, status, timestamps.
- `StudySession`: request, owner, helping student, schedule, duration, meeting mode, location or URL, status, timestamps.
- `Review`: reviewer, reviewed student, session, rating, comment, timestamps.
- `Report`: reporter, publication target, reason, status, moderator, timestamps.
- `Notification`: recipient, type, message, read status, timestamps.

### Important relationships

- A `User` owns one optional `StudentProfile`.
- A `User` can author many requests and submit many proposals.
- A `Skill` is associated with many profiles; a profile can have many skills.
- A `Subject` can be associated with many requests.
- One request has many proposals and at most one accepted proposal.
- One accepted proposal creates one study session.
- A session has exactly two participants and many reviews.
- A review belongs to exactly one session and one reviewer/reviewed pair.
- Reports may reference a request or proposal; moderation must support publication hiding and restoration.
- Availability is owned by a student profile.

### Suggested enums

- `Role`: `STUDENT`, `ADMIN`
- `UserStatus`: `ACTIVE`, `SUSPENDED`
- `HelpRequestStatus`: `OPEN`, `HELP_ACCEPTED`, `COMPLETED`
- `HelpProposalStatus`: `PENDING`, `ACCEPTED`, `REJECTED`
- `StudySessionStatus`: `SCHEDULED`, `COMPLETED`, `CANCELLED`
- `MeetingMode`: `IN_PERSON`, `ONLINE`
- `ReportStatus`: `PENDING`, `RESOLVED`
- `ReportReason`: `INAPPROPRIATE`, `SPAM`, `HARASSMENT`, `OTHER`
- `NotificationType`: proposal, session, review, and moderation events

### Constraints and indexes

- Unique email on `User`.
- Unique proposal `(requestId, studentId)`.
- Unique session/review pair `(sessionId, reviewerId, reviewedStudentId)`.
- Foreign keys use explicit cascade/restrict behavior based on preservation needs.
- Index request subject, level, status, author, and publication date.
- Index proposal request and student; session participant and status; notification recipient and read status; report status and publication.

## 9. Main Use Cases

Authentication:
- `RegisterUser`
- `AuthenticateUser`
- `SuspendOrReactivateUser`

Profiles:
- `GetStudentProfile`
- `UpdateStudentProfile`

Requests:
- `CreateHelpRequest`
- `UpdateHelpRequest`
- `DeleteHelpRequest`
- `GetHelpRequest`
- `SearchHelpRequests`
- `CompleteHelpRequest`

Proposals:
- `CreateHelpProposal`
- `AcceptHelpProposal`
- `RejectHelpProposal`
- `GetReceivedProposals`

Sessions:
- `CreateStudySession`
- `CompleteStudySession`
- `CancelStudySession`
- `GetStudentSessions`

Reviews:
- `CreateReview`
- `GetStudentReviews`

Notifications:
- `GetNotifications`
- `MarkNotificationAsRead`
- `MarkAllNotificationsAsRead`

Reports and administration:
- `CreateReport`
- `GetReports`
- `ModerateReport`
- `HidePublication`
- `RestorePublication`

Matching:
- `RecommendStudents`
- `CalculateCompatibilityScore`

## 10. Module dependencies

1. Users defines identities, profiles, roles, account status, and authorization context.
2. Requests depends on users and subjects.
3. Proposals depends on requests and users.
4. Sessions depends on accepted proposals, requests, and users.
5. Reviews depends on sessions and users.
6. Notifications depends on users and domain events from requests, proposals, sessions, reviews, and reports.
7. Reports depends on users and the publication models they can target.
8. Matching depends on profiles, skills, availability, ratings, and requests.
9. Administration depends on reports and users.

No module should access another module's Prisma model directly. Inter-module communication uses use cases, domain contracts, or application DTOs.

## 11. Non-functional requirements

- Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Recharts.
- PostgreSQL through Prisma.
- Auth.js with credential password hashing.
- Zod and React Hook Form for validation.
- Vitest for unit and integration tests, Playwright for end-to-end tests.
- ESLint and Prettier.
- `.env.example` for all required secrets and database settings.
- Server-side authorization and resource ownership for every mutation.
- Pagination and database indexes for search.
- Seed accounts and realistic demonstration data.
- Responsive, accessible UI with loading, empty, error, and confirmation states.

## 12. Security decisions

- Never trust role or ownership values supplied by the client.
- Re-read protected resources in use cases or services.
- Use transactions for proposal acceptance and session completion.
- Hash passwords and never expose password fields in DTOs or API responses.
- Use parameterized Prisma queries and server-side Zod validation.
- Protect all administrator routes and operations.
- Prefer generic authentication errors and centralized application error handling.

## 13. Testing plan

Required unit scenarios:
- Proposal self-help rejection.
- Duplicate proposal prevention.
- Unauthorized accept/reject rejection.
- Proposal acceptance atomic workflow.
- Closed request proposal rejection.
- Review eligibility and duplicate prevention.
- Smart Matching score calculation.

Required integration scenarios:
- Registration and login.
- Persistent request and filter operations.
- Proposal acceptance and session creation.
- Session completion and request completion.
- Ownership and administrator authorization.
- Notification creation and read operations.

Required end-to-end scenarios:
- Student request-to-session journey.
- Unauthorized modification and administrator access attempts.
- Search/filter and reload persistence.
- Review submission after completion.
- Suspended account access.

Architectural tests must verify domain/framework independence and that use cases depend on repository interfaces rather than Prisma.

## 14. Implementation backlog

### Phase 2 - Project initialization

- Initialize Next.js, TypeScript, App Router, Tailwind CSS, shadcn/ui, and Lucide.
- Configure ESLint, Prettier, Vitest, and Playwright.
- Configure PostgreSQL, Prisma, Auth.js, Zod, and environment variables.
- Create the feature-based Clean Architecture folders.

### Phase 3 - Core architecture

- Implement domain entities, value objects, enums, errors, and repository contracts.
- Implement application ports and composition root.
- Implement Prisma repositories and mappers.
- Implement authentication and server-side authorization.
- Create migrations and seed data.

### Phase 4 - Core business modules

1. Users and profiles.
2. Help requests.
3. Help proposals.
4. Study sessions.
5. Reviews.

### Phase 5 - User interface

- Public landing page.
- Authentication pages.
- Student dashboard.
- Requests, proposals, sessions, profile, and notification pages.
- Administrator dashboard.

### Phase 6 - Advanced modules

- Notifications.
- Reports and moderation.
- Smart Matching.
- Statistics and charts.
- Final responsive UX states.

### Phase 7 - Testing and delivery

- Unit, integration, and end-to-end tests.
- Authorization verification.
- Persistence and reload verification.
- README and deployment documentation.
- Demonstration accounts and known limitations.

## 15. Phase 1 exit criteria

Phase 1 is complete when the architecture, actors, permissions, business rules, workflow, database model, modules, use cases, security boundaries, and ordered backlog are accepted. Implementation must remain paused until that validation.
