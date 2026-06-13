import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.module').then((module) => module.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then((module) => module.DashboardModule)
  },
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.module').then((module) => module.TasksModule)
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
