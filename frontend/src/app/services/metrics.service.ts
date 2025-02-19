// // // import { Injectable } from '@angular/core';
// // // import { Task } from "../model/task";
// // // import { Employee } from "../model/employee";
// // //
// // // @Injectable({
// // //   providedIn: 'root'
// // // })
// // // export class MetricsService {
// // //
// // //   constructor() {}
// // //
// // //   /**
// // //    * Calculates metrics for tasks based on their status.
// // //    * Includes totals for 'Pending', 'In Progress', and 'Completed' tasks.
// // //    *
// // //    * @param tasks - Array of tasks
// // //    * @returns Array of metrics with labels and values for task statuses
// // //    */
// // //   calculateTaskMetrics(tasks: Task[]): { label: string; value: number }[] {
// // //     const total = tasks.length;
// // //     const pending = tasks.filter(task => task.status === 'PENDING').length;
// // //     const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
// // //     const completed = tasks.filter(task => task.status === 'COMPLETED').length;
// // //
// // //     return [
// // //       { label: 'Total Tasks', value: total },
// // //       { label: 'Pending Tasks', value: pending },
// // //       { label: 'In Progress Tasks', value: inProgress },
// // //       { label: 'Completed Tasks', value: completed },
// // //     ];
// // //   }
// // //
// // //   /**
// // //    * Calculates metrics for employees based on roles and admin privileges.
// // //    *
// // //    * @param employees - Array of employees
// // //    * @returns Array of metrics with labels and values for employees
// // //    */
// // //   calculateEmployeeMetrics(employees: Employee[]): { label: string; value: number }[] {
// // //     const total = employees.length;
// // //     const admins = employees.filter(emp => emp.admin).length;
// // //     const regularEmployees = total - admins;
// // //
// // //     return [
// // //       { label: 'Total Employees', value: total },
// // //       { label: 'Admins', value: admins },
// // //       { label: 'Regular Employees', value: regularEmployees },
// // //     ];
// // //   }
// // //
// // //   /**
// // //    * Calculates all metrics needed for the dashboard, including task and employee-related metrics.
// // //    *
// // //    * Metrics include:
// // //    * - Total Employees
// // //    * - Total Tasks
// // //    * - Pending Tasks
// // //    * - In Progress Tasks
// // //    * - Unassigned Tasks
// // //    * - Overdue Tasks
// // //    *
// // //    * @param employees - Array of employees
// // //    * @param tasks - Array of tasks
// // //    * @returns Array of metrics with labels and values for the dashboard
// // //    */
// // //   calculateDashboardMetrics(employees: Employee[], tasks: Task[]): { label: string; value: number }[] {
// // //     const totalEmployees = employees.length;
// // //     const totalTasks = tasks.length;
// // //     const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
// // //     const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
// // //     const unassignedTasks = tasks.filter(task => !task._links['assignedEmployee']).length;
// // //
// // //     const overdueTasks = tasks.filter(task => {
// // //       const deadline = new Date(task.deadline);
// // //       const today = new Date();
// // //       return task.status !== 'COMPLETED' && deadline < today;
// // //     }).length;
// // //
// // //     return [
// // //       { label: 'Total Employees', value: totalEmployees },
// // //       { label: 'Total Tasks', value: totalTasks },
// // //       { label: 'Pending Tasks', value: pendingTasks },
// // //       { label: 'In Progress Tasks', value: inProgressTasks },
// // //       { label: 'Unassigned Tasks', value: unassignedTasks },
// // //       { label: 'Overdue Tasks', value: overdueTasks },
// // //     ];
// // //   }
// // // }
// //
// // import { Injectable } from '@angular/core';
// // import { Task } from "../model/task";
// // import { Employee } from "../model/employee";
// //
// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class MetricsService {
// //
// //   constructor() {}
// //
// //   /**
// //    * Calculates metrics for tasks based on their status.
// //    * Includes totals for 'Pending', 'In Progress', and 'Completed' tasks.
// //    *
// //    * @param tasks - Array of tasks
// //    * @returns Array of metrics with labels and values for task statuses
// //    */
// //   calculateTaskMetrics(tasks: Task[]): { label: string; value: number }[] {
// //     const total = tasks.length;
// //     const pending = tasks.filter(task => task.status === 'PENDING').length;
// //     const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
// //     const completed = tasks.filter(task => task.status === 'COMPLETED').length;
// //
// //     return [
// //       { label: 'Total Tasks', value: total },
// //       { label: 'Pending Tasks', value: pending },
// //       { label: 'In Progress Tasks', value: inProgress },
// //       { label: 'Completed Tasks', value: completed },
// //     ];
// //   }
// //
// //   /**
// //    * Calculates metrics for employees based on roles and admin privileges.
// //    *
// //    * @param employees - Array of employees
// //    * @returns Array of metrics with labels and values for employees
// //    */
// //   calculateEmployeeMetrics(employees: Employee[]): { label: string; value: number }[] {
// //     const total = employees.length;
// //     const admins = employees.filter(emp => emp.isAdmin).length;
// //     const regularEmployees = total - admins;
// //
// //     return [
// //       { label: 'Total Employees', value: total },
// //       { label: 'Admins', value: admins },
// //       { label: 'Regular Employees', value: regularEmployees },
// //     ];
// //   }
// //
// //   /**
// //    * Calculates all metrics needed for the dashboard, including task and employee-related metrics.
// //    *
// //    * Metrics include:
// //    * - Total Employees
// //    * - Total Tasks
// //    * - Pending Tasks
// //    * - In Progress Tasks
// //    * - Unassigned Tasks
// //    * - Overdue Tasks
// //    *
// //    * @param employees - Array of employees
// //    * @param tasks - Array of tasks
// //    * @returns Array of metrics with labels and values for the dashboard
// //    */
// //   // calculateDashboardMetrics(employees: Employee[], tasks: Task[]): { label: string; value: number }[] {
// //   //   const totalEmployees = employees.length;
// //   //   const totalTasks = tasks.length;
// //   //   const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
// //   //   const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
// //   //
// //   //   const unassignedTasks = tasks.filter(task => !task.assignedEmployeeId).length;
// //   //
// //   //   const overdueTasks = tasks.filter(task => {
// //   //     const deadline = new Date(task.deadline);
// //   //     const today = new Date();
// //   //     return task.status !== 'COMPLETED' && deadline < today;
// //   //   }).length;
// //   //
// //   //   return [
// //   //     { label: 'Total Employees', value: totalEmployees },
// //   //     { label: 'Total Tasks', value: totalTasks },
// //   //     { label: 'Pending Tasks', value: pendingTasks },
// //   //     { label: 'In Progress Tasks', value: inProgressTasks },
// //   //     { label: 'Unassigned Tasks', value: unassignedTasks },
// //   //     { label: 'Overdue Tasks', value: overdueTasks },
// //   //   ];
// //   // }
// // }
//
//
// import { Injectable } from '@angular/core';
// import { Task } from "../model/task";
// import { Employee } from "../model/employee";
//
// @Injectable({
//   providedIn: 'root'
// })
// export class MetricsService {
//   constructor() {}
//
//   /**
//    * Calculates task metrics (e.g., total, pending, in-progress, completed).
//    *
//    * @param tasks The list of tasks.
//    * @returns Array of metrics with labels and values.
//    */
//   calculateTaskMetrics(tasks: Task[]): { label: string; value: number }[] {
//     const total = tasks.length;
//     const pending = tasks.filter(task => task.status === 'PENDING').length;
//     const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
//     const completed = tasks.filter(task => task.status === 'COMPLETED').length;
//
//     return [
//       { label: 'Total Tasks', value: total },
//       { label: 'Pending Tasks', value: pending },
//       { label: 'In Progress Tasks', value: inProgress },
//       { label: 'Completed Tasks', value: completed },
//     ];
//   }
//
//   /**
//    * Calculates dashboard metrics for employees and tasks.
//    *
//    * @param employees The list of employees.
//    * @param tasks The list of tasks.
//    * @returns Array of metrics for the dashboard.
//    */
//   calculateDashboardMetrics(employees: Employee[], tasks: Task[]): { label: string; value: number }[] {
//     const totalEmployees = employees.length;
//     const totalTasks = tasks.length;
//     const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
//     const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
//
//     const unassignedTasks = tasks.filter(task => !task.assignedEmployee).length;
//
//     const overdueTasks = tasks.filter(task => {
//       const deadline = new Date(task.deadline);
//       const today = new Date();
//       return task.status !== 'COMPLETED' && deadline < today;
//     }).length;
//
//     return [
//       { label: 'Total Employees', value: totalEmployees },
//       { label: 'Total Tasks', value: totalTasks },
//       { label: 'Pending Tasks', value: pendingTasks },
//       { label: 'In Progress Tasks', value: inProgressTasks },
//       { label: 'Unassigned Tasks', value: unassignedTasks },
//       { label: 'Overdue Tasks', value: overdueTasks },
//     ];
//   }
// }

import {Injectable} from '@angular/core';
import {Task} from "../model/task";
import {Employee} from "../model/employee";

@Injectable({
    providedIn: 'root'
})
export class MetricsService {
    constructor() {
    }

    /**
     * Calculates task-related metrics.
     *
     * @param tasks List of tasks.
     * @returns Metrics for tasks.
     */
    calculateTaskMetrics(tasks: Task[]): { label: string; value: number }[] {
        const total = tasks.length;
        const pending = tasks.filter(task => task.status === 'PENDING').length;
        const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
        const completed = tasks.filter(task => task.status === 'COMPLETED').length;
        const unassigned = tasks.filter(task => task.status === 'UNASSIGNED').length;

        return [
            {label: 'Total Tasks', value: total},
            {label: 'Pending Tasks', value: pending},
            {label: 'In Progress Tasks', value: inProgress},
            {label: 'Unassigned Tasks', value: unassigned},
            {label: 'Completed Tasks', value: completed},
        ];
    }

    /**
     * Calculates metrics for employees.
     *
     * @param employees List of employees.
     * @returns Metrics for employees.
     */
    calculateEmployeeMetrics(employees: Employee[]): { label: string; value: number }[] {
        const total = employees.length;
        const admins = employees.filter(emp => emp.admin).length;
        const regularEmployees = total - admins;

        return [
            {label: 'Total Employees', value: total},
            {label: 'Admins', value: admins},
            {label: 'Regular Employees', value: regularEmployees},
        ];
    }

    /**
     * Calculates dashboard metrics for employees and tasks.
     *
     * @param employees List of employees.
     * @param tasks List of tasks.
     * @returns Combined metrics for the dashboard.
     */
    calculateDashboardMetrics(employees: Employee[], tasks: Task[]): { label: string; value: number }[] {
        const totalEmployees = employees.length;
        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
        const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
        const unassignedTasks = tasks.filter(task => task.status === 'UNASSIGNED').length;

        const overdueTasks = tasks.filter(task => {
            const deadline = new Date(task.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            return task.status !== 'COMPLETED' && deadline < today;
        }).length;

        return [
            {label: 'Total Employees', value: totalEmployees},
            {label: 'Total Tasks', value: totalTasks},
            {label: 'Pending Tasks', value: pendingTasks},
            {label: 'In Progress Tasks', value: inProgressTasks},
            {label: 'Unassigned Tasks', value: unassignedTasks},
            {label: 'Overdue Tasks', value: overdueTasks},
        ];
    }
}