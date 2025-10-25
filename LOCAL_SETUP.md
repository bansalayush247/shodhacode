# Local Setup Guide - Shodh-a-Code

This guide will help you run the Shodh-a-Code platform on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **Java 17 or higher** - [Download here](https://adoptium.net/)
- **Node.js 18 or higher** - [Download here](https://nodejs.org/)
- **Docker** - [Download here](https://docs.docker.com/get-docker/)
- **Maven** (included as `./mvnw` wrapper)

## Quick Start (5 Steps)

### Step 1: Build Docker Image

```bash
cd docker
docker build -t shodhacode-python-runner .
cd ..
```

**Expected output:**
```
Successfully built 8ff01d7b59ef
Successfully tagged shodhacode-python-runner:latest
```

**Verify:**
```bash
docker images | grep shodhacode
# Should show: shodhacode-python-runner   latest   ...
```

---

### Step 2: Build Backend

```bash
./mvnw clean package -DskipTests
```

**Expected output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: ~20s
```

**Troubleshooting:**
- If `./mvnw` doesn't work, run: `chmod +x mvnw`
- On Windows, use: `mvnw.cmd clean package -DskipTests`

---

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

**Expected output:**
```
added 480 packages in 15s
```

---

### Step 4: Start Backend Server

Open a new terminal and run:

```bash
java -jar target/shodhacode-0.0.1-SNAPSHOT.jar
```

**Expected output:**
```
Started ShodhaCodeApplication in 6.07 seconds
Tomcat started on port 8080
✅ Test data initialized successfully!
```

**Keep this terminal running!**

---

### Step 5: Start Frontend Server

Open another terminal and run:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local:   http://localhost:3000
✓ Ready in 1909ms
```

**Keep this terminal running!**

---

## Access the Application

Open your browser and visit:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **H2 Console:** http://localhost:8080/h2-console

### Default Login Credentials

The system has auto-registration. Just enter any username on the login page:
- Try: `alice` or `bob` (pre-loaded users)
- Or create your own by entering a new username

---

## Test the Application

### 1. Login
- Go to http://localhost:3000
- Enter username: `alice`
- Click "Continue"

### 2. Select a Contest
- You'll see 2 contests: "Math Contest" and "Coding Challenge"
- Click on "Math Contest"

### 3. Solve a Problem
- Select "Sum Two Numbers"
- Write code in the Monaco editor:
```python
nums = input().split()
print(int(nums[0]) + int(nums[1]))
```
- Click "Submit Code"
- Wait 2-3 seconds for result

### 4. Check Results
- Status will update: Pending → Running → Accepted
- Check the leaderboard on the left side

---

## Testing API Directly (Optional)

### Submit Code via API
```bash
curl -X POST http://localhost:8080/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "user": {"id": 1},
    "problem": {"id": 1},
    "code": "nums = input().split()\nprint(int(nums[0]) + int(nums[1]))"
  }'
```

### Check Submission Status
```bash
curl http://localhost:8080/api/submissions/1
```

### Get Leaderboard
```bash
curl http://localhost:8080/api/contests/1/leaderboard
```

---

## Pre-Loaded Test Data

### Contests
1. **Math Contest** (ID: 1)
   - Sum Two Numbers
   - Multiply Two Numbers

2. **Coding Challenge** (ID: 2)
   - Reverse String
   - Count Vowels

### Users
- alice (ID: 1)
- bob (ID: 2)

---

## Verify Docker is Working

### Test Docker Installation
```bash
docker --version
docker ps
docker images | grep shodhacode
```

### Test Direct Execution
```bash
# Create test file
cat > /tmp/solution.py << 'EOF'
print("Hello from Docker!")
EOF

# Run in Docker
docker run --rm -v /tmp:/app/code:ro shodhacode-python-runner
```

**Expected output:** `Hello from Docker!`

### Test with Input
```bash
# Create test file
cat > /tmp/solution.py << 'EOF'
a, b = map(int, input().split())
print(a + b)
EOF

# Run with input
echo "2 3" | docker run --rm -i -v /tmp:/app/code:ro \
  --network none --memory 128m --cpus 0.5 \
  shodhacode-python-runner
```

**Expected output:** `5`

---

## Troubleshooting

### Port Already in Use

**Backend (Port 8080):**
```bash
# Find process using port 8080
lsof -i :8080

# Kill it
kill -9 <PID>
```

**Frontend (Port 3000):**
```bash
# Kill Next.js process
pkill -f "next dev"
```

### Docker Not Working

**Check Docker Daemon:**
```bash
sudo systemctl status docker
```

**Start Docker:**
```bash
sudo systemctl start docker
```

**Permission Issues:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

**Rebuild Image:**
```bash
cd docker
docker build -t shodhacode-python-runner .
```

### Backend Build Fails

**Clean Maven cache:**
```bash
./mvnw clean
rm -rf target/
./mvnw package -DskipTests
```

### Frontend Build Issues

**Clear cache and reinstall:**
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

### TypeScript Errors in IDE

The application works despite IDE errors. If you see "Cannot find module '@monaco-editor/react'":

**Solution 1 - Reload VS Code:**
- Press `Ctrl+Shift+P`
- Type "Reload Window"
- Press Enter

**Solution 2 - Restart TypeScript:**
- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"
- Press Enter

The code compiles and runs successfully even with these IDE warnings.

---

## Stopping the Application

### Stop Backend
- Go to backend terminal
- Press `Ctrl+C`

### Stop Frontend
- Go to frontend terminal
- Press `Ctrl+C`

### Alternative (Kill all)
```bash
# Kill backend
pkill -f "shodhacode-0.0.1-SNAPSHOT.jar"

# Kill frontend
pkill -f "next dev"
```

---

## Directory Structure

```
shodhacode/
├── docker/
│   └── Dockerfile                    # Python execution environment
├── src/main/java/com/shodhacode/
│   ├── config/
│   │   └── DataInitializer.java     # Test data loader
│   ├── controller/                   # REST endpoints
│   ├── model/                        # JPA entities
│   ├── repository/                   # Data access
│   └── service/
│       ├── CodeExecutionService.java # Docker execution
│       └── SubmissionService.java    # Async processing
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Login page
│   │   └── contest/[id]/page.tsx    # Contest page
│   └── components/
│       └── Leaderboard.tsx          # Leaderboard component
├── target/
│   └── shodhacode-0.0.1-SNAPSHOT.jar # Compiled backend
└── README.md                         # Full documentation
```

---

## Next Steps

1. ✅ **Explore the UI** - Try submitting different solutions
2. ✅ **Check Leaderboard** - See how users rank
3. ✅ **Test Error Handling** - Submit wrong code to see error messages
4. ✅ **Review Code** - Understand the architecture
5. ✅ **Read README.md** - For detailed documentation

---

## Common Questions

### Q: How long does code execution take?
**A:** Usually 2-3 seconds (includes container startup + execution + cleanup)

### Q: What languages are supported?
**A:** Currently only Python 3.11. See README.md for adding more languages.

### Q: Where is the database?
**A:** H2 in-memory database. Data is lost on restart. Access console at http://localhost:8080/h2-console

### Q: How to add more problems?
**A:** Edit `src/main/java/com/shodhacode/config/DataInitializer.java` and restart backend.

### Q: Is the code execution secure?
**A:** Yes! Docker provides isolation with:
- No network access
- 128MB memory limit
- 0.5 CPU core limit
- 5-second timeout
- Read-only filesystem
- Non-root user

### Q: Can I run this in production?
**A:** The Docker execution is production-ready, but you should:
- Switch from H2 to PostgreSQL/MySQL
- Add JWT authentication
- Set up proper logging
- Configure CORS properly
- Use nginx as reverse proxy

---

## Support

For issues or questions:
1. Check the main **README.md** for detailed documentation
2. Review **Troubleshooting** section above
3. Verify all prerequisites are installed
4. Check Docker is running properly

---

## Success Checklist

Before considering setup complete, verify:

- [ ] Docker image built successfully
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Can login with username
- [ ] Can see contests and problems
- [ ] Can submit code successfully
- [ ] Submission status updates
- [ ] Leaderboard updates after accepted submission
- [ ] Docker containers cleanup after execution

---

**Happy Coding!** 🚀

If all checks pass, your local development environment is ready!
