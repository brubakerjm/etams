import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Task } from '../model/task';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private tasksUrl = `${environment.apiUrl}/tasks`;

    constructor(private http: HttpClient) {}

    /**
     * Fetches all tasks from the backend.
     *
     * @returns {Observable<Task[]>} An observable containing the array of tasks.
     */
    getTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.tasksUrl);
    }

    /**
     * Fetches a single task by its ID.
     *
     * @param id The ID of the task to fetch.
     * @returns {Observable<Task>} An observable containing the task.
     */
    getTaskById(id: number): Observable<Task> {
        return this.http.get<Task>(`${this.tasksUrl}/${id}`);
    }

    getTasksByUser(employeeId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.tasksUrl}/user/${employeeId}`);
    }

    /**
     * Saves a new task to the backend.
     *
     * @param task The task object to save.
     * @returns {Observable<Task>} An observable containing the saved task.
     */
    saveTask(task: Task): Observable<Task> {
        return this.http.post<Task>(this.tasksUrl, task);
    }

    /**
     * Updates an existing task in the backend.
     *
     * @param id The ID of the task to update.
     * @param task The updated task object.
     * @returns {Observable<Task>} An observable containing the updated task.
     */
    updateTask(id: number, task: Task): Observable<Task> {
        return this.http.put<Task>(`${this.tasksUrl}/${id}`, task);
    }

    /**
     * Deletes a task by its ID.
     *
     * @param id The ID of the task to delete.
     * @returns {Observable<void>} An observable for the delete operation.
     */
    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.tasksUrl}/${id}`);
    }
}