package com.brubaker.etams.controller;

import com.brubaker.etams.dto.TaskDTO;
import com.brubaker.etams.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing tasks in the ETAMS system.
 * Provides endpoints for CRUD operations on tasks.
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    /**
     * Constructs a TaskController with the required TaskService dependency.
     *
     * @param taskService the service for task-related operations
     */
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Retrieves all tasks.
     *
     * @return a ResponseEntity containing a list of TaskDTO objects
     */
    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        List<TaskDTO> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/user/{employeeId}")
    public ResponseEntity<List<TaskDTO>> getTasksByEmployeeId(@PathVariable Integer employeeId) {
        List<TaskDTO> tasks = taskService.getTasksByEmployeeId(employeeId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Creates a new task.
     *
     * @param taskDTO the task data to be created
     * @return a ResponseEntity containing the created TaskDTO
     */
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@Valid @RequestBody TaskDTO taskDTO) {
        TaskDTO createdTask = taskService.createTask(taskDTO);
        return ResponseEntity.ok(createdTask);
    }

    /**
     * Updates an existing task.
     *
     * @param id      the ID of the task to be updated
     * @param taskDTO the updated task data
     * @return a ResponseEntity containing the updated TaskDTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Integer id, @RequestBody TaskDTO taskDTO) {
        TaskDTO updatedTask = taskService.updateTask(id, taskDTO);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Deletes a task.
     *
     * @param id the ID of the task to be deleted
     * @return a ResponseEntity with no content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}