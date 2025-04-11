package com.brubaker.etams.service;

import com.brubaker.etams.dto.TaskDTO;
import com.brubaker.etams.dto.TaskMapper;
import com.brubaker.etams.entity.Employee;
import com.brubaker.etams.entity.Task;
import com.brubaker.etams.entity.TaskStatus;
import com.brubaker.etams.repository.EmployeeRepo;
import com.brubaker.etams.repository.TaskRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the {@link TaskServiceImpl} class.
 * Ensures that task management operations such as retrieval, creation,
 * updating, and deletion are functioning correctly.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepo taskRepo;

    @Mock
    private EmployeeRepo employeeRepo;

    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskService taskService;

    private Task task;
    private TaskDTO taskDTO;
    private Employee employee;

    /**
     * Sets up test data before each test execution.
     */
    @BeforeEach
    void setUp() {
        task = new Task();
        task.setId(1);
        task.setTitle("Test Task");
        task.setDescription("This is a test task");
        task.setStatus(TaskStatus.PENDING);
        task.setDeadline(LocalDate.now().plusDays(5));

        taskDTO = new TaskDTO();
        taskDTO.setId(1);
        taskDTO.setTitle("Test Task");
        taskDTO.setDescription("This is a test task");
        taskDTO.setStatus("PENDING");
        taskDTO.setDeadline(LocalDate.now().plusDays(5));

        employee = new Employee();
        employee.setId(1);
        employee.setFirstName("John");
        employee.setLastName("Doe");
    }

    /**
     * Tests retrieving all tasks from the database.
     */
    @Test
    void getAllTasks_Success() {
        List<Task> taskList = List.of(task);
        List<TaskDTO> taskDTOList = List.of(taskDTO);

        when(taskRepo.findAll()).thenReturn(taskList);
        when(taskMapper.toDTO(any(Task.class))).thenReturn(taskDTO);

        List<TaskDTO> result = taskService.getAllTasks();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(taskRepo, times(1)).findAll();
        verify(taskMapper, times(1)).toDTO(any(Task.class));
    }

    /**
     * Tests retrieving tasks assigned to a specific employee.
     */
    @Test
    void getTasksByEmployeeId_Success() {
        Integer employeeId = 1;
        List<Task> assignedTasks = List.of(task);
        List<TaskDTO> assignedTaskDTOs = List.of(taskDTO);

        when(taskRepo.findByAssignedEmployee_Id(employeeId)).thenReturn(assignedTasks);
        when(taskMapper.toDTO(any(Task.class))).thenReturn(taskDTO);

        List<TaskDTO> result = taskService.getTasksByEmployeeId(employeeId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Task", result.get(0).getTitle());

        verify(taskRepo, times(1)).findByAssignedEmployee_Id(employeeId);
        verify(taskMapper, times(1)).toDTO(any(Task.class));
    }

    /**
     * Tests the successful creation of a new task.
     */
    @Test
    void createTask_Success() {
        when(taskMapper.toEntity(any(TaskDTO.class))).thenReturn(task);
        when(taskRepo.save(any(Task.class))).thenReturn(task);
        when(taskMapper.toDTO(any(Task.class))).thenReturn(taskDTO);

        TaskDTO savedTask = taskService.createTask(taskDTO);

        assertNotNull(savedTask);
        assertEquals("Test Task", savedTask.getTitle());
        verify(taskRepo, times(1)).save(any(Task.class));
        verify(taskMapper, times(1)).toDTO(any(Task.class));
    }

    /**
     * Tests successfully updating an existing task.
     */
    @Test
    void updateTask_Success() {
        when(taskRepo.findById(1)).thenReturn(Optional.of(task));
        when(taskRepo.save(any(Task.class))).thenReturn(task);
        when(taskMapper.toDTO(any(Task.class))).thenReturn(taskDTO);

        taskDTO.setTitle("Updated Task");

        TaskDTO updatedTask = taskService.updateTask(1, taskDTO);

        assertNotNull(updatedTask);
        assertEquals("Updated Task", updatedTask.getTitle());
        verify(taskRepo, times(1)).save(any(Task.class));
        verify(taskMapper, times(1)).toDTO(any(Task.class));
    }

    /**
     * Tests updating a task while assigning it to an employee.
     */
    @Test
    void updateTask_Success_WithAssignedEmployee() {
        taskDTO.setAssignedEmployeeId(1);
        when(taskRepo.findById(1)).thenReturn(Optional.of(task));
        when(employeeRepo.findById(1)).thenReturn(Optional.of(employee));
        when(taskRepo.save(any(Task.class))).thenReturn(task);
        when(taskMapper.toDTO(any(Task.class))).thenReturn(taskDTO);

        TaskDTO updatedTask = taskService.updateTask(1, taskDTO);

        assertNotNull(updatedTask);
        verify(employeeRepo, times(1)).findById(1);
        verify(taskRepo, times(1)).save(any(Task.class));
        verify(taskMapper, times(1)).toDTO(any(Task.class));
    }

    /**
     * Tests updating a task when the assigned employee is not found.
     */
    @Test
    void updateTask_ThrowsException_WhenAssignedEmployeeNotFound() {
        taskDTO.setAssignedEmployeeId(99);
        when(taskRepo.findById(1)).thenReturn(Optional.of(task));
        when(employeeRepo.findById(99)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.updateTask(1, taskDTO);
        });

        assertEquals("Employee not found", exception.getMessage());
        verify(taskRepo, never()).save(any(Task.class));
    }

    /**
     * Tests successfully deleting a task.
     */
    @Test
    void deleteTask_Success() {
        when(taskRepo.existsById(1)).thenReturn(true);
        doNothing().when(taskRepo).deleteById(1);

        assertDoesNotThrow(() -> taskService.deleteTask(1));

        verify(taskRepo, times(1)).existsById(1);
        verify(taskRepo, times(1)).deleteById(1);
    }

    /**
     * Tests handling of attempting to delete a task that does not exist.
     */
    @Test
    void deleteTask_ThrowsException_WhenTaskNotFound() {
        when(taskRepo.existsById(99)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.deleteTask(99);
        });

        assertEquals("Task not found", exception.getMessage());
        verify(taskRepo, never()).deleteById(anyInt());
    }
}