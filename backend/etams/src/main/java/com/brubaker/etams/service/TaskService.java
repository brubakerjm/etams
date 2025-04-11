package com.brubaker.etams.service;

import com.brubaker.etams.dto.TaskDTO;

import java.util.List;

public interface TaskService {
    List<TaskDTO> getAllTasks();

    List<TaskDTO> getTasksByEmployeeId(Integer employeeId);

    TaskDTO createTask(TaskDTO taskDTO);

    TaskDTO updateTask(Integer id, TaskDTO taskDTO);

    void deleteTask(Integer id);
}
