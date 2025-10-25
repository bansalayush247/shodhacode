# Dockerfile for secure Python code execution
FROM python:3.11-slim

# Create a non-root user for security
RUN useradd -m -u 1000 coderunner && \
    mkdir -p /app/code && \
    chown -R coderunner:coderunner /app

# Set working directory
WORKDIR /app

# Switch to non-root user
USER coderunner

# Set the entrypoint to execute Python code
ENTRYPOINT ["python3", "/app/code/solution.py"]
