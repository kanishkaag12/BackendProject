# SyncTask - Secure Full-Stack Task Management Application

A production-ready Full Stack application showcasing a scalable REST API (Node.js/Express/PostgreSQL) with JWT authentication, Role-Based Access Control (RBAC), and a premium glassmorphic React frontend.

---

## Technical Stack & Architecture

### Backend:
- **Core**: Node.js & Express.js (v18+)
- **Database**: PostgreSQL (hosted on Neon cloud) with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens) with separate Access and Refresh tokens
- **Security**: bcryptjs (12 rounds password hashing), Helmet (security headers), CORS (origin restricted), Rate Limiter, and hpp (HTTP Parameter Pollution) protection
- **Validations**: Joi schema validations on requests
- **Documentation**: Swagger/OpenAPI 3.0 API documentation at `/api-docs`

### Frontend:
- **Core**: React.js & Vite (fast HMR dev server)
- **Routing**: React Router DOM (v7) with protected routes (`ProtectedRoute` & `AdminRoute`)
- **API Client**: Axios configured with request/response interceptors to automatically handle authorization headers and silent token refreshes
- **Styling**: Vanilla CSS featuring a premium dark-themed Glassmorphism aesthetic, custom inputs, tables, scrollbars, and Outfit/Inter typography

---

## Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize & Swagger configurations
│   │   ├── controllers/     # Controller handlers (auth, tasks, admin)
│   │   ├── middleware/      # Auth security guards & centralized error handling
│   │   ├── models/          # Database definitions & model associations
│   │   ├── routes/          # Express route declarations with Swagger annotations
│   │   ├── services/        # Business logic operations
│   │   ├── utils/           # Error classes and wrapper helpers
│   │   └── validations/     # Joi validation schemas
│   ├── .env                 # Backend active configuration (Neon DB inside)
│   ├── package.json         # Backend manifest
│   └── postman_collection   # Postman collection (v2.1 API tests)
└── frontend/
    ├── src/
    │   ├── components/      # UI components (Navbar, Modal, Guards)
    │   ├── context/         # AuthContext provider
    │   ├── pages/           # Views (Login, Register, Dashboard, Tasks, Admin)
    │   ├── services/        # Axios API Client
    │   ├── App.jsx          # App routing
    │   ├── index.css        # Premium theme styles & layout utilities
    │   └── main.jsx         # App mounting point
    ├── index.html           # Root HTML
    └── package.json         # Frontend manifest
```

## Database Connection
The application is designed to connect to a **PostgreSQL database**. 

To connect:
1. Open the `.env` file in the `backend/` directory.
2. Define your PostgreSQL connection string in the `DATABASE_URL` variable:
   ```ini
   DATABASE_URL=postgresql://<username>:<password>@<host>/<database>?sslmode=require
   ```

Upon server startup, Sequelize automatically syncs models and creates the necessary database schemas, foreign key constraints (Cascade On Delete), and optimization indexes on `users(email)` and `tasks(userId, status)`.


---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run

Open two terminal windows to run both services:

#### 1. Start the Backend
```bash
cd backend
# Install dependencies
npm install
# Start the server in hot-reload development mode
npm run dev
```
The backend server will run on `http://localhost:5000`. You can inspect the Swagger API documentation at:
- **API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **API Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

#### 2. Start the Frontend
```bash
cd frontend
# Install dependencies
npm install
# Start the Vite development server
npm run dev
```
The frontend application will start on `http://localhost:5173`. Open your browser and navigate to the local server.

---

## Verification & Test Accounts

For demonstration, you can either **register new users** directly from the Registration page and select their role, or log in with these pre-created accounts:

### 1. Regular User Account
- **Email**: `john@example.com`
- **Password**: `Password@123`
- **Permissions**: Can manage only their own tasks. Cannot access the Admin Panel or view other users' records.

### 2. Administrator Account
- **Email**: `admin@example.com`
- **Password**: `AdminPassword@123`
- **Permissions**: Full access to all database records. Can view system analytics dashboard, inspect all registered users, and inspect individual user task lists.

*(Note: Admin account will need to be registered or updated in database to test the Admin Panel. You can register a user with role `admin` directly in the UI for ease of demonstration)*

---

## Key Features Built

1. **Authentication (JWT)**:
   - Registers new users with encrypted password storage (`bcrypt` 12 rounds).
   - Generates a short-lived **access token** (15 mins) and a long-lived **refresh token** (7 days).
   - Silent refresh: Axios interceptors transparently request a new access token when a 401 response is returned, ensuring seamless UX.

2. **Authorization (RBAC)**:
   - Middleware ensures only requests with valid admin signatures can hit `/api/v1/admin/*` paths.
   - User routes ensure task items can only be retrieved, updated, or deleted by the user who created them (ownership verification).

3. **Premium UX & Design**:
   - Ultra-modern space theme glassmorphism interface.
   - Custom search, state-based filters, dynamic pagination.
   - Full Task CRUD (Create, Read, Update, Delete) accessible via rich modals and status menus.
   - Alert logs and loading spinners.

---

## 📈 Scalability & Optimization Notes

To scale the **SyncTask** application to handle millions of requests/users, we would execute the following architectural plans:

1. **Database Scalability (PostgreSQL & Sequelize)**:
   - **Database Connection Pooling**: Tune parameters (increase connection pool sizes based on container size).
   - **Read/Write Splitting**: Route write queries to a master database instance and read queries to read-replicas (configured using Sequelize replication feature).
   - **Indexing**: Maintain indexes on frequently queried fields like `users(email)` and composite indexes on `tasks(userId, status, createdAt)`.

2. **Caching Strategy (Redis)**:
   - Cache user profiles and session validation records to reduce database lookup overhead.
   - Cache task metrics and global analytics statistics for the admin dashboard with active invalidation on task status updates (write-through/write-around cache).

3. **Microservices Decomposition**:
   - Split the monolithic Node.js app into three separate microservices:
     - **Auth Service**: Manages accounts, token cycles, and authentication.
     - **Task Service**: Focused purely on task operations, workflows, and workspace details.
     - **Analytics Service**: Collects metrics and admin summaries asynchronously using message brokers like RabbitMQ or Apache Kafka.

4. **Load Balancing & Stateless Servers**:
   - Run stateless Docker containers of backend services managed under Kubernetes or AWS ECS.
   - Position an Nginx reverse proxy or AWS Application Load Balancer (ALB) at the front to distribute load evenly across healthy service pods using round-robin logic.
