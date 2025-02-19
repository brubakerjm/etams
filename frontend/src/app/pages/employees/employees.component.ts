import { Component } from '@angular/core';
import { Employee } from "../../model/employee";
import { EmployeeService } from "../../services/employee.service";
import { MetricsService } from "../../services/metrics.service";
import { TableComponent } from "../../components/table/table.component";
import { EmployeeModalComponent } from "../../components/modal/employee-modal/employee-modal.component";
import { SubHeaderComponent } from "../../components/sub-header/sub-header.component";
import { ConfirmModalComponent } from "../../components/modal/confirm-modal/confirm-modal.component";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  imports: [
    TableComponent,
    EmployeeModalComponent,
    SubHeaderComponent,
    ConfirmModalComponent,
  ],
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {
  /** Title displayed on the page. */
  title: string = 'Employees';

  /** Array of employees retrieved from the backend. */
  employees: Employee[] = [];

  /** Stores employee-related metrics for display in the sub-header. */
  metrics: { label: string; value: number }[] = [];

  /** Currently selected employee for editing. */
  selectedEmployee: Employee | null = null;

  /** Controls the visibility of the Clarity employee modal. */
  clrModalOpen: boolean = false;

  /** Indicates whether the modal is in 'create' mode (`true`) or 'edit' mode (`false`). */
  isNew: boolean = true;

  /** Controls the visibility of the Clarity confirmation modal for deletion. */
  showDeleteConfirmation: boolean = false;

  /** Stores the employee selected for deletion. */
  employeeToDelete: Employee | null = null;

  /** Column definitions for the employee table. */
  columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'taskCount', label: 'Number of Tasks' },
  ];

  constructor(
      private employeeService: EmployeeService,
      private metricsService: MetricsService
  ) {}

  /**
   * Lifecycle hook that initializes the component.
   * Fetches the employee list and calculates metrics.
   */
  ngOnInit(): void {
    this.fetchEmployees();
  }

  /**
   * Fetches the list of employees from the backend.
   * Updates the employee list and recalculates metrics.
   */
  fetchEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees;
        this.calculateMetrics(); // Calculate metrics after fetching employees
        console.log(employees); // TODO: Remove for production
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
      }
    });
  }

  /**
   * Calculates employee-related metrics using `MetricsService`.
   */
  private calculateMetrics(): void {
    this.metrics = this.metricsService.calculateEmployeeMetrics(this.employees);
  }

  /**
   * Opens the Clarity modal for creating or editing an employee.
   * If an employee is provided, the modal is in edit mode; otherwise, it is in create mode.
   * @param employee The employee to edit (optional). If omitted, a new employee is created.
   */
  openModal(employee?: Employee): void {
    console.log("openModal called with:", employee);

    if (!employee) {
      this.isNew = true;
      this.selectedEmployee = {
        id: null,
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        role: '',
        admin: false,
        createdAt: '',
        updatedAt: '',
        taskCount: 0,
        password: ''
      };
    } else {
      this.isNew = false;
      this.selectedEmployee = { ...employee }; // Clone the existing employee for editing
    }

    this.clrModalOpen = true;
    console.log("clrModalOpen set to:", this.clrModalOpen);
  }

  /**
   * Closes the Clarity modal and resets the selected employee.
   */
  closeModal(): void {
    this.clrModalOpen = false;
    this.selectedEmployee = null;
  }

  /**
   * Saves an employee by either creating a new one or updating an existing one.
   * After saving, the employee list is refreshed, and metrics are updated.
   * @param employee The employee object to save.
   */
  saveEmployee(employee: Employee): void {
    console.log('Saving employee:', employee); // Debugging

    if (this.isNew) {
      this.employeeService.saveEmployee(employee).subscribe({
        next: (newEmployee: Employee) => {
          this.employees = [...this.employees, newEmployee]; // Replace array reference
          this.calculateMetrics();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error saving employee:', error);
        }
      });
    } else {
      this.employeeService.updateEmployee(employee.id!, employee).subscribe({
        next: (updatedEmployee: Employee) => {
          this.employees = this.employees.map(e =>
              e.id === updatedEmployee.id ? updatedEmployee : e
          ); // Replace array reference
          this.calculateMetrics();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating employee:', error);
        }
      });
    }
  }

  /**
   * Opens a confirmation modal for deleting an employee.
   * @param employee The employee selected for deletion.
   */
  confirmDeleteEmployee(employee: Employee): void {
    this.employeeToDelete = employee;
    this.showDeleteConfirmation = true;
  }

  /**
   * Deletes an employee after confirmation and updates the list.
   * The employee is removed from the table and metrics are recalculated.
   */
  deleteEmployee(): void {
    if (!this.employeeToDelete) return; // Ensure an employee is selected

    const employeeId = this.employeeToDelete.id; // Extract ID safely
    if (!employeeId) return; // Ensure valid ID

    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: () => {
        // Remove the deleted employee from the list
        this.employees = this.employees.filter(e => e.id !== employeeId);
        this.calculateMetrics();
        this.closeModal();
      },
      error: (error) => console.error('Error deleting employee:', error)
    });

    // Reset delete confirmation state
    this.employeeToDelete = null;
    this.showDeleteConfirmation = false;
  }

}