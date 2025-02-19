import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {Task} from "../../../model/task";
import {Employee} from "../../../model/employee";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    FormControl,
    ValidationErrors,
    Validators,
    ReactiveFormsModule,
} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {EmployeeService} from "../../../services/employee.service";
// import {ClrDatepickerModule, ClrInputModule, ClrModalModule, ClrSelectModule, ClrTextareaModule} from "@clr/angular";
import { ClarityModule } from "@clr/angular";

@Component({
    selector: 'app-tasks-modal',
    standalone: true,
    imports: [
        NgIf,
        NgForOf,
        NgClass,
        ReactiveFormsModule,
        ClarityModule
    ],
    templateUrl: './tasks-modal.component.html',
    styleUrls: ['../modal.component.css'],
})
export class TasksModalComponent {
    /** Controls modal visibility */
    @Input() clrModalOpen: boolean = false;

    /** The task being edited or created */
    @Input() task!: Task;

    /** Indicates whether the form is for a new task */
    @Input() isNew: boolean = true;

    /** Emits event when modal visibility changes */
    @Output() clrModalOpenChange = new EventEmitter<boolean>();

    /** Emits event when a task is saved */
    @Output() save = new EventEmitter<Task>();

    /** Emits event when the modal is closed */
    @Output() close = new EventEmitter<void>();

    /** Emits event when a task is deleted */
    @Output() delete = new EventEmitter<Task>();

    /** Form group for task details */
    taskForm!: FormGroup;

    /** Form control for deadline with validation */
    deadlineControl = new FormControl('', [Validators.required, this.futureDateValidator]);


    /** List of employees fetched from the backend */
    employees: Employee[] = [];

    /** Filtered list of employees for selection */
    filteredEmployees: Employee[] = [];

    constructor(
        private fb: FormBuilder,
        private employeeService: EmployeeService
    ) {
    }

    /**
     * Initializes form and fetches employees when the component is created.
     */
    ngOnInit(): void {
        this.initializeForm();
        console.log("initializeForm():", this.taskForm);
        this.fetchEmployees();
    }

    /**
     * Updates the form values when input properties change.
     * @param changes Object containing changed input properties.
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['task'] && this.task) {
            console.log("Task data received in modal:", this.task);

            // Convert task deadline from `YYYY-MM-DD` to `MM/DD/YYYY` format for Clarity Date Picker
            const formattedDeadline = this.convertDateToPickerFormat(this.task.deadline);
            console.log("Formatted Deadline for Picker:", formattedDeadline);

            this.taskForm.patchValue({
                title: this.task.title,
                description: this.task.description,
                status: this.task.status,
                assignedEmployeeId: this.task.assignedEmployeeId || null,
                deadline: formattedDeadline,  // Correct format for the picker
            });

            // Ensure the form control explicitly receives the updated value
            this.deadlineControl.setValue(formattedDeadline);

            // Not optimal, but how I was able to get the form validation behavior to work as I want it to
            // When an existing task is opened, validations immediately apply to fields so that invalid fields are flagged and error message appears
            // When a new task is opened, validations are only applied to fields that are touched
            if (this.task.id !== null) {
                console.log("this.task.id !== null ran");
                this.taskForm.markAllAsTouched();
                this.taskForm.updateValueAndValidity();
            } else {
                console.log("else ran");
                this.taskForm.reset()
            }

        }
    }

    /**
     * Initializes the task form with validation rules.
     */
    private initializeForm(): void {
        this.taskForm = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', Validators.maxLength(1000)],
            status: ['UNASSIGNED', Validators.required],
            assignedEmployeeId: [null],
        }, {validators: this.crossFieldValidator});
        console.log("initializeForm():", this.taskForm);

        // Add the deadline control separately
        this.taskForm.addControl('deadline', this.deadlineControl);
    }

    /**
     * Validates that the assigned employee and status are consistent.
     * Ensures that:
     * - If an employee is assigned, the status cannot be "UNASSIGNED".
     * - If no employee is assigned, the status must be "UNASSIGNED".
     *
     * @param control The form group to validate.
     * @returns Validation errors if any, otherwise null.
     */
    private crossFieldValidator(control: AbstractControl): ValidationErrors | null {
        let assignedEmployeeIdControl = control.get('assignedEmployeeId');
        let statusControl = control.get('status');

        let assignedEmployeeId: any = assignedEmployeeIdControl?.value;
        let status: string = statusControl?.value;

        if (typeof assignedEmployeeId === 'object' || assignedEmployeeId === "null") {
            assignedEmployeeId = null;
        } else if (typeof assignedEmployeeId === "string") {
            assignedEmployeeId = assignedEmployeeId.trim() ? Number(assignedEmployeeId) : null;
        }

        let statusErrors: ValidationErrors = {};
        let assignedEmployeeErrors: ValidationErrors = {};

        if (assignedEmployeeId !== null && status === "UNASSIGNED") {
            statusErrors['statusForAssignedEmployee'] = true;
            assignedEmployeeErrors['assignedEmployeeMismatch'] = true;
        }

        if (assignedEmployeeId === null && status !== "UNASSIGNED") {
            statusErrors['statusForUnassigned'] = true;
            assignedEmployeeErrors['assignedEmployeeRequired'] = true;
        }

        if (statusControl) {
            statusControl.setErrors(Object.keys(statusErrors).length > 0 ? statusErrors : null);
        }

        if (assignedEmployeeIdControl) {
            assignedEmployeeIdControl.setErrors(Object.keys(assignedEmployeeErrors).length > 0 ? assignedEmployeeErrors : null);
        }

        return Object.keys(statusErrors).length > 0 || Object.keys(assignedEmployeeErrors).length > 0
            ? {...statusErrors, ...assignedEmployeeErrors}
            : null;
    }

    /**
     * Validates that the deadline is today or in the future.
     * @param control The deadline form control.
     * @returns Validation errors if any, otherwise null.
     */
    private futureDateValidator(control: AbstractControl): ValidationErrors | null {
        if (!control.value) return null;

        const dateParts = control.value.split('/');
        if (dateParts.length !== 3) return {invalidFormat: true};

        const [month, day, year] = dateParts.map(Number);
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return inputDate < today ? {pastDate: true} : null;
    }

    /**
     * Fetches employees from the backend and includes an "Unassigned" option.
     */
    fetchEmployees(): void {
        this.employeeService.getEmployees().subscribe({
            next: (data) => {
                const unassignedPlaceholder: Employee = {
                    id: 0, firstName: 'Unassigned', lastName: '',
                    email: '', username: '', role: '', admin: false,
                    createdAt: '', updatedAt: '', taskCount: null,
                };
                this.employees = data;
                this.filteredEmployees = [unassignedPlaceholder, ...this.employees];
            },
            error: (error) => console.error('Error fetching employees:', error)
        });
    }

    /**
     * Filters employees based on search input. Currently not being used.
     * @param event The input event containing the search value.
     *
     *   filterEmployees(event: Event): void {
     *       const inputElement = event.target as HTMLInputElement;
     *       const searchValue = inputElement.value.toLowerCase();
     *       this.filteredEmployees = this.employees.filter(employee =>
     *           `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchValue)
     *       );
     *   }
     *
     */

    /**
     * Submits the form after formatting the deadline correctly for the backend.
     */
    onSubmit(): void {
        if (this.taskForm.valid) {
            console.log("Before formatting:", this.deadlineControl.value);
            const formattedDeadline = this.convertDateForBackend(this.deadlineControl.value ?? '');
            console.log("Submitting Task with Deadline:", formattedDeadline);

            const updatedTask: Task = {
                ...this.task,
                ...this.taskForm.value,
                deadline: formattedDeadline,
            };

            this.save.emit(updatedTask);
        }
    }

    /**
     * Converts a date from the backend format (`YYYY-MM-DD`) to the Clarity Date Picker format (`MM/DD/YYYY`).
     *
     * @param date The date string in `YYYY-MM-DD` format.
     * @returns The formatted date string in `MM/DD/YYYY` format, or an empty string if the input is invalid.
     */
    private convertDateToPickerFormat(date: string): string {
        if (!date) return ''; // Handle empty or null values
        if (date.includes('/')) return date; // Already in `MM/DD/YYYY` format
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year}`;
    }

    /**
     * Converts a date from the Clarity Date Picker format (`MM/DD/YYYY`) to the backend format (`YYYY-MM-DD`).
     *
     * @param date The date string in `MM/DD/YYYY` format.
     * @returns The formatted date string in `YYYY-MM-DD` format, or an empty string if the input is invalid.
     */
    private convertDateForBackend(date: string): string {
        if (!date) return ''; // Handle empty or null values
        const [month, day, year] = date.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    /**
     * Emits the `close` event to notify the parent component to close the modal.
     * Also updates `clrModalOpen` to `false` to close the Clarity modal.
     */
    closeModal(): void {
        this.clrModalOpen = false;
        this.clrModalOpenChange.emit(false);
        this.close.emit();
    }

}