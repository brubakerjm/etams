package com.brubaker.etams.config;

import com.brubaker.etams.dto.EmployeeMapper;
import com.brubaker.etams.dto.TaskMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for defining bean instances of custom mappers.
 * This ensures that TaskMapper and EmployeeMapper is managed by Spring and can be injected into services.
 */
@Configuration
public class MapperConfig {

    @Bean
    public TaskMapper taskMapper() {
        return new TaskMapper();
    }

    @Bean
    public EmployeeMapper employeeMapper() {
        return new EmployeeMapper();
    }
}
