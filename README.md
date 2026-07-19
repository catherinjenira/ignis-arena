# Ignis Arena - Autonomous Stadium Intelligence Platform

Ignis Arena is the world's first autonomous stadium intelligence operating system, designed to manage crowd safety, energy harvesting, stadium logistics, and fan engagement.

## Chosen Vertical: Autonomous Stadium Intelligence
Ignis Arena operates as a smart assistant and decision-making console for the Stadium CEO, Security Chief, and operators to orchestrate dynamic events and handle emergencies.

## Approach & Logic
- **Gen AI Assistant**: Integrates the **Gemini 3.5 Flash** model (via `@google/genai`) to power the `/api/chat` and `/api/simulate` endpoints.
- **MySQL Integration**: Migrated the user account storage from flat JSON files to a relational MySQL database structure for scalability.
- **Gen AI Cache**: Implemented a query-cache layer in MySQL (`ai_cache` table) with SHA-256 keys of prompt inputs. If the same simulation type or chat query is requested, the system serves the cached response directly to protect the API quota.
- **Security & Authentication**: Passwords hashed with SHA-256 + unique random salts. Credentials and configurations are loaded securely using `.env` variables.

## How the Solution Works
1. **User Sign Up & Role Assignment**: Operators can register and log in as either the `Director`, `Security Chief`, or `Fan`.
2. **Interactive Simulation Panel**: Run simulations such as hosting standard matches, emergency disaster evacuations, or optimizing resources.
3. **AI Council Dialogues**: When simulations run, the AI council (consisting of security, medical, energy, weather, and broadcast divisions) collaborates to evaluate the impact and propose a plan.
4. **Digital Twin Monitor**: Visualize crowd density, energy usage, food stall queues, and localized markers.

## Assumptions Made
- The local environment has access to a MySQL server running on `localhost` with the user `root` and password `Catherin@07`.
- The database `ignis_arena` is auto-created on startup if it does not already exist.

## Run Locally

**Prerequisites:** Node.js, MySQL Server

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   DB_HOST="localhost"
   DB_USER="root"
   DB_PASSWORD="Catherin@07"
   DB_NAME="ignis_arena"
   ```
3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
