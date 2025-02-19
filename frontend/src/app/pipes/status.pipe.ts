import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {

  /**
   * @description
   * A custom Angular pipe used to transform task statuses from their
   * backend-friendly format to a user-friendly display format.
   *
   * For example:
   * - Transforms "PENDING" to "Pending"
   * - Transforms "IN_PROGRESS" to "In Progress"
   * - Transforms "COMPLETED" to "Completed"
   * - Transforms "UNASSIGNED" to "Unassigned"
   *
   * The transformation is purely for display purposes and does not alter the
   * underlying data model or backend values. The original status values remain intact.
   *
   * @usage
   * In an Angular template:
   * ```
   * {{ task.status | status }}
   * ```
   * Where `task.status` is a string value such as "PENDING" from the backend.
   *
   * @example
   * If the input value is "IN_PROGRESS", the pipe will output "In Progress".
   *
   * @author
   * Jacob Brubaker
   *
   * @version
   * 1.0
   *
   * @since
   * January 2025
   */
  transform(value: string): string {
    const statusMap: { [key: string]: string} = {
      PENDING: 'Pending',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      UNASSIGNED: 'Unassigned',
      null: 'Unassigned'
    };

    return statusMap[value] || value;
  }

}
