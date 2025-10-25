# ShodhaCode - Competitive Programming Platform

A Spring Boot-based competitive programming platform for hosting coding contests and evaluating submissions.

## Project Structure

# Shodh-a-Code - Contest Platform

A full-stack competitive programming platform where users can join contests, solve problems, and compete on live leaderboards.

## 🏗️ Architecture

### Backend (Spring Boot 3.5.7)
- **Framework**: Java 17, Spring Boot
- **Database**: H2 (in-memory)
- **Code Execution**: Docker-based sandboxed environment
- **Async Processing**: Spring @Async for non-blocking submission evaluation

### Frontend (Next.js 16)
- **Framework**: Next.js with React 19
- **Styling**: Tailwind CSS 3.4.18
- **Code Editor**: Monaco Editor (VS Code editor)
- **API Communication**: Axios with real-time status polling

### Docker Execution Engine
- **Image**: Python 3.11-slim
- **Isolation**: Network disabled, read-only code mount
- **Resource Limits**: 128MB memory, 0.5 CPU cores, 5-second timeout
- **Security**: Non-root user, process limits, auto-cleanup

## 🚀 Features

✅ **Contest Management**
- Multiple contests with multiple problems
- Live leaderboard with real-time updates
- Unique problem counting (no duplicate submissions)

✅ **Code Submission & Evaluation**
- Monaco editor with syntax highlighting
- Docker-based secure code execution
- Async processing with status updates (Pending → Running → Accepted/Wrong Answer)
- Test case validation

✅ **User System**
- User registration and login
- Auto-registration for first-time users
- User-specific submission tracking

✅ **Security & Resource Management**
- Sandboxed Docker containers
- Network isolation
- CPU and memory limits
- Timeout protection
- Automatic container cleanup

## 📋 Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)
- **Docker** (for code execution)
- **Maven** (included as `mvnw`)

## 🔧 Setup Instructions

### 1. Build Docker Execution Image

```bash
cd docker
docker build -t shodhacode-python-runner .
cd ..
```

### 2. Build Backend

```bash
./mvnw clean package -DskipTests
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Start Backend (Port 8080)

```bash
java -jar target/shodhacode-0.0.1-SNAPSHOT.jar
```

### 5. Start Frontend (Port 3000)

```bash
cd frontend
npm run dev
```

### 6. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **H2 Console**: http://localhost:8080/h2-console

## 📚 API Documentation

### Contests

#### Get All Contests
```http
GET /api/contests
```

#### Get Contest Details
```http
GET /api/contests/{id}
```

#### Get Leaderboard
```http
GET /api/contests/{contestId}/leaderboard
```

**Response:**
```json
[
  {
    "username": "alice",
    "userId": 1,
    "solvedCount": 3
  }
]
```

### Submissions

#### Submit Code
```http
POST /api/submissions
Content-Type: application/json

{
  "user": {"id": 1},
  "problem": {"id": 1},
  "code": "print('Hello World')"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "Pending",
  "submittedAt": "2025-10-25T23:00:00"
}
```

#### Get Submission Status
```http
GET /api/submissions/{id}
```

#### Get User Submissions
```http
GET /api/submissions/user/{userId}
```

#### Get Problem Submissions
```http
GET /api/submissions/problem/{problemId}
```

### Users

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "alice"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "alice"
}
```

## 🏛️ Design Choices & Justifications

### 1. Docker-Based Code Execution

**Why Docker?**
- **Security**: Complete isolation from host system
- **Resource Control**: Strict CPU, memory, and time limits
- **Scalability**: Easy to add support for multiple languages
- **Reproducibility**: Consistent execution environment

**Implementation:**
```java
ProcessBuilder processBuilder = new ProcessBuilder(
    "docker", "run",
    "--rm",                          // Auto-cleanup
    "--network", "none",             // Network isolation
    "--memory", "128m",              // Memory limit
    "--cpus", "0.5",                 // CPU limit
    "-v", tempDir + ":/app/code:ro", // Read-only mount
    "shodhacode-python-runner"
);
```

### 2. Asynchronous Submission Processing

**Why @Async?**
- **Non-blocking**: API returns immediately with submission ID
- **Better UX**: Users can poll for status updates
- **Scalability**: Handles multiple submissions concurrently
- **Error Handling**: Failed executions don't crash the API

**Trade-off**: Requires polling mechanism in frontend (implemented with 1-second intervals).

### 3. H2 In-Memory Database

**Why H2?**
- **Simplicity**: No external database setup required
- **Fast Development**: Perfect for demos and prototypes
- **Transaction Support**: Full JPA/Hibernate support

**Trade-off**: Data lost on restart. For production, switch to PostgreSQL/MySQL.

### 4. Next.js Frontend

**Why Next.js?**
- **Modern React**: Latest React 19 features
- **Server Components**: Optimized performance
- **Built-in API**: Can add BFF (Backend for Frontend) if needed
- **Developer Experience**: Hot reload, TypeScript support

### 5. Test Data Initialization

**Why DataInitializer?**
- **Reliability**: Programmatic data loading ensures consistency
- **Flexibility**: Easy to add more test data
- **Debugging**: Clear visibility into what data is loaded

**Previous Approach**: `data.sql` with spring.sql.init.mode had timing issues.

### 6. Unique Problem Counting

**Implementation:**
```java
Collectors.mapping(
    s -> s.getProblem().getId(),
    Collectors.toSet() // Set ensures uniqueness
)
```

**Why?** Leaderboard should count distinct problems solved, not total submissions.

## 🎯 Challenges & Solutions

### Challenge 1: Code Execution Security
**Problem**: Running user code directly on host is dangerous.

**Solution**: Docker containers with:
- Network isolation (`--network none`)
- Resource limits (memory, CPU, processes)
- Read-only code mounts
- 5-second timeout
- Non-root user inside container

### Challenge 2: Async Processing Race Conditions
**Problem**: Problem entity not fully loaded in async method, causing null `outputExample`.

**Solution**: Explicitly reload problem in async method:
```java
Problem problem = problemRepository.findById(submission.getProblem().getId())
    .orElseThrow();
```

### Challenge 3: Frontend Build Conflicts
**Problem**: Tailwind v4/v3 syntax conflicts in CSS files.

**Solution**: Downgraded to stable Tailwind CSS 3.4.18, used standard `@layer` directives.

### Challenge 4: Leaderboard Duplicate Counting
**Problem**: Same user submitting same problem multiple times inflated score.

**Solution**: Use `Set<Long>` to collect unique problem IDs per user.

### Challenge 5: User Authentication
**Problem**: Original design had hardcoded user, no registration system.

**Solution**: Built registration/login API with auto-registration in frontend.

## 📊 Data Model

```
Contest (1) ----< (N) Problem
Problem (1) ----< (N) Submission
User (1) ----< (N) Submission
```

### Entities

**Contest**
- id, name
- List<Problem> problems

**Problem**
- id, title, description
- inputExample, outputExample
- Contest contest

**Submission**
- id, code, status
- User user
- Problem problem
- submittedAt (timestamp)

**User**
- id, username

## 🧪 Test Data

### Contests
1. **Math Contest** (Contest ID: 1)
2. **Coding Challenge** (Contest ID: 2)

### Problems
1. **Sum Two Numbers** - Add two space-separated numbers
2. **Multiply Two Numbers** - Multiply two space-separated numbers
3. **Reverse String** - Reverse input string
4. **Count Vowels** - Count vowels in input string

### Users
- alice (User ID: 1)
- bob (User ID: 2)

## 🔒 Security Features

1. **Container Isolation**: Code runs in ephemeral Docker containers
2. **Network Disabled**: No internet access for submissions
3. **Resource Limits**: Prevents resource exhaustion attacks
4. **Read-Only Mounts**: Code cannot modify host filesystem
5. **Process Limits**: Prevents fork bombs
6. **Timeout Protection**: 5-second hard limit on execution
7. **Non-Root User**: Container runs as unprivileged user

## 🚧 Future Enhancements

### High Priority
- [ ] Multiple test cases per problem
- [ ] Detailed error messages in UI
- [ ] Support for more languages (C++, Java, JavaScript)
- [ ] PostgreSQL for production deployment

### Medium Priority
- [ ] User authentication with JWT
- [ ] Private/public contest visibility
- [ ] Problem difficulty ratings
- [ ] Editorial solutions

### Low Priority
- [ ] Real-time leaderboard (WebSocket)
- [ ] Code plagiarism detection
- [ ] Contest timers and scheduling
- [ ] User profiles and statistics

## 🐛 Known Limitations

1. **Single Language Support**: Only Python 3 currently
2. **Memory Database**: Data lost on restart
3. **No Authentication**: Anyone can submit as any user (registration endpoint exists but no JWT)
4. **Basic Test Cases**: One test case per problem
5. **Polling Overhead**: Frontend polls every second for status

## 📦 Project Structure

```
shodhacode/
├── docker/
│   └── Dockerfile           # Python execution environment
├── src/
│   └── main/
│       ├── java/com/shodhacode/
│       │   ├── config/
│       │   │   └── DataInitializer.java
│       │   ├── controller/
│       │   │   ├── ContestController.java
│       │   │   ├── SubmissionController.java
│       │   │   └── UserController.java
│       │   ├── model/
│       │   │   ├── Contest.java
│       │   │   ├── Problem.java
│       │   │   ├── Submission.java
│       │   │   └── User.java
│       │   ├── repository/
│       │   │   ├── ContestRepository.java
│       │   │   ├── ProblemRepository.java
│       │   │   ├── SubmissionRepository.java
│       │   │   └── UserRepository.java
│       │   └── service/
│       │       ├── CodeExecutionService.java
│       │       └── SubmissionService.java
│       └── resources/
│           └── application.properties
└── frontend/
    ├── app/
    │   ├── page.tsx           # Login/registration
    │   ├── contest/[id]/page.tsx
    │   └── globals.css
    ├── package.json
    └── next.config.ts
```

## 🤝 Contributing

This is an educational project demonstrating competitive programming platform architecture.

## 📄 License

MIT License - Feel free to use for learning purposes.

## 👨‍💻 Author

Built as a technical assignment demonstrating:
- Full-stack development (Spring Boot + Next.js)
- Docker orchestration with ProcessBuilder
- Async processing patterns
- RESTful API design
- Secure code execution
- Modern React patterns

---

**Tech Stack Summary**: Java 17 • Spring Boot 3.5.7 • Next.js 16 • React 19 • Docker • H2 Database • Monaco Editor • Tailwind CSS

## Features

- 📝 **Contest Management**: Create and manage coding contests
- 🎯 **Problem Sets**: Define programming problems with test cases
- 💻 **Code Execution**: Execute and evaluate user submissions (Python support)
- 👥 **User Management**: Track user submissions and progress
- 🔄 **RESTful APIs**: Complete REST API for all operations
- 🗄️ **H2 Database**: In-memory database for development
- 🐳 **Dockerized**: Ready for containerized deployment

## API Endpoints

### Contests
- `GET /api/contests` - Get all contests
- `GET /api/contests/{id}` - Get contest by ID
- `POST /api/contests` - Create new contest
- `PUT /api/contests/{id}` - Update contest
- `DELETE /api/contests/{id}` - Delete contest

### Submissions
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions/{id}` - Get submission by ID
- `POST /api/submissions` - Submit code
- `GET /api/submissions/user/{userId}` - Get submissions by user
- `GET /api/submissions/problem/{problemId}` - Get submissions by problem

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Python 3 (for code execution)

### Running Locally

1. **Clone and navigate to project**
   ```bash
   cd shodhacode
   ```

2. **Run with Maven**
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Access the application**
   - API: http://localhost:8080
   - H2 Console: http://localhost:8080/h2-console

### Running with Docker

1. **Build Docker image**
   ```bash
   docker build -t shodhacode:latest .
   ```

2. **Run container**
   ```bash
   docker run -p 8080:8080 shodhacode:latest
   ```

   Or use Docker Compose:
   ```bash
   docker-compose up
   ```

## Configuration

Key configurations in `application.properties`:

```properties
# Application name
spring.application.name=shodhacode

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.defer-datasource-initialization=true

# H2 Console
spring.h2.console.enabled=true
```

## Sample Data

The application comes with pre-loaded sample data (defined in `data.sql`):
- 2 Users: alice, bob
- 2 Contests: Math Contest, Coding Challenge
- 2 Problems: Sum Two Numbers, Multiply Two Numbers

## Testing the API

### Get all contests
```bash
curl http://localhost:8080/api/contests
```

### Submit code
```bash
curl -X POST http://localhost:8080/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "user": {"id": 1},
    "problem": {"id": 1},
    "code": "a, b = map(int, input().split())\nprint(a + b)"
  }'
```

## Security Warning

⚠️ **Important**: The current `CodeExecutionService` executes user-submitted code directly on the host system. This is suitable for development/demo purposes only. 

For production, implement proper sandboxing using:
- Docker containers with resource limits
- Virtual machines
- Specialized code execution services (Judge0, Sphere Engine, etc.)

## Technology Stack

- **Framework**: Spring Boot 3.5.7
- **Language**: Java 17
- **Database**: H2 (in-memory)
- **ORM**: Hibernate/JPA
- **Build Tool**: Maven
- **Containerization**: Docker

## Development

### Project Dependencies
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- H2 Database
- Spring Boot Starter Test

### Database Schema
The application uses JPA entities to automatically generate the database schema:
- `users` - User information
- `contest` - Contest details
- `problem` - Problem statements and test cases
- `submission` - User code submissions and results

## Future Enhancements

- [ ] Authentication & Authorization (Spring Security)
- [ ] Multiple programming language support
- [ ] Real-time leaderboards
- [ ] Advanced test case management
- [ ] Code similarity detection
- [ ] WebSocket for real-time updates
- [ ] PostgreSQL/MySQL support for production
- [ ] Admin dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
