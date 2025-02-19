import { Component, EventEmitter, Input, Output } from '@angular/core';
import {NgForOf} from '@angular/common';
import { SearchService } from '../../services/search.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from "../../services/auth.service";
import {ClrDatepickerModule, ClrFormsModule, ClrSignpostModule, ClrTooltipModule} from "@clr/angular";

/**
 * A sub-header component that can display:
 *  - A main title and metrics,
 *  - An optional search box,
 *  - An optional "New" action button,
 *  - An optional report-selection dropdown (Overdue vs Activity),
 * and emits events for creating a new item or generating a report.
 */
@Component({
  selector: 'app-sub-header',
  standalone: true,
  imports: [NgForOf, FormsModule, ClrDatepickerModule, ClrFormsModule, ClrSignpostModule, ReactiveFormsModule, ClrTooltipModule],
  templateUrl: './sub-header.component.html',
  styleUrls: ['./sub-header.component.css']
})
export class SubHeaderComponent {
  /**
   * The main title to display in the sub-header (e.g., "Tasks").
   */
  @Input() title: string = '';

  /**
   * An array of metrics to display. Each metric has:
   *   - label (e.g., "Open Tasks")
   *   - value (e.g., 5)
   */
  @Input() metrics: { label: string; value: string | number }[] = [];

  /**
   * If true, displays the metrics container. If false, the metrics are hidden.
   * Defaults to true.
   */
  @Input() metricsEnabled: boolean = true;

  /**
   * If true, displays the search container. If false, the search box is hidden.
   * Defaults to true.
   */
  @Input() searchEnabled: boolean = true;

  /**
   * If true, displays the "New" action button. If false, the button is hidden.
   * Defaults to true.
   */
  @Input() newActionBtnEnabled: boolean = true;

  /**
   * If true, displays the report-selection section (Overdue vs. Activity)
   * and the optional date range pickers for the Activity report.
   * Defaults to false.
   */
  @Input() reportSelection: boolean = false;

  /**
   * Emits an event when the user clicks the "New" button.
   * Parent components can listen for this event to create a new item
   * or open a form, etc.
   */
  @Output() newAction = new EventEmitter<void>();

  /**
   * Emits an event when the user selects a report type ("overdue" or "activity")
   * and clicks the "Generate" button, optionally providing a start/end date.
   */
  @Output() reportGenerated = new EventEmitter<{
    type: 'overdue' | 'activity';
    startDate?: string;
    endDate?: string;
  }>();

  /**
   * Tracks which report type is currently selected in the dropdown.
   * Defaults to "overdue."
   */
  selectedReport: 'overdue' | 'activity' = 'overdue';

  /**
   * Optional start date for the "Task Activity" report.
   * If empty, defaults to showing all tasks from the earliest date.
   */
  startDate: string = '';

  /**
   * Optional end date for the "Task Activity" report.
   * If empty, defaults to showing all tasks up to the current date.
   */
  endDate: string = '';
  isAdmin: boolean;

  /**
   * Injects the SearchService for handling live-search input.
   * @param searchService - The service that stores the search text signal.
   */
  constructor(public searchService: SearchService, private authService: AuthService) {
    this.isAdmin = this.authService.isAdmin();
  }

  /**
   * Fires the `newAction` event when the user clicks the "New" button.
   */
  triggerNewAction(): void {
    this.newAction.emit();
  }

  /**
   * Fires the `reportGenerated` event when the user clicks the "Generate" button
   * after selecting a report type, and optionally specifying a date range
   * for the "Task Activity" report.
   */
  generateReport(): void {
    this.reportGenerated.emit({
      type: this.selectedReport,
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

  /**
   * Handles text input in the search field by updating the SearchService signal.
   * This in turn triggers filtering in any components (e.g., a Table) that subscribe
   * to the search text.
   *
   * @param event - The native DOM input event containing the user's typed value.
   */
  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchService.searchText.set(target.value);
  }
}