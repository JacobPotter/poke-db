# PokeDB

Online Pokedex. Frontend written in React Typescript and Tailwind CSS. Backend api written in Go with Gin and GORM frameworks, with PostgresDB support. Data provided by [Pokeapi](https://pokeapi.co/) via batch scripts run as scheduled jobs on api server.

For live version, please visit [Poke-DB](https://poke-db.webwizardssoftware.com)

<img width="1512" alt="Screenshot 2024-10-30 at 12 44 35 PM" src="https://github.com/user-attachments/assets/a7ec3b94-6fbd-462e-abbc-25a3302e8834">

---

## Prerequisites

Ensure you have the following installed locally:
- [Go](https://go.dev/) (v1.23 or later)
- [Node.js](https://nodejs.org/) (v18 or later) & `npm`
- [PostgreSQL](https://www.postgresql.org/) (running locally or in a container)

---

## Local Development

### 1. Database Setup
Create a PostgreSQL database (e.g. `pokedb`):
```sql
CREATE DATABASE pokedb;
```

### 2. Backend API
1. Navigate to the `api` directory:
   ```bash
   cd api
   ```
2. Create a `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=pokedb
   PORT=8080
   ```
3. Run the API server (migrations are run automatically on startup):
   ```bash
   go run main.go
   ```
   The API will start at `http://localhost:8080`.

### 3. Database Seeding & Data Refresh

There are two ways to seed and populate your local database:

#### Option 1: Offline Mock Database Dump (Instant & Recommended for Fast Setup)
Restore the pre-generated PostgreSQL SQL dump file (`api/seed/mock-dump.sql`) to immediately populate your database with schema tables, sequences, and seed data without making external network calls:

> **Note**: For best results, import the SQL dump into a freshly created database before starting the API server for the first time.

- **From repository root**:
  ```bash
  psql -h localhost -U postgres -d pokedb -f api/seed/mock-dump.sql
  ```

- **From `api/` directory**:
  ```bash
  cd api
  psql -h localhost -U postgres -d pokedb -f seed/mock-dump.sql
  ```

*(Adjust `-h`, `-U`, or `-d` if your database host, user, or name differs from the defaults in `.env`)*

#### Option 2: Live PokeAPI Data Ingestion
The backend includes a data ingestion job (`jobs.RefreshDB`) in `api/jobs/refresh-db.go` that fetches live Pokémon species, moves, items, types, locations, and evolution chains from the PokeAPI.

##### Quick Sample Seed (Live Subset)
Populates a small sample subset (~50 records per category) for rapid local development:
```bash
cd api
go test -v ./jobs -run TestRefreshDBSuite
```

##### Full Database Seed (Live Ingestion)
Fetches the complete dataset (~1,500 Pokémon and full associations). Because this makes extensive API calls to PokeAPI, pass an extended timeout:
```bash
cd api
FULL_SEED_TEST=true go test -v -timeout 30m ./jobs -run TestRefreshDBSuite
```

#### Background Job Scheduling
The API server also integrates `github.com/bamzi/jobrunner` to run scheduled background refresh jobs. You can inspect scheduled job status and execution history via the JobRunner dashboard at `http://localhost:8080/jobrunner/html`.

### 4. Frontend Client
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`. API requests sent to `/api` are automatically proxied to `http://localhost:8080`.

---

## Testing

### Backend API Tests
Run the Go test suite:
```bash
cd api
go test -v ./...
```
*Note: Ensure test database connection parameters are available in `.env` as integration tests connect to the database.*

### Frontend Tests
Run Vitest browser tests:
```bash
cd frontend
npm test
```
Or run tests in headless/CI mode:
```bash
npx vitest run
```

Run linter:
```bash
npm run lint
```

---

## Developer Tooling & UI

- **Swagger API Docs**: `http://localhost:8080/swagger/index.html`
- **JobRunner Dashboard**: `http://localhost:8080/jobrunner/html`
- **Storybook UI Component Explorer**:
  ```bash
  cd frontend
  npm run storybook
  ```
  Accessible at `http://localhost:6006`.
