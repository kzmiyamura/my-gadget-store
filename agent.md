# My Gadget Store - Project Rules

## Tech Stack
- Frontend: Angular 19+ (Vite)
- Backend: NestJS
- Language: TypeScript
- Database: PostgreSQL (Docker)

## Frontend Testing Stack
- Vitest: Primary test runner (fast and integrated with Vite)
- Angular Testing Library: For component behavior testing
- Mock Service Worker (MSW): To mock API responses

## Development Rules
- Business Logic: Write unit tests in `src/utils` or services.
- Components: Write interaction tests in `src/components`.
- API: Always use MSW for integration tests.