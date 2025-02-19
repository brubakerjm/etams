import { Component, EventEmitter, Input, Output } from '@angular/core';
import {ClrAlertModule, ClrModalModule} from "@clr/angular";

@Component({
  selector: 'app-confirm-modal',
  imports: [
    ClrModalModule,
    ClrAlertModule
  ],
  template: `
    <clr-modal [(clrModalOpen)]="show" (clrModalOpenChange)="cancel()">
      <h3 class="modal-title">{{ title }}</h3>
      <div class="modal-body">
        <clr-alert [clrAlertType]="'warning'" [clrAlertClosable]="false" [clrAlertLightweight]="false">
          <clr-alert-item>
            <span class="alert-text">This cannot be undone!</span>
          </clr-alert-item>          
        </clr-alert>
        <p style="padding-bottom: 0.5rem">{{ message }}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" (click)="cancel()">Cancel</button>
        <button type="button" class="btn btn-danger" (click)="confirm()">Confirm</button>
      </div>
    </clr-modal>
  `,
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent {
  /** Controls modal visibility */
  @Input() show: boolean = false;

  /** Modal title */
  @Input() title: string = 'Confirm Action';

  /** Confirmation message */
  @Input() message: string = 'Are you sure you want to proceed?';

  /** Emits event when confirmed */
  @Output() confirmed = new EventEmitter<void>();

  /** Emits event when canceled */
  @Output() canceled = new EventEmitter<void>();

  confirm(): void {
    this.confirmed.emit();
    this.show = false;  // Close modal after confirmation
  }

  cancel(): void {
    this.canceled.emit();
    this.show = false;  // Close modal on cancel
  }
}