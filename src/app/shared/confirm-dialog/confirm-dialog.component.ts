import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type ConfirmDialogData = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  @Output() confirmed = new EventEmitter<void>();
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}

  confirm(): void {
    if (this.loading) {
      return;
    }

    this.confirmed.emit();
  }

  close(result: boolean): void {
    if (this.loading) {
      return;
    }

    this.dialogRef.close(result);
  }
}
