import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { apiErrorMessage } from '../../core/http-error';
import { TaskService } from '../../core/task.service';
import { ToastService } from '../../core/toast.service';
import { UserService } from '../../core/user.service';
import { TaskStatus } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnInit {
  users: User[] = [];
  taskId = this.route.snapshot.paramMap.get('id');
  loadingTask = false;
  savingTask = false;
  error = '';

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    description: ['', Validators.maxLength(1000)],
    status: ['pending' as TaskStatus, Validators.required],
    assignedTo: ['']
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private toast: ToastService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    if (this.taskId) {
      this.loadTask(this.taskId);
    }
  }

  get currentUser(): User {
    return this.auth.currentUser as User;
  }

  get isEditMode(): boolean {
    return Boolean(this.taskId);
  }

  get canAssign(): boolean {
    return this.currentUser.role !== 'Employee';
  }

  get assignableUsers(): User[] {
    if (this.currentUser.role === 'Manager') {
      return this.users;
    }

    if (this.currentUser.role === 'Team Lead') {
      return this.users.filter((user) => user._id === this.currentUser._id || user.role === 'Employee');
    }

    return [this.currentUser];
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.items;
        if (!this.taskForm.value.assignedTo && this.canAssign) {
          this.taskForm.patchValue({ assignedTo: this.currentUser._id });
        }
      },
      error: (error) => this.showError(error, 'Failed to load users')
    });
  }

  loadTask(id: string): void {
    this.loadingTask = true;
    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          status: task.status,
          assignedTo: task.assignedTo._id
        });
        this.loadingTask = false;
      },
      error: (error) => {
        this.loadingTask = false;
        this.showError(error, 'Failed to load task');
      }
    });
  }

  saveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const payload = {
      title: this.taskForm.controls.title.value || '',
      description: this.taskForm.controls.description.value || '',
      status: this.taskForm.controls.status.value || 'pending',
      assignedTo: this.taskForm.controls.assignedTo.value || undefined
    };

    const request = this.taskId
      ? this.taskService.updateTask(this.taskId, payload)
      : this.taskService.createTask(payload);

    this.savingTask = true;
    request.subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error) => {
        this.savingTask = false;
        this.showError(error, 'Task save failed');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  trackByUser(_index: number, user: User): string {
    return user._id;
  }

  private showError(error: unknown, fallback: string): void {
    this.error = '';
    this.toast.error(apiErrorMessage(error, fallback));
  }
}
