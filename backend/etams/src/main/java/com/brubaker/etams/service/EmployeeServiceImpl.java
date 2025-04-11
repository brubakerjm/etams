package com.brubaker.etams.service;

import com.brubaker.etams.dto.EmployeeDTO;
import com.brubaker.etams.dto.EmployeeMapper;
import com.brubaker.etams.entity.Employee;
import com.brubaker.etams.repository.EmployeeRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepo employeeRepo;
    private final EmployeeMapper employeeMapper;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(EmployeeRepo employeeRepo, PasswordEncoder passwordEncoder, EmployeeMapper employeeMapper) {
        this.employeeRepo = employeeRepo;
        this.employeeMapper = employeeMapper;
        this.passwordEncoder = passwordEncoder;
    }

    // Get all employees with task counts
    @Override
    public List<EmployeeDTO> getAllEmployeesWithTaskCount() {
        List<Employee> employees = employeeRepo.findAll();
        return employees.stream()
                .map(employee -> {
                    EmployeeDTO dto = employeeMapper.toDTO(employee);
                    dto.setTaskCount(employee.getTasks() != null ? employee.getTasks().size() : 0); // Add task count
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Create a new employee
    @Override
    public EmployeeDTO createEmployee(EmployeeDTO employeeDTO) {
        Employee employee = employeeMapper.toEntity(employeeDTO);

        // Handle password hashing
        if (employeeDTO.getPassword() != null && !employeeDTO.getPassword().isEmpty()) {
            employee.setPasswordHash(passwordEncoder.encode(employeeDTO.getPassword()));
        }

        return employeeMapper.toDTO(employeeRepo.save(employee));
    }

    // Update an existing employee
    @Override
    public EmployeeDTO updateEmployee(Integer id, EmployeeDTO employeeDTO) {
        Employee existingEmployee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Update fields manually (to avoid overwriting sensitive data)
        existingEmployee.setFirstName(employeeDTO.getFirstName());
        existingEmployee.setLastName(employeeDTO.getLastName());
        existingEmployee.setEmail(employeeDTO.getEmail());
        existingEmployee.setUsername(employeeDTO.getUsername());
        existingEmployee.setRole(employeeDTO.getRole());
        existingEmployee.setAdmin(employeeDTO.isAdmin());

        // Update password only if provided
        if (employeeDTO.getPassword() != null && !employeeDTO.getPassword().isEmpty()) {
            existingEmployee.setPasswordHash(passwordEncoder.encode(employeeDTO.getPassword()));
        }

        return employeeMapper.toDTO(employeeRepo.save(existingEmployee));
    }

    // Update the password for an employee
    @Override
    public void updatePassword(Integer id, String password) {
        Employee existingEmployee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Encode and update the password
        existingEmployee.setPasswordHash(passwordEncoder.encode(password));

        employeeRepo.save(existingEmployee);
    }

    // Optional: Delete an employee (if needed)
    @Override
    public void deleteEmployee(Integer id) {
        if (!employeeRepo.existsById(id)) {
            throw new RuntimeException("Employee not found");
        }
        employeeRepo.deleteById(id);
    }
}