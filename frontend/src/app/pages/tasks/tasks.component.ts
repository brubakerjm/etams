import { Component } from '@angular/core';
import { TableComponent } from '../../components/table/table.component';
import { SubHeaderComponent } from '../../components/sub-header/sub-header.component';
import { TaskService } from "../../services/task.service";
import { Task } from '../../model/task';
import { MetricsService } from "../../services/metrics.service";
import { TasksModalComponent } from "../../components/modal/tasks-modal/tasks-modal.component";
import { AuthService } from "../../services/auth.service";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal/confirm-modal.component";

@Component({
    selector: 'app-tasks',
    imports: [
        TableComponent,
        SubHeaderComponent,
        TasksModalComponent,
        ConfirmModalComponent
    ],
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css']
})
export class TasksComponent {
    /** Page title */
    title: string = 'Tasks';

    /** Stores task-related metrics */
    metrics: { label: string; value: number }[] = [];

    /** List of tasks retrieved from the backend */
    tasks: Task[] = [];

    /** The currently selected task for editing */
    selectedTask: Task | null = null;

    /** Controls whether the task modal is open */
    isModalOpen: boolean = false;

    /** Indicates whether the modal is for creating a new task */
    isNew: boolean = true;

    /** Indicates whether the user is an admin */
    isAdmin!: boolean;

    /** The currently logged-in user's ID */
    userId: number | null = null;

    /** Column definitions for the task table */
    tableColumns!: { key: string, label: string }[];

    /** Controls visibility of the delete confirmation modal */
    showDeleteConfirmation: boolean = false;

    /** Stores the task that is pending deletion */
    taskToDelete: Task | null = null;

    constructor(
        private taskService: TaskService,
        private metricsService: MetricsService,
        private authService: AuthService,
    ) {}

    /**
     * Initializes the component:
     * - Determines if the user is an admin.
     * - Retrieves the user ID.
     * - Initializes table columns.
     * - Fetches tasks from the backend.
     */
    ngOnInit(): void {
        this.isAdmin = this.authService.isAdmin();
        this.userId = this.authService.getEmployeeId();
        this.initializeTableColumns();
        this.fetchTasks();
    }

    /**
     * Initializes table columns based on the user role.
     * - Admins see all task details.
     * - Non-admin users see a subset of columns.
     */
    private initializeTableColumns(): void {
        this.tableColumns = this.isAdmin
            ? [
                { key: 'title', label: 'Task Title' },
                { key: 'description', label: 'Description' },
                { key: 'status', label: 'Status' },
                { key: 'assignedEmployeeName', label: 'Assigned Employee' },
                { key: 'deadline', label: 'Deadline' }
            ]
            : [
                { key: 'title', label: 'Task Title' },
                { key: 'description', label: 'Description' },
                { key: 'status', label: 'Status' },
                { key: 'deadline', label: 'Deadline' }
            ];
    }


    /**
     * Fetches tasks from the backend.
     * - Admins retrieve all tasks.
     * - Non-admin users retrieve only their assigned tasks.
     */
    fetchTasks(): void {
        if (this.isAdmin) {
            this.taskService.getTasks().subscribe({
                next: (tasks: Task[]) => {
                    this.tasks = tasks;
                    this.calculateMetrics();
                },
                error: (error) => console.error('Error fetching tasks:', error)
            });
        } else {
            const userId = this.authService.getEmployeeId();
            if (userId !== null) {
                this.taskService.getTasksByUser(userId).subscribe({
                    next: (tasks: Task[]) => {
                        this.tasks = tasks;
                        this.calculateMetrics();
                    },
                    error: (error) => console.error('Error fetching user tasks:', error)
                });
            } else {
                console.error('User ID is null, cannot fetch tasks.');
            }
        }
    }

    /**
     * Calculates task-related metrics and updates the view.
     */
    private calculateMetrics(): void {
        this.metrics = this.metricsService.calculateTaskMetrics(this.tasks);
    }

    /**
     * Opens the task modal.
     * - If a task is provided, it is edited.
     * - If no task is provided, a new task is created.
     *
     * @param {Task} [task] - The task to edit (optional).
     */
    openModal(task?: Task): void {
        console.log("openModal called with:", task);

        if (!task) {
            this.isNew = true;
            this.selectedTask = {
                id: null,
                title: '',
                description: '',
                status: 'UNASSIGNED',
                deadline: '',
                assignedEmployee: null,
                assignedEmployeeId: null,
                assignedEmployeeName: null,
                createdAt: '',
                updatedAt: ''
            };
        } else {
            this.isNew = false;
            this.selectedTask = { ...task };
        }

        this.isModalOpen = true;
        console.log("isModalOpen set to:", this.isModalOpen);
    }

    /**
     * Closes the task modal and resets the selected task.
     */
    closeModal(): void {
        this.isModalOpen = false;
        this.selectedTask = null;
    }

    /**
     * Saves a task.
     * - If creating a new task, it is added to the task list.
     * - If editing an existing task, it is updated.
     *
     * @param {Task} task - The task to save.
     */
    saveTask(task: Task): void {
        if (this.isNew) {
            this.taskService.saveTask(task).subscribe({
                next: (newTask: Task) => {
                    this.tasks = [...this.tasks, newTask];
                    this.calculateMetrics();
                    this.closeModal();
                },
                error: (error) => console.error('Error saving task:', error)
            });
        } else {
            this.taskService.updateTask(task.id!, task).subscribe({
                next: (updatedTask: Task) => {
                    this.tasks = this.tasks.map((t) =>
                        t.id === updatedTask.id ? updatedTask : t
                    );
                    this.calculateMetrics();
                    this.closeModal();
                },
                error: (error) => console.error('Error updating task:', error)
            });
        }
    }

    /**
     * Opens the delete confirmation modal for a task.
     *
     * @param {Task} task - The task to delete.
     */
    confirmDeleteTask(task: Task): void {
        this.taskToDelete = task;
        this.showDeleteConfirmation = true;
    }

    /**
     * Deletes the selected task after confirmation.
     */
    deleteTask(): void {
        if (!this.taskToDelete) return;

        const taskId = this.taskToDelete.id;

        if (!taskId) return;

        this.taskService.deleteTask(taskId).subscribe({
            next: () => {
                this.tasks = this.tasks.filter((t) => t.id !== taskId);
                this.calculateMetrics();
                this.closeModal();
            },
            error: (error) => console.error('Error deleting task:', error)
        });

        this.taskToDelete = null;
        this.showDeleteConfirmation = false;
    }
}