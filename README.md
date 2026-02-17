# 💰 Finance Tracker — MVP

A secure personal finance tracker. Register, log transactions, and see your spending at a glance.

---

## ✅ MVP Features

| Feature | Status |
|---------|--------|
| Register / Login (JWT) | ✅ |
| Add income & expenses | ✅ |
| View all transactions | ✅ |
| Delete transactions | ✅ |
| Monthly dashboard summary | ✅ |
| Income vs Expense pie chart | ✅ |
| Category breakdown bar chart | ✅ |
| User data isolation | ✅ |

---

## 🏗 Architecture

```
finance-tracker/
├── backend/          # Spring Boot + PostgreSQL + JWT
│   ├── src/
│   │   └── main/java/com/financetracker/
│   │       ├── entity/         # User, Transaction
│   │       ├── repository/     # JPA repositories
│   │       ├── service/        # AuthService, TransactionService, DashboardService
│   │       ├── controller/     # AuthController, TransactionController, DashboardController
│   │       ├── dto/            # Request/response DTOs
│   │       ├── security/       # JwtService, JwtAuthenticationFilter
│   │       └── config/         # SecurityConfig, GlobalExceptionHandler
│   └── Dockerfile
├── frontend/         # React + Axios + Chart.js + Tailwind
│   ├── src/
│   │   ├── api/        # services.js, client.js (Axios with JWT interceptor)
│   │   ├── context/    # AuthContext (global auth state)
│   │   ├── pages/      # LoginPage, RegisterPage, DashboardPage, TransactionsPage
│   │   ├── components/ # Layout, SummaryCards, Charts, TransactionList, AddTransactionModal
│   │   └── App.js      # Routing (protected + public routes)
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Option A — Docker Compose (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Option B — Run locally

**Prerequisites:** Java 17+, Node 18+, PostgreSQL 15

**1. Database**
```sql
CREATE DATABASE finance_tracker;
```

**2. Backend**
```bash
cd backend
# Edit src/main/resources/application.properties if needed
mvn spring-boot:run
```

**3. Frontend**
```bash
cd frontend
npm install
npm start
```

---

## 📡 API Reference

### Auth (public)

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/auth/register` | `{ email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |

Both return: `{ token, email, userId }`

### Transactions (requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List all (newest first) |
| POST | `/api/transactions` | Create one |
| DELETE | `/api/transactions/{id}` | Delete (own only) |

**Create body:**
```json
{
  "amount": 50.00,
  "type": "EXPENSE",
  "category": "Food",
  "date": "2024-01-15",
  "description": "Groceries"
}
```

### Dashboard

| Method | Endpoint | Query Params |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | `?year=2024&month=1` (optional, defaults to current) |

**Response:**
```json
{
  "totalIncome": 3000.00,
  "totalExpense": 1250.75,
  "balance": 1749.25,
  "expenseByCategory": { "Food": 300.00, "Transport": 150.75 },
  "incomeByCategory": { "Salary": 3000.00 },
  "month": "2024-01"
}
```

---

## 🗃 Database Schema

```sql
-- users
CREATE TABLE users (
  id       BIGSERIAL PRIMARY KEY,
  email    VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role     VARCHAR NOT NULL DEFAULT 'USER'
);

-- transactions
CREATE TABLE transactions (
  id          BIGSERIAL PRIMARY KEY,
  amount      DECIMAL(12, 2) NOT NULL,
  type        VARCHAR NOT NULL,           -- INCOME | EXPENSE
  category    VARCHAR NOT NULL,
  date        DATE NOT NULL,
  description VARCHAR,
  user_id     BIGINT REFERENCES users(id)
);
```
*(Schema is auto-managed by Hibernate — `ddl-auto=update`)*

---

## 🔐 Security

- Passwords hashed with **BCrypt**
- JWT tokens expire after **24 hours**
- All `/api/**` routes (except auth) require a valid JWT
- Users can only access **their own** transactions — enforced server-side
- CORS configured to allow only the frontend origin

---

## ❌ Not in MVP (Phase 2)

- Budget limits & alerts
- Goals tracking
- CSV export
- Multi-currency
- Admin dashboard
- Edit transactions
- Advanced analytics

---

## 🧪 Test the MVP Criteria

1. `POST /api/auth/register` → get token
2. `POST /api/auth/login` → confirm login works
3. `POST /api/transactions` with token → add income
4. `POST /api/transactions` → add expense
5. `GET /api/dashboard/summary` → see totals update
6. Open frontend → verify charts render
7. Register second user → confirm they see zero transactions
