package com.brubaker.etams.service;

import com.brubaker.etams.dto.TaskDTO;
import com.brubaker.etams.dto.TaskMapper;
import com.brubaker.etams.entity.Employee;
import com.brubaker.etams.entity.Task;
import com.brubaker.etams.entity.TaskStatus;
import com.brubaker.etams.repository.EmployeeRepo;
import com.brubaker.etams.repository.TaskRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;



/**
 * Service layer for managing tasks in the ETAMS system.
 * Contains business logic for CRUD operations on tasks.
 */
@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepo taskRepo;
    private final EmployeeRepo employeeRepo;
    private final TaskMapper taskMapper;

    /**
     * Constructs a TaskService with the required dependencies.
     *
     * @param taskRepo     the repository for task operations
     * @param employeeRepo the repository for employee operations
     * @param taskMapper   the mapper for Entity <-> DTO
     */
    public TaskServiceImpl(TaskRepo taskRepo, EmployeeRepo employeeRepo, TaskMapper taskMapper) {
        this.taskRepo = taskRepo;
        this.employeeRepo = employeeRepo;
        this.taskMapper = taskMapper;
    }

    /**
     * Retrieves all tasks from the database.
     *
     * @return a list of TaskDTO objects
     */
    @Override
    public List<TaskDTO> getAllTasks() {
        return taskRepo.findAll().stream()
                .map(taskMapper::toDTO) // Use the manual TaskMapper
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskDTO> getTasksByEmployeeId(Integer employeeId) {
        List<Task> tasks = taskRepo.findByAssignedEmployee_Id(employeeId);
        return tasks.stream()
                .map(taskMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new task and saves it to the database.
     *
     * @param taskDTO the data for the task to be created
     * @return the created TaskDTO object
     */
    @Override
    public TaskDTO createTask(TaskDTO taskDTO) {
        Task task = taskMapper.toEntity(taskDTO);

        if (taskDTO.getAssignedEmployeeId() != null) {
            Employee employee = employeeRepo.findById(taskDTO.getAssignedEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            task.setAssignedEmployee(employee);
            System.out.println("Assigned Employee: " + employee);
        }


        Task savedTask = taskRepo.save(task);

        TaskDTO returnedDTO = taskMapper.toDTO(savedTask);

        return returnedDTO;
    }

    /**
     * Updates an existing task in the database.
     *
     * @param id      the ID of the task to be updated
     * @param taskDTO the updated task data
     * @return the updated TaskDTO object
     */
    @Override
    public TaskDTO updateTask(Integer id, TaskDTO taskDTO) {
        Task existingTask = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (taskDTO.getTitle() == null || taskDTO.getTitle().isBlank()) {
            throw new IllegalArgumentException("Task title is required");
        }

        existingTask.setTitle(taskDTO.getTitle());
        existingTask.setDescription(taskDTO.getDescription());
        existingTask.setStatus(TaskStatus.valueOf(taskDTO.getStatus().toUpperCase()));
        existingTask.setDeadline(taskDTO.getDeadline());

        if (taskDTO.getAssignedEmployeeId() != null) {
            Employee employee = employeeRepo.findById(taskDTO.getAssignedEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            existingTask.setAssignedEmployee(employee);
        } else {
            existingTask.setAssignedEmployee(null);
        }

        Task updatedTask = taskRepo.save(existingTask);
        return taskMapper.toDTO(updatedTask);
    }

    /**
     * Deletes a task from the database.
     *
     * @param id the ID of the task to be deleted
     * @throws RuntimeException if the task does not exist
     */
    @Override
    public void deleteTask(Integer id) {
        if (!taskRepo.existsById(id)) {
            throw new RuntimeException("Task not found");
        }
        taskRepo.deleteById(id);
    }
}