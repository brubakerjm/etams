package com.brubaker.etams.dto;

import com.brubaker.etams.entity.Employee;

import java.time.format.DateTimeFormatter;

public class EmployeeMapper {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT;

    public EmployeeDTO toDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setUsername(employee.getUsername());
        dto.setRole(employee.getRole());
        dto.setAdmin(employee.isAdmin());
        dto.setTaskCount(employee.getTasks() != null ? employee.getTasks().size() : 0);
        dto.setCreatedAt(employee.getCreatedAt() != null ? employee.getCreatedAt().toString() : null);
        dto.setUpdatedAt(employee.getUpdatedAt() != null ? employee.getUpdatedAt().toString() : null);
        return dto;
    }

    public Employee toEntity(EmployeeDTO employeeDTO) {
        Employee employee = new Employee();
        employee.setId(employeeDTO.getId());
        employee.setFirstName(employeeDTO.getFirstName());
        employee.setLastName(employeeDTO.getLastName());
        employee.setEmail(employeeDTO.getEmail());
        employee.setUsername(employeeDTO.getUsername());
        employee.setRole(employeeDTO.getRole());
        employee.setAdmin(employeeDTO.isAdmin());
        return employee;
    }
}