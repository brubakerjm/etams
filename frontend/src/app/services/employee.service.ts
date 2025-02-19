import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Employee } from '../model/employee';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private employeesUrl = `${environment.apiUrl}/employees`;

    constructor(private http: HttpClient) {}

    // Fetch all employees
    getEmployees(): Observable<Employee[]> {
        return this.http.get<Employee[]>(this.employeesUrl);
    }

    // Save a new employee
    saveEmployee(employee: Employee): Observable<Employee> {
        return this.http.post<Employee>(this.employeesUrl, employee);
    }

    // Update an existing employee
    updateEmployee(id: number, employee: Employee): Observable<Employee> {
        const url = `${this.employeesUrl}/${id}`;
        return this.http.put<Employee>(url, employee);
    }

    // Delete an employee
    deleteEmployee(id: number): Observable<void> {
        const url = `${this.employeesUrl}/${id}`;
        return this.http.delete<void>(url);
    }

    // Update an employee's password
    updatePassword(id: number, password: string): Observable<void> {
        const url = `${this.employeesUrl}/${id}/password`;
        return this.http.put<void>(url, { password });
    }
}