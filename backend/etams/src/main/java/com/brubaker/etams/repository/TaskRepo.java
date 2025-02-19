package com.brubaker.etams.repository;

import com.brubaker.etams.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:4200")
@Repository
public interface TaskRepo extends JpaRepository<Task, Integer> {
    List<Task> findByAssignedEmployee_Id(Integer assignedEmployeeId);
}
