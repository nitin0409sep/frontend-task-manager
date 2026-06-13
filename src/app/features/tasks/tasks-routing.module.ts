import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth.guard';
import { TaskFormComponent } from './task-form.component';

const routes: Routes = [
  { path: 'new', component: TaskFormComponent, canActivate: [AuthGuard] },
  { path: ':id/edit', component: TaskFormComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule {}
