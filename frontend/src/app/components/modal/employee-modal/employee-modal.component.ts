import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Employee } from '../../../model/employee';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
// import {ClrCheckboxModule, ClrInputModule, ClrModalModule} from "@clr/angular";
import { ClarityModule } from "@clr/angular";

@Component({
    selector: 'app-employee-modal',
    templateUrl: './employee-modal.component.html',
    imports: [ReactiveFormsModule, NgIf, ClarityModule],
    styleUrls: ['../modal.component.css'],
})
export class EmployeeModalComponent {
    /** Controls whether the modal is open or closed. */
    @Input() clrModalOpen: boolean = false;

    /** The employee being created or edited. */
    @Input() employee!: Employee;

    /** Indicates whether the employee is new (`true`) or being edited (`false`). */
    @Input() isNew: boolean = true;

    /** Emits the updated employee object when the form is submitted. */
    @Output() save: EventEmitter<Employee> = new EventEmitter<Employee>();

    /** Emits an event to notify the parent component to close the modal. */
    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    /** Emits the employee object to notify the parent component of a delete request. */
    @Output() delete: EventEmitter<Employee> = new EventEmitter<Employee>();

    /** Emits an event when modal visibility changes. */
    @Output() clrModalOpenChange = new EventEmitter<boolean>();

    /** Reactive form instance for managing employee input fields and validation. */
    employeeForm!: FormGroup;

    /** Tracks whether the delete confirmation dialog is visible. */
    showConfirmation: boolean = false;

    /**
     * Validation rules for the password field:
     * - `Validators.required`: Ensures a password is provided for new employees.
     * - `Validators.minLength(8)`: Enforces a minimum length of 8 characters.
     * - `Validators.pattern(...)`: Requires at least one uppercase letter, lowercase letter, digit, and special character.
     */
    private passwordValidators = [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/),
    ];

    constructor(private fb: FormBuilder) {}

    /**
     * Lifecycle hook: Initializes the form when the component is first loaded.
     */
    ngOnInit(): void {
        this.initializeForm();
    }

    /**
     * Lifecycle hook: Detects changes to the `@Input() employee` and updates the form accordingly.
     * Ensures that the form reflects the correct employee data when editing.
     * @param changes Contains the changes in input properties.
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['employee'] && this.employee) {
            console.log("🔄 Updating Employee Form with:", this.employee);
            console.log("isNew value:", this.isNew)

            if (this.isNew) {
                // Resetting new employee values and states
                this.employeeForm.reset();

                // Reapply the password validators
                this.employeeForm.get('password')?.setValidators(this.passwordValidators);
                this.employeeForm.get('password')?.updateValueAndValidity();

            }
            this.updateForm();
        }
    }

    /**
     * Initializes the employee form with validation rules.
     * Applies different validation behaviors depending on whether an employee is new or being edited.
     */
    private initializeForm(): void {
        this.employeeForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.maxLength(50)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            email: ['', [Validators.required, Validators.email]],
            username: ['', [Validators.required, Validators.maxLength(50)]],
            password: ['', this.isNew ? this.passwordValidators : []], // Password required for new employees
            role: ['', Validators.required],
            admin: [this.employee?.admin ?? false], // Default admin status to `false` if undefined
        });

        // Populate form fields if editing an existing employee
        if (this.employee) {
            this.employeeForm.patchValue({
                firstName: this.employee.firstName,
                lastName: this.employee.lastName,
                email: this.employee.email,
                username: this.employee.username || '',
                password: '',  // Password should always be blank when editing
                role: this.employee.role,
                admin: this.employee.admin,
            });
        }

        // Ensure password validation is enforced for new employees
        if (this.isNew) {
            this.employeeForm.get('password')?.markAsTouched();
            this.employeeForm.get('password')?.updateValueAndValidity();
        }

        // Dynamically enforce password validation only when updating an employee and a new password is entered
        this.employeeForm.get('password')?.valueChanges.subscribe((value) => {
            this.updatePasswordValidators(value);
        });
    }

    /**
     * Updates the form with the selected employee's data when editing.
     * Ensures that old data is not carried over when switching between employees.
     */
    private updateForm(): void {
        if (!this.employeeForm) return; // Ensure form is initialized

        this.employeeForm.patchValue({
            firstName: this.employee.firstName,
            lastName: this.employee.lastName,
            email: this.employee.email,
            username: this.employee.username || '',
            password: '', // Password field should remain empty when editing
            role: this.employee.role,
            admin: this.employee.admin ?? false,
        });
    }

    /**
     * Dynamically updates password validators when the user starts typing in the password field.
     * - Adds validation rules only when a new password is entered.
     * - Clears validation rules when the password is left blank for existing employees.
     * @param value The current value of the password field.
     */
    private updatePasswordValidators(value: string): void {
        const passwordControl = this.employeeForm.get('password');

        if (!this.isNew) {
            if (value) {
                passwordControl?.setValidators(this.passwordValidators);
            } else {
                passwordControl?.clearValidators(); // Allow keeping the existing password
            }
            passwordControl?.updateValueAndValidity({ emitEvent: false });
        }
    }

    /**
     * Handles form submission.
     * - Validates the form and emits the `save` event with the employee data.
     * - Ensures passwords are handled correctly:
     *    - Required for new employees.
     *    - Optional for existing employees (only included if changed).
     */
    onSubmit(): void {
        if (this.employeeForm.valid) {
            const updatedEmployee: Employee = {
                ...this.employee,
                ...this.employeeForm.value,
            };

            // Ensure password is required for new employees
            if (this.isNew && !this.employeeForm.get('password')?.value) {
                console.error('Password is required for new employees.');
                return;
            }

            // Remove password field if unchanged during editing
            if (!this.isNew && !this.employeeForm.get('password')?.value) {
                delete updatedEmployee.password;
            }

            this.save.emit(updatedEmployee);
            this.closeModal();
        } else {
            console.error('Form is invalid. Please fix errors and try again.');
        }
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