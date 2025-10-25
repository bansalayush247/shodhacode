package com.shodhacode;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ShodhaCodeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShodhaCodeApplication.class, args);
    }

}
