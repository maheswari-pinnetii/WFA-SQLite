# System Architecture Styles

This document evaluates WFA-SQLite against major software architecture paradigms. As a guiding principle, we prioritize "build system, not features," meaning the underlying architecture must dictate how features are built, not the other way around.

---

## 1. Layered (N-Tier) Architecture
**Status: IMPLEMENTED (Core Paradigm)**

WFA-SQLite is strictly built on an N-Tier layered architecture to ensure a clear separation of concerns. A request must pass through these layers sequentially; bypassing a layer (e.g., a Controller talking directly to SQLite) is strictly prohibited.

* **Presentation Layer**: React SPA (Frontend).
* **Delivery Layer**: Express Routers & Middleware (Authentication, Rate Limiting).
* **Application Layer**: Controllers (Input validation and HTTP response formatting).
* **Domain Layer**: Services (Core business rules, e.g., "Cannot check in twice in one day").
* **Data Access Layer**: Repositories (SQL generation and database interaction).
* **Data Layer**: SQLite (Persistence).

---

## 2. Modular Monolith
**Status: IMPLEMENTED**

Instead of building a "big ball of mud" monolith where all code is intertwined, WFA-SQLite is structured as a Modular Monolith.
* **Separation by Domain**: The backend is organized by feature domains (e.g., `Attendance`, `Employee`, `Auth`).
* **Independent Repositories**: The `AttendanceService` relies on the `AttendanceRepository`. If it needs employee data, it does not query the `employees` table directly; it communicates with the `EmployeeService`.
* **Benefit**: This keeps the codebase highly cohesive and loosely coupled, making it incredibly easy to extract a module into a microservice in the future if scale demands it.

---

## 3. Microservices Architecture
**Status: NOT APPLICABLE**

WFA-SQLite deliberately avoids a microservices architecture.
* **Why**: Microservices introduce massive operational complexity (network latency, distributed tracing, eventual consistency, complex CI/CD pipelines). 
* **Justification**: Since the system uses a single-node SQLite database, breaking the backend into independent microservices would yield zero performance benefits and only introduce network overhead. The Modular Monolith provides the organizational benefits of microservices without the infrastructure tax.

---

## 4. Serverless Architecture
**Status: NOT APPLICABLE (Currently)**

The system operates as a long-running Node.js process.
* **Why**: Serverless functions (like AWS Lambda) suffer from "cold starts," which can delay the execution of time-sensitive operations like a geofenced punch-in. 
* **Justification**: A persistent Express server maintains a warm connection pool to the SQLite database, ensuring consistently fast, single-digit millisecond response times. Furthermore, SQLite relies on the local file system (the WAL file), which is incompatible with stateless, ephemeral serverless environments unless specialized infrastructure (like Turso) is introduced.

---

## 5. Event-Driven Architecture (EDA)
**Status: PARTIALLY IMPLEMENTED (Local Only)**

While Node.js is inherently event-driven under the hood (Event Loop), the WFA-SQLite distributed architecture does not rely on an external Event Bus (like Kafka, RabbitMQ, or AWS EventBridge).
* **Why**: We rely on synchronous Request-Response HTTP calls for immediate consistency. For example, when a manager approves a leave request, we want the database to guarantee the write before we return an HTTP 200.
* **Future Consideration**: If the system expands to include heavy background processing (like generating massive end-of-year PDF compliance reports), we may introduce a local message queue (like Redis BullMQ) to process those specific events asynchronously.
