import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { SubHeaderComponent } from "../../components/sub-header/sub-header.component";
import { TableComponent } from "../../components/table/table.component";
import { TaskService } from "../../services/task.service";
import { Task } from "../../model/task";

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        FormsModule,
        SubHeaderComponent,
        TableComponent
    ],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
    title: string = 'Reports';

    allTasks: Task[] = [];
    displayedTasks: Task[] = [];

    tableColumns = [
        { key: 'id',                  label: 'ID' },
        { key: 'title',               label: 'Title' },
        { key: 'assignedEmployeeName',label: 'Assigned To' },
        { key: 'status',              label: 'Status' },
        { key: 'deadline',            label: 'Deadline' },
        { key: 'createdAt',           label: 'Created' },
        { key: 'updatedAt',           label: 'Updated'}
    ];

    selectedReport: 'overdue' | 'activity' = 'overdue';

    startDate: string = '';
    endDate: string = '';

    /**
     * Controls visibility of the "No Data" popup.
     */
    noDataModalVisible = false;

    /**
     * The message shown inside the "No Data" popup.
     */
    noDataMessage = '';

    constructor(private taskService: TaskService) {}

    ngOnInit(): void {
        this.taskService.getTasks().subscribe({
            next: (tasks) => {
                this.allTasks = tasks;
            },
            error: (err) => {
                console.error('Error fetching tasks', err);
            }
        });
    }

    onReportGenerated(event: {
        type: 'overdue' | 'activity';
        startDate?: string;
        endDate?: string;
    }) {
        this.selectedReport = event.type;
        this.startDate = event.startDate || '';
        this.endDate = event.endDate || '';

        if (this.selectedReport === 'overdue') {
            this.showOverdueTasks();
        } else {
            this.showActivityTasks(this.startDate, this.endDate);
        }

        // After filtering, check if there's no data.
        this.checkForNoData();
    }

    private showOverdueTasks(): void {
        const now = new Date();
        this.displayedTasks = this.allTasks.filter(task => {
            const deadlineDate = new Date(task.deadline);
            const isOverdue = deadlineDate < now && task.status !== 'COMPLETED';
            return isOverdue;
        });
    }

    private showActivityTasks(start?: string, end?: string) {
        if (!start && !end) {
            this.displayedTasks = [...this.allTasks];
            return;
        }

        const startDate = start ? new Date(start) : new Date(0);
        const endDate   = end ? new Date(end) : new Date();

        this.displayedTasks = this.allTasks.filter(task => {
            const createdDate = new Date(task.createdAt);
            return (createdDate >= startDate && createdDate <= endDate);
        });
    }

    /**
     * Checks if the resulting `displayedTasks` is empty,
     * and if so, shows a popup with a relevant message.
     */
    private checkForNoData(): void {
        if (this.displayedTasks.length === 0) {
            if (this.selectedReport === 'overdue') {
                this.noDataMessage = 'No overdue tasks found';
            } else {
                this.noDataMessage = 'No tasks found for the selected date range';
            }
            this.noDataModalVisible = true;
        }
    }

    /**
     * Closes the popup.
     */
    closeNoDataModal(): void {
        this.noDataModalVisible = false;
    }
}