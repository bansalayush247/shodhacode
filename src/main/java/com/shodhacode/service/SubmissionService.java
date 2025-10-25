                                                                                    package com.shodhacode.service;

import com.shodhacode.model.Submission;
import com.shodhacode.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private CodeExecutionService codeExecutionService;
    
    @Autowired
    private com.shodhacode.repository.ProblemRepository problemRepository;

    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    public Optional<Submission> getSubmissionById(Long id) {
        return submissionRepository.findById(id);
    }

    public Submission submitCode(Submission submission) {
        // Set submission time
        submission.setSubmittedAt(LocalDateTime.now());
        
        // Set initial status as Pending
        submission.setStatus("Pending");
        
        // Save the submission
        Submission savedSubmission = submissionRepository.save(submission);
        
        // Process asynchronously
        processSubmissionAsync(savedSubmission.getId());
        
        return savedSubmission;
    }
    
    @Async
    public void processSubmissionAsync(Long submissionId) {
        Optional<Submission> optSubmission = submissionRepository.findById(submissionId);
        if (optSubmission.isEmpty()) {
            return;
        }
        
        Submission submission = optSubmission.get();
        
        // Explicitly reload the problem to ensure we have all data
        var problem = problemRepository.findById(submission.getProblem().getId()).orElse(null);
        if (problem == null) {
            submission.setStatus("Error: Problem not found");
            submissionRepository.save(submission);
            return;
        }
        submission.setProblem(problem);
        
        // Update status to Running
        submission.setStatus("Running");
        submissionRepository.save(submission);
        
        // Execute code
        try {
            // Check if test case data exists
            if (submission.getProblem().getInputExample() == null || 
                submission.getProblem().getOutputExample() == null) {
                submission.setStatus("Error: Test case not configured");
                submissionRepository.save(submission);
                return;
            }
            
            String result = codeExecutionService.executeCode(
                submission.getCode(),
                submission.getProblem().getInputExample()
            );
            
            // Update submission status based on result (trim both for comparison)
            String expectedOutput = submission.getProblem().getOutputExample().trim();
            String actualOutput = result.trim();
            
            if (actualOutput.equals(expectedOutput)) {
                submission.setStatus("Accepted");
            } else {
                submission.setStatus("Wrong Answer");
            }
        } catch (Exception e) {
            submission.setStatus("Error: " + e.getMessage());
        }
        
        submissionRepository.save(submission);
    }

    public List<Submission> getSubmissionsByUserId(Long userId) {
        return submissionRepository.findByUserId(userId);
    }

    public List<Submission> getSubmissionsByProblemId(Long problemId) {
        return submissionRepository.findByProblemId(problemId);
    }
}
