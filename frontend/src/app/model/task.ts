export interface Task {
    id: number | null; // Task ID
    title: string; // Task title
    description: string; // Task description
    status: string; // Task status (e.g., PENDING, IN_PROGRESS, COMPLETED)
    deadline: string; // Deadline as a string (YYYY-MM-DD)
    assignedEmployee: {
        id: number;
        firstName: string;
        lastName: string;
    } | null; // Assigned employee or null if unassigned
    assignedEmployeeId: number | null;
    assignedEmployeeName: string | null;
    createdAt: string; // Creation timestamp
    updatedAt: string; // Update timestamp
}