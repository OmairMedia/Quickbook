What problem does this project solve?

- Easy text/information save
- Same wifi network mode (Does not require login, should work offline)

Who are the users and what are the core user journeys ?

- ME
- Those who are on a weak laptop and dont want to run a background sticky notes software
- Those who want a quick same wifi network accesible content persistence

What are the non-negotiable features versus nice-to-haves ?

- Authentication (Because each user will have its own data)
- CRUD notes
- Network Accessibility Mode (Does not require login, should work offline)

What is the expected scale - 100 users or 100,000 ?

- 100 users

what is the team size and skill level ?

- 1 developer and intermetiete skill

what is the deployment environment and budget ?

- deployment on vercel free tier (SSR) - development mode
- 0 $ budget

Tech Stack

- Nuxt
- Drizzle ORM - Sqlite / Postgres

Auth Strategy
Cookie-based sessions (nuxt-auth-utils)

Divide the system into :-

Module
Layers
Responsibilities

Tech Lead Thinks in

Auth Layer
Data Layer
UI Primitives
Feature Modules
State Management
Validation
API Contracts
