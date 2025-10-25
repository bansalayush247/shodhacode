package com.shodhacode.config;

import com.shodhacode.model.Contest;
import com.shodhacode.model.Problem;
import com.shodhacode.model.User;
import com.shodhacode.repository.ContestRepository;
import com.shodhacode.repository.ProblemRepository;
import com.shodhacode.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContestRepository contestRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @PostConstruct
    public void init() {
        // Users
        User alice = new User();
        alice.setUsername("alice");
        userRepository.save(alice);

        User bob = new User();
        bob.setUsername("bob");
        userRepository.save(bob);

        // Contests
        Contest mathContest = new Contest();
        mathContest.setName("Math Contest");
        contestRepository.save(mathContest);

        Contest codingChallenge = new Contest();
        codingChallenge.setName("Coding Challenge");
        contestRepository.save(codingChallenge);

        // Problems
        Problem problem1 = new Problem();
        problem1.setTitle("Sum Two Numbers");
        problem1.setDescription("Add two numbers");
        problem1.setContest(mathContest);
        problem1.setInputExample("2 3");
        problem1.setOutputExample("5");
        problemRepository.save(problem1);

        Problem problem2 = new Problem();
        problem2.setTitle("Multiply Two Numbers");
        problem2.setDescription("Multiply two numbers");
        problem2.setContest(mathContest);
        problem2.setInputExample("2 3");
        problem2.setOutputExample("6");
        problemRepository.save(problem2);

        // Problems for Coding Challenge contest
        Problem problem3 = new Problem();
        problem3.setTitle("Reverse String");
        problem3.setDescription("Reverse the input string");
        problem3.setContest(codingChallenge);
        problem3.setInputExample("hello");
        problem3.setOutputExample("olleh");
        problemRepository.save(problem3);

        Problem problem4 = new Problem();
        problem4.setTitle("Count Vowels");
        problem4.setDescription("Count the number of vowels in the input string");
        problem4.setContest(codingChallenge);
        problem4.setInputExample("hello");
        problem4.setOutputExample("2");
        problemRepository.save(problem4);

        System.out.println("✅ Test data initialized successfully!");
    }
}
