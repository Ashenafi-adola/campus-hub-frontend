# CampusHub Frontend

The frontend for **CampusHub**, a university-focused social platform where students can ask questions, share knowledge, join communities, discuss courses, discover events, and connect with other students.

Built with **Next.js, TypeScript, and Tailwind CSS**, communicating with a Django REST API backend.

> **Your campus. Your community.**

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Axios
- JWT authentication
- React Hooks
- WebSockets / Django Channels
- ESLint

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   └── forgot-password/
│   │   ├── (main)/
│   │   │   ├── page.tsx
│   │   │   ├── communities/
│   │   │   ├── courses/
│   │   │   ├── events/
│   │   │   ├── search/
│   │   │   └── saved/
│   │   ├── u/[username]/
│   │   ├── c/[slug]/
│   │   ├── posts/[id]/
│   │   ├── messages/[conversationId]/
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── common/
│   ├── features/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── communities/
│   │   ├── posts/
│   │   ├── comments/
│   │   ├── votes/
│   │   ├── notifications/
│   │   ├── moderation/
│   │   ├── courses/
│   │   ├── events/
│   │   └── messaging/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── utils/
├── .env.local
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture

### `app/`
Next.js routes and pages.

### `components/`
Reusable UI components such as buttons, modals, inputs, navigation, avatars, and loading states.

### `features/`
Domain-specific functionality. For example:

```text
features/posts/
├── components/
├── hooks/
├── services/
└── types/
```

### `services/`
API communication with Django.

```text
services/
├── auth.service.ts
├── users.service.ts
├── communities.service.ts
├── posts.service.ts
└── comments.service.ts
```

### `lib/`
Configured libraries and shared infrastructure such as Axios and WebSocket clients.

### `hooks/`
Reusable React hooks.

### `types/`
Shared TypeScript interfaces and types.

### `utils/`
Small reusable helper functions.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

Create `.env.example` with the same variable names but no secrets:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=
```

Never commit `.env.local` or production secrets.

### 3. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The Django backend runs separately:

```text
http://localhost:8000
```

## API Integration

The frontend uses the versioned Django API:

```text
/api/v1/
```

Main API areas:

```text
/api/v1/auth/
/api/v1/users/
/api/v1/universities/
/api/v1/communities/
/api/v1/posts/
/api/v1/comments/
/api/v1/votes/
/api/v1/notifications/
/api/v1/moderation/
/api/v1/courses/
/api/v1/events/
/api/v1/messages/
```

Example:

```text
GET  /api/v1/posts/
POST /api/v1/posts/
GET  /api/v1/communities/
```

## Authentication

CampusHub uses JWT authentication.

```text
User
  ↓
Login
  ↓
Django API
  ↓
Access + Refresh tokens
  ↓
Frontend
  ↓
Authenticated API requests
```

Authenticated requests use:

```http
Authorization: Bearer <access_token>
```

Axios will be configured centrally so authentication behavior does not need to be duplicated throughout page components.

## Main Features

### Authentication
- Registration
- Login/logout
- Email verification
- Password recovery
- JWT authentication
- Protected routes

### Universities
- University selection
- University profiles
- University verification
- University-specific communities

### Communities
- Browse communities
- Create communities
- Join/leave
- Community pages
- Members and moderators

### Posts
- Create/edit/delete posts
- Text, image, link and question posts
- Save posts
- Report posts

### Comments & Voting
- Comments
- Nested replies
- Upvotes/downvotes
- Accepted answers

### Feed & Discovery
- Personalized feed
- Popular posts
- New posts
- Search posts, communities, users and courses

### Social
- Profiles
- Follow/unfollow
- Saved posts
- Notifications

### Courses & Events
- Course discussions
- Course resources
- Campus events
- Event attendance

### Messaging
- Conversations
- Real-time messages
- Online/read status

## Routes

```text
/                       Home
/login                  Login
/register               Register
/verify-email           Email verification
/forgot-password        Password recovery

/communities            Communities
/c/[slug]               Community
/posts/[id]             Post details

/search                 Search
/saved                  Saved posts
/u/[username]           User profile

/courses                Courses
/events                 Events
/messages/[id]          Conversation
/settings               Settings
```

## Development Workflow

For a new feature:

```text
1. Define API contract
        ↓
2. Create TypeScript types
        ↓
3. Create API service
        ↓
4. Create reusable components
        ↓
5. Create feature hooks
        ↓
6. Build the page
        ↓
7. Handle loading/error/empty states
        ↓
8. Add tests
```

For example:

```text
types/community.ts
        ↓
services/communities.service.ts
        ↓
features/communities/
        ↓
app/(main)/communities/
```

Keep API/business logic out of large page components whenever possible.

## UI Principles

CampusHub uses a clean, modern university-focused design:

- Light backgrounds
- Deep navy text
- Blue primary actions
- Soft borders
- Rounded cards
- Subtle shadows
- Accessible contrast
- Responsive layouts
- Spacious content areas

The interface should feel modern, friendly, academic, simple, and community-oriented.

## Error & Loading States

The frontend should explicitly handle:

```text
Loading
Empty
Success
Error
Unauthorized
Forbidden
Not Found
Network Error
```

## Testing

Run linting:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

Start the production build:

```bash
npm run start
```

Planned test coverage includes components, forms, authentication, API behavior, protected routes, and critical user flows.

## Production

Production environment variables should point to the deployed backend:

```env
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.example.com/ws
```

Do not put secrets in `NEXT_PUBLIC_*` variables because they can be exposed to browser-side code.

## Docker

Planned architecture:

```text
Browser
   │
   ├── Next.js Frontend
   │      Port 3000
   │
   └── Django Backend
          Port 8000
             │
       ┌─────┴─────┐
       ↓           ↓
  PostgreSQL     Redis
```

## Development Roadmap

### Phase 1 — Foundation
- [x] Next.js project
- [x] TypeScript
- [x] Tailwind CSS
- [ ] API configuration
- [ ] Environment configuration
- [ ] Global layout

### Phase 2 — Authentication
- [ ] Registration
- [ ] Login/logout
- [ ] JWT handling
- [ ] Email verification
- [ ] Protected routes

### Phase 3 — Communities
- [ ] Community listing
- [ ] Community creation
- [ ] Join/leave
- [ ] Community page
- [ ] Moderation roles

### Phase 4 — Posts
- [ ] Feed
- [ ] Create post
- [ ] Post details
- [ ] Edit/delete
- [ ] Save post
- [ ] Image upload

### Phase 5 — Comments & Voting
- [ ] Comments
- [ ] Nested replies
- [ ] Voting
- [ ] Accepted answers

### Phase 6 — Discovery
- [ ] Search
- [ ] Popular posts
- [ ] New posts
- [ ] Community discovery

### Phase 7 — Social
- [ ] Profiles
- [ ] Follow/unfollow
- [ ] Saved posts
- [ ] Notifications

### Phase 8 — Advanced
- [ ] Courses
- [ ] Events
- [ ] Messaging
- [ ] WebSockets
- [ ] Moderation dashboard

### Phase 9 — Production
- [ ] Testing
- [ ] API documentation
- [ ] Docker production setup
- [ ] CI/CD
- [ ] Frontend deployment
- [ ] Custom domain

## Git Workflow

Create a feature branch:

```bash
git checkout -b feature/authentication
```

Commit changes:

```bash
git add .
git commit -m "feat: add authentication UI"
```

Push:

```bash
git push origin feature/authentication
```

Suggested prefixes:

```text
feat:     New feature
fix:      Bug fix
refactor: Code restructuring
style:    Styling
test:     Tests
docs:     Documentation
chore:    Maintenance
```

## Security Principles

- Never commit `.env.local` or secrets.
- Never put private secrets in `NEXT_PUBLIC_*`.
- Use HTTPS in production.
- Do not rely on frontend validation for authorization.
- Django must enforce authentication, permissions, and validation.
- Handle expired tokens and unauthorized responses consistently.

## Project Principles

1. Type safety
2. Reusable components
3. Feature-based organization
4. Separation of UI and API logic
5. Accessible UI
6. Responsive design
7. Clear error handling
8. Secure authentication
9. Maintainable code
10. Simple before complex

## Backend

The frontend communicates with the CampusHub Django backend, which provides the REST API, authentication, database access, business logic, WebSockets, notifications, moderation, and search.

```text
apps/backend/
```

## License

CampusHub is currently being developed as a portfolio project.