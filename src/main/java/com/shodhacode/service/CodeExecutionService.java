package com.shodhacode.service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {

    private static final String DOCKER_IMAGE = "shodhacode-python-runner";
    private static final int TIMEOUT_SECONDS = 5;
    private static final String MEMORY_LIMIT = "128m";
    private static final String CPU_LIMIT = "0.5";

    /**
     * Executes user-submitted code in a secure Docker container
     * 
     * @param code The source code to execute
     * @param input The input data for the program
     * @return The output of the program
     */
    public String executeCode(String code, String input) {
        Path tempDir = null;
        String containerId = null;
        
        try {
            // Create temporary directory for code
            tempDir = Files.createTempDirectory("shodhacode_");
            File codeFile = new File(tempDir.toFile(), "solution.py");

            // Write code to file
            try (FileWriter writer = new FileWriter(codeFile)) {
                writer.write(code);
            }

            // Create input file
            File inputFile = new File(tempDir.toFile(), "input.txt");
            if (input != null && !input.isEmpty()) {
                try (FileWriter writer = new FileWriter(inputFile)) {
                    writer.write(input);
                }
            }

            // Build Docker run command with resource limits
            ProcessBuilder processBuilder = new ProcessBuilder(
                "docker", "run",
                "--rm",                                      // Remove container after execution
                "--network", "none",                         // Disable network access
                "--memory", MEMORY_LIMIT,                    // Memory limit
                "--cpus", CPU_LIMIT,                         // CPU limit
                "--pids-limit", "50",                        // Limit number of processes
                "-v", tempDir.toAbsolutePath() + ":/app/code:ro",  // Mount code as read-only
                "-i",                                        // Interactive for stdin
                DOCKER_IMAGE
            );

            Process process = processBuilder.start();

            // Provide input to the process
            if (input != null && !input.isEmpty()) {
                process.getOutputStream().write(input.getBytes());
                process.getOutputStream().close();
            }

            // Wait for execution with timeout
            boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            
            if (!finished) {
                process.destroy();
                process.waitFor(1, TimeUnit.SECONDS);
                process.destroyForcibly();
                return "Time Limit Exceeded";
            }

            // Check exit code
            int exitCode = process.exitValue();
            if (exitCode != 0) {
                // Read error output
                StringBuilder error = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getErrorStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        error.append(line).append("\n");
                    }
                }
                return "Runtime Error: " + error.toString().trim();
            }

            // Read output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            return output.toString().trim();

        } catch (Exception e) {
            return "Execution Error: " + e.getMessage();
        } finally {
            // Clean up temporary files
            if (tempDir != null) {
                try {
                    File[] files = tempDir.toFile().listFiles();
                    if (files != null) {
                        for (File file : files) {
                            file.delete();
                        }
                    }
                    tempDir.toFile().delete();
                } catch (Exception e) {
                    // Log but don't fail
                    System.err.println("Failed to clean up temp directory: " + e.getMessage());
                }
            }
        }
    }
}
