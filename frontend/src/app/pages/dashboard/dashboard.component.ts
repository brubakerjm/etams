import { Component } from '@angular/core';
import { MetricsService } from "../../services/metrics.service";
import { EmployeeService } from "../../services/employee.service";
import { TaskService } from "../../services/task.service";
import { NgForOf } from "@angular/common";

@Component({
  selector: 'app-dashboard',
  imports: [
    NgForOf
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  /**
   * Array of metrics displayed on the dashboard.
   */
  metrics: { label: string; value: number }[] = [];

  /**
   * Constructor for initializing services.
   */
  constructor(
      private metricsService: MetricsService,
      private employeeService: EmployeeService,
      private taskService: TaskService
  ) {}

  /**
   * Lifecycle hook for loading dashboard metrics.
   */
  ngOnInit(): void {
    this.loadMetrics();
  }

  /**
   * Loads employees and tasks data to calculate and set metrics.
   */
  loadMetrics(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.taskService.getTasks().subscribe({
          next: (tasks) => {
            this.metrics = this.metricsService.calculateDashboardMetrics(employees, tasks);
          },
          error: (error) => console.error('Error fetching tasks:', error),
        });
      },
      error: (error) => console.error('Error fetching employees:', error),
    });
  }
}