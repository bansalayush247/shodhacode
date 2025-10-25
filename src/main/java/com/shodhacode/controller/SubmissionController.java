package com.shodhacode.controller;

import com.shodhacode.model.Submission;
import com.shodhacode.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @GetMapping
    public List<Submission> getAllSubmissions() {
        return submissionService.getAllSubmissions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable Long id) {
        return submissionService.getSubmissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Submission submitCode(@RequestBody Submission submission) {
        return submissionService.submitCode(submission);
    }

    @GetMapping("/user/{userId}")
    public List<Submission> getSubmissionsByUserId(@PathVariable Long userId) {
        return submissionService.getSubmissionsByUserId(userId);
    }

    @GetMapping("/problem/{problemId}")
    public List<Submission> getSubmissionsByProblemId(@PathVariable Long problemId) {
        return submissionService.getSubmissionsByProblemId(problemId);
    }
}
