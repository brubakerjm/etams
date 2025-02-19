import { ClrDatagridStringFilterInterface } from "@clr/angular";

import { Employee } from "../model/employee";

/**
 * Custom filter for searching employees by first or last name
 * */
export class NameFilterUtil implements ClrDatagridStringFilterInterface<Employee>{
    accepts(employee: Employee, search: string): boolean {
        const normalizedSearch = search.toLowerCase();
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();

        return employee.firstName.toLowerCase().includes(normalizedSearch) ||
            employee.lastName.toLowerCase().includes(normalizedSearch) ||
            fullName.includes(normalizedSearch);
    }
}