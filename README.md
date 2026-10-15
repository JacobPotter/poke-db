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

### 3. Frontend Client
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
