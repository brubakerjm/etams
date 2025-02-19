export interface Employee {
    id: number | null; // Matches `Integer id` in DTO
    firstName: string; // Matches `firstName`
    lastName: string; // Matches `lastName`
    email: string; // Matches `email`
    username: string; // Matches `username`
    role: string; // Matches `role`
    admin: boolean; // Matches `isAdmin`
    createdAt: string; // Matches `createdAt` (formatted as string)
    updatedAt: string; // Matches `updatedAt` (formatted as string)
    taskCount: number | null; // Matches `taskCount` (calculated by back-end)
    password?: string; // Optional for updates, matches `password` in DTO
}