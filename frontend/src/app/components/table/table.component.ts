import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DatePipe, NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {StatusPipe} from '../../pipes/status.pipe';
import {ClrDataModule, ClrIconModule, ClrInputModule} from "@clr/angular";
import {LastNameComparatorUtil} from "../../utils/last-name-comparator.util";
import { NameFilterUtil } from "../../utils/name-filter.util";
import { AuthService } from "../../services/auth.service";


/**
 * A reusable, sortable, and filterable table component. It displays data
 * based on the provided columns definition and data array. It also
 * integrates with a SearchService signal for text-based filtering.
 */
@Component({
    selector: 'app-table',
    imports: [
        DatePipe,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        FormsModule,
        StatusPipe,
        ClrDataModule,
        NgForOf,
        ClrIconModule,
        ClrInputModule,
    ],
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css']
})
export class TableComponent {
    /**
     * Defines the column configuration for the table.
     *
     * Each object in this array should contain:
     *  - `key`: The property name in the data.
     *  - `label`: The column header text displayed in the table.
     */
    @Input() columns: { key: string; label: string }[] = [];

    /**
     * The dataset to be displayed in the table.
     * Each item in this array should be an object where properties
     * match the keys defined in `columns`.
     */
    @Input() data: any[] = [];

    /**
     * The message to be displayed when the table has no data.
     * This allows dynamic customization based on the context (e.g., tasks, employees).
     */
    @Input() emptyMessage: string = "";

    isAdmin: boolean = false;


    /**
     * Emits an event when edit action is triggered for a row.
     * The event contains the data object of the row being edited.
     */
    @Output() editClick = new EventEmitter<any>();

    /**
     * Emits an event when a delete action is triggered for a row.
     * The event contains the data object of the row being deleted.
     */
    @Output() deleteClick = new EventEmitter<any>();

    /**
     * Tracks the current column being sorted and the sorting direction.
     *  - `columnKey`: which column is currently sorted
     *  - `direction`: 'asc' or 'desc'
     *
     *  Currently not being used
     */
    // sortState: { columnKey: string | null; direction: 'asc' | 'desc' } = {
    //   columnKey: null,
    //   direction: 'asc'
    // };

    /**
     * A local placeholder for a search query string (not actively used here
     * since we integrate directly with the SearchService's signal).
     */
    // searchQuery: string = '';

    /**
     * Initializes the table component and sets up a reactive effect to
     * re-filter and sort data whenever the search text changes.
     *
     * Currently not being used.
     *
     * @param searchService - Injected service containing the `searchText` signal.
     */
        // constructor(private searchService: SearchService) {
        //   // effect() automatically triggers applyFilterAndSort() whenever searchText changes.
        //   effect(() => {
        //     this.applyFilterAndSort();
        //   });
        // }

    /**
     * Stores the currently selected row(s) for the Clarity Details Pane.
     * Clarity expects this to be an array.
     */
    selectedRow: any[] = [];

    /**
     * Comparator for sorting last names.
     * This is used for cases where sorting by last name should take precedence.
     */
    lastNameComparator = new LastNameComparatorUtil();

    nameFilter = new NameFilterUtil();

    constructor(private authService: AuthService) {
    }

    ngOnInit(): void{
        this.isAdmin = this.authService.isAdmin();
    }

    /**
     * Determines if the dataset is empty.
     * Used to conditionally display a placeholder message when no data is available.
     *
     * @returns `true` if `data` array is empty, otherwise `false`.
     */
    get isListEmpty(): boolean {
        return this.data.length === 0;
    }

    /**
     * Determines the primary label key for display purposes.
     * This key is used as the title in the details pane.
     *
     * Priority Order: `title`, `name`, `firstName`, `taskName`
     *
     * @returns A string representing the most appropriate key from the dataset.
     */
    get primaryLabelKey(): string {
        const possibleKeys = ['title', 'name', 'firstName', 'taskName'];
        return possibleKeys.find(key => this.data.length > 0 && key in this.data[0]) || 'id';
    }

    /**
     * Opens the Clarity Details Pane for a selected row.
     *
     * @param row - The selected row's data object.
     */
    openDetail(row: any): void {
        this.selectedRow = [row]; // Clarity requires an array
    }

    /**
     * Retrieves all keys of an object to dynamically display all available fields in the details pane.
     *
     * @param detail - The selected row object.
     * @returns An array of all keys in the object.
     */
    getAllKeys(detail: any): string[] {
        return Object.keys(detail).filter(key => detail[key] !== undefined);
    }

    /**
     * Formats a key name into a more readable format for the details pane.
     *
     * Example: `'createdAt'` → `'Created At'`
     *
     * @param key - The object key to format.
     * @returns A formatted string for display.
     */
    formatKey(key: string): string {
        return key
            .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
    }

    /**
     * Handles the rendering range change event in Clarity Datagrid.
     *
     * This method is primarily used for debugging purposes, logging the
     * start and end of rendered rows.
     *
     *  TODO Remove for production
     *
     * @param range - Object containing `start` and `end` indices of rendered rows.
     */
    onRenderRangeChange(range: { start: number; end: number }) {
        console.log(`Rendering rows from ${range.start} to ${range.end}`);
        console.log(`Total rendered rows: ${range.end - range.start}`);
    }

    /**
     * Triggers an edit event when a row is clicked for editing.
     *
     * @param row - The data object of the row being edited.
     */
    onEdit(row: any): void {
        console.log("Editing row:", row);
        this.editClick.emit(row);
    }

    /**
     * Triggers a delete event when a delete action is initiated for a row.
     *
     * @param row - The data object of the row being deleted.
     */
    onDelete(row: any): void {
        console.log("Deleting row:", row);
        this.deleteClick.emit(row);
    }

    /**
     * Filters the table data based on the current value of `searchText` in the SearchService
     * and applies the active sorting (if any).
     *
     * Currently not being used.
     */
    // applyFilterAndSort(): void {
    //   const query = this.searchService.searchText().toLowerCase();
    //
    //   // Filter out any rows that don't match the search query.
    //   let newData = this.data.filter(row =>
    //       Object.values(row).some(value =>
    //           value && value.toString().toLowerCase().includes(query)
    //       )
    //   );
    //
    //   // Apply sorting if a column is selected.
    //   if (this.sortState.columnKey) {
    //     newData = this.sortArray(newData, this.sortState.columnKey, this.sortState.direction);
    //   }
    //
    //   this.filteredData = newData;
    // }


    /**
     * Helper method to sort an array by a specified column key and direction.
     *
     * Currently not being used.
     *
     * @param array - The array to sort (usually the filteredData).
     * @param columnKey - The property name to sort by.
     * @param direction - 'asc' or 'desc'.
     * @returns A new array sorted according to the specified columnKey and direction.
     */
    // private sortArray(array: any[], columnKey: string, direction: 'asc' | 'desc'): any[] {
    //   const directionMultiplier = direction === 'asc' ? 1 : -1;
    //
    //   return [...array].sort((a, b) => {
    //     let valueA: string = '';
    //     let valueB: string = '';
    //
    //     if (columnKey === 'name') {
    //       // Special case for sorting by "name" -> sort by lastName, then by firstName
    //       valueA = (a.lastName || '').toLowerCase();
    //       valueB = (b.lastName || '').toLowerCase();
    //       if (valueA === valueB) {
    //         valueA = (a.firstName || '').toLowerCase();
    //         valueB = (b.firstName || '').toLowerCase();
    //       }
    //     } else {
    //       // Default sort by the given columnKey
    //       valueA = a[columnKey]?.toString().toLowerCase() || '';
    //       valueB = b[columnKey]?.toString().toLowerCase() || '';
    //     }
    //
    //     return valueA < valueB
    //         ? -1 * directionMultiplier
    //         : valueA > valueB
    //             ? 1 * directionMultiplier
    //             : 0;
    //   });
    // }

}