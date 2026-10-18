package com.javaschoollab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class JavaSchoolLabApplication {
    public static void main(String[] args) {
        SpringApplication.run(JavaSchoolLabApplication.class, args);
    }
}
