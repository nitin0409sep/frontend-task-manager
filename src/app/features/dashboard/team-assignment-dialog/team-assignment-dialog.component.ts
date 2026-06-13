import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { apiErrorMessage } from '../../../core/http-error';
import { UserService } from '../../../core/user.service';
import { User } from '../../../models/user.model';

type DialogData = {
  employees: User[];
  teamLeads: User[];
};

@Component({
  selector: 'app-team-assignment-dialog',
  templateUrl: './team-assignment-dialog.component.html'
})
export class TeamAssignmentDialogComponent {
  selectedEmployeeId = '';
  selectedTeamLeadId = '';
  loading = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<TeamAssignmentDialogComponent>,
    private userService: UserService
  ) {}

  assignTeamLead(): void {
    if (!this.selectedEmployeeId || !this.selectedTeamLeadId) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.userService.assignTeamLead(this.selectedEmployeeId, this.selectedTeamLeadId).subscribe({
      next: () => this.dialogRef.close(true),
      error: (error) => {
        this.loading = false;
        this.error = apiErrorMessage(error, 'Team assignment failed');
      }
    });
  }

  trackByUser(_index: number, user: User): string {
    return user._id;
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
