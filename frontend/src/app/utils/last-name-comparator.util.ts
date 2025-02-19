import { ClrDatagridComparatorInterface } from "@clr/angular";

/**
 * Custom comparator for sorting by last name.
 *
 * This comparator is used in Clarity Datagrid to sort employee names:
 * - First, it compares last names in a **case-insensitive** manner.
 * - If the last names are **identical**, it falls back to sorting by **first name**.
 *
 * This ensures proper sorting order when multiple employees share the same last name.
 */
export class LastNameComparatorUtil implements ClrDatagridComparatorInterface<any> {

    /**
     * Compares two objects based on their last name (and first name if last names match).
     *
     * @param a - The first object to compare (should have `firstName` and `lastName` properties).
     * @param b - The second object to compare.
     * @returns A negative number if `a` comes before `b`, a positive number if `a` comes after `b`, and `0` if they are equal.
     */
    compare(a: any, b: any): number {
        const lastNameA = a.lastName?.toLowerCase() || ''; // Handle possible null values
        const lastNameB = b.lastName?.toLowerCase() || '';

        // If last names are the same, sort by first name
        if (lastNameA === lastNameB) {
            const firstNameA = a.firstName?.toLowerCase() || '';
            const firstNameB = b.firstName?.toLowerCase() || '';
            return firstNameA.localeCompare(firstNameB);
        }

        // Default: Sort by last name
        return lastNameA.localeCompare(lastNameB);
    }
}