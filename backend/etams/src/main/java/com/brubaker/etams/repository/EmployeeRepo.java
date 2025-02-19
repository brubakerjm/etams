package com.brubaker.etams.repository;

import com.brubaker.etams.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;

//@CrossOrigin(origins = "http://localhost:4200")
@Repository
public interface EmployeeRepo extends JpaRepository<Employee, Integer> {
    Optional<Employee> findByUsername(String username);
}