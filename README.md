# Task Manager App

A full-stack task management application built with **Angular 17**, **Spring Boot 3**, and **MySQL**, with JWT authentication and Docker support.

---

## Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | Angular 17 (Standalone), Angular Material |
| Backend   | Spring Boot 3, Spring Security, JWT       |
| Database  | MySQL 8                                   |
| Auth      | JWT (jjwt 0.11.5)                         |
| Container | Docker & Docker Compose                   |

---

## Project Structure

```
taskmanager/
├── backend/
│   ├── src/main/java/com/treinetic/taskmanager/
│   │   ├── config/
│   │   │   ├── AppConfig.java          # UserDetailsService & PasswordEncoder beans
│   │   │   ├── JwtUtil.java            # JWT generation & validation
│   │   │   ├── JwtFilter.java          # JWT request filter
│   │   │   └── SecurityConfig.java     # Security filter chain & CORS
│   │   ├── controller/
│   │   │   ├── AuthController.java     # Register & Login endpoints
│   │   │   └── TaskController.java     # Task CRUD endpoints
│   │   ├── dto/
│   │   │   ├── AuthDTO.java            # Login, Register, AuthResponse
│   │   │   └── TaskDTO.java            # Task request body
│   │   ├── entity/
│   │   │   ├── Task.java
│   │   │   ├── TaskStatus.java         # Enum: TO_DO, IN_PROGRESS, DONE
│   │   │   └── User.java
│   │   ├── repository/
│   │   │   ├── TaskRepository.java
│   │   │   └── UserRepository.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   └── TaskService.java
│   │   └── TaskManagerApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## Option 1: Run with Docker Compose (Recommended)

> Requires: Docker Desktop

```bash
docker-compose up --build
```

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:4200 |
| Backend  | http://localhost:8080 |
| MySQL    | localhost:3306        |

To stop:
```bash
docker-compose down
```

---

## Option 2: Run Locally

### Database Setup

1. Install MySQL 8 and start the service.
2. The app auto-creates the database on first run (`createDatabaseIfNotExist=true`).
3. Default credentials in `application.properties`.

> Update `backend/src/main/resources/application.properties` if your credentials differ.

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on: `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on: `http://localhost:4200`

---

## API Endpoints

### Auth (Public)

| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/register | Register a new user |
| POST   | /api/auth/login    | Login, returns JWT |

### Tasks (Requires Bearer Token)

| Method | Endpoint        | Description                              |
|--------|-----------------|------------------------------------------|
| GET    | /api/tasks      | Get all tasks (filter by `?status=TO_DO`) |
| GET    | /api/tasks/{id} | Get task by ID                           |
| POST   | /api/tasks      | Create new task                          |
| PUT    | /api/tasks/{id} | Update task                              |
| DELETE | /api/tasks/{id} | Delete task                              |

---

## JWT Authentication

- Register or Login to receive a JWT token.
- The Angular interceptor automatically attaches `Authorization: Bearer <token>` to every API request.
- Token is stored in `localStorage` and cleared on logout.
- Protected routes redirect to `/login` if no valid token exists.

### Default Test Credentials

Register via the UI or POST to `/api/auth/register`:
```json
{ "username": "admin", "password": "admin123" }
```

---

## Task Status Values

| Value       | Meaning     |
|-------------|-------------|
| TO_DO       | Not started |
| IN_PROGRESS | In progress |
| DONE        | Completed   |

---

## Error Responses

All errors return a JSON object with a single `error` field:

```json
{ "error": "Invalid credentials" }
```

| Scenario                  | HTTP Status | Message                          |
|---------------------------|-------------|----------------------------------|
| Missing username/password | 400         | "Username is required" / "Password is required" |
| Wrong login credentials   | 401         | "Invalid credentials"            |
| Username already taken    | 409         | "Username is already taken"      |
| Task not found            | 404         | "Task not found with id: {id}"   |
| Title missing             | 400         | "Title is required"              |
| Title too long            | 400         | "Title must be under 100 characters" |
| Description too long      | 400         | "Description must be under 500 characters" |

---

## Features

- Register & Login with JWT authentication
- View all tasks in a sortable table
- Filter tasks by status (To Do / In Progress / Done)
- Create tasks with title, description, and status
- Edit existing tasks
- Delete tasks with confirmation dialog
- Form validation (title required, max lengths enforced)
- Snackbar notifications for all actions
- Fully responsive with Angular Material