package com.brubaker.etams.service;

import com.brubaker.etams.dto.EmployeeDTO;

import java.util.List;

public interface EmployeeService {
    // Get all employees with task counts
    List<EmployeeDTO> getAllEmployeesWithTaskCount();

    // Create a new employee
    EmployeeDTO createEmployee(EmployeeDTO employeeDTO);

    // Update an existing employee
    EmployeeDTO updateEmployee(Integer id, EmployeeDTO employeeDTO);

    // Update the password for an employee
    void updatePassword(Integer id, String password);

    // Optional: Delete an employee (if needed)
    void deleteEmployee(Integer id);
}
