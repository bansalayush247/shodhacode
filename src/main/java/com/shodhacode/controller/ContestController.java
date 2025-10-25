package com.shodhacode.controller;

import org.springframework.web.bind.annotation.*;
import com.shodhacode.model.Contest;
import com.shodhacode.repository.ContestRepository;
import com.shodhacode.repository.SubmissionRepository;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contests")
public class ContestController {

    private final ContestRepository contestRepository;
    private final SubmissionRepository submissionRepository;

    public ContestController(ContestRepository contestRepository, SubmissionRepository submissionRepository) {
        this.contestRepository = contestRepository;
        this.submissionRepository = submissionRepository;
    }

    @GetMapping
    public List<Contest> getAllContests() {
        return contestRepository.findAll();
    }

    @GetMapping("/{id}")
    public Contest getContest(@PathVariable Long id) {
        return contestRepository.findById(id).orElseThrow();
    }

    @GetMapping("/{contestId}/leaderboard")
    public List<Map<String, Object>> getLeaderboard(@PathVariable Long contestId) {
        // Get all accepted submissions for problems in this contest
        var contest = contestRepository.findById(contestId).orElseThrow();
        var problemIds = contest.getProblems().stream()
                .map(p -> p.getId())
                .collect(Collectors.toList());
        
        // Group by user and count UNIQUE problems solved (not total submissions)
        var leaderboard = submissionRepository.findAll().stream()
                .filter(s -> s.getProblem() != null && problemIds.contains(s.getProblem().getId()))
                .filter(s -> "Accepted".equals(s.getStatus()))
                .collect(Collectors.groupingBy(
                        s -> s.getUser(),
                        Collectors.mapping(
                                s -> s.getProblem().getId(),
                                Collectors.toSet() // Use Set to get unique problem IDs
                        )
                ))
                .entrySet().stream()
                .sorted((e1, e2) -> Integer.compare(e2.getValue().size(), e1.getValue().size()))
                .map(entry -> {
                    Map<String, Object> userScore = new HashMap<>();
                    userScore.put("username", entry.getKey().getUsername());
                    userScore.put("userId", entry.getKey().getId());
                    userScore.put("solvedCount", entry.getValue().size()); // Count unique problems
                    return userScore;
                })
                .collect(Collectors.toList());
        
        return leaderboard;
    }
}
