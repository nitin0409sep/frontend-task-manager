import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { TeamAssignmentDialogComponent } from './team-assignment-dialog/team-assignment-dialog.component';

@NgModule({
  declarations: [DashboardComponent, TeamAssignmentDialogComponent],
  imports: [CommonModule, FormsModule, MaterialModule, SharedModule, DashboardRoutingModule]
})
export class DashboardModule {}
