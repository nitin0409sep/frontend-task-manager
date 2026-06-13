import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '../../shared/shared.module';
import { TaskFormComponent } from './task-form.component';
import { TasksRoutingModule } from './tasks-routing.module';

@NgModule({
  declarations: [TaskFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, SharedModule, TasksRoutingModule]
})
export class TasksModule {}
