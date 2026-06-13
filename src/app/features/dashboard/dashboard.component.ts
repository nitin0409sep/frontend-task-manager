import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { apiErrorMessage } from '../../core/http-error';
import { TaskService } from '../../core/task.service';
import { ToastService } from '../../core/toast.service';
import { UserService } from '../../core/user.service';
import { Task, TaskStatus } from '../../models/task.model';
import { User } from '../../models/user.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { TeamAssignmentDialogComponent } from './team-assignment-dialog/team-assignment-dialog.component';

type StatusFilter = TaskStatus | 'all';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  users: User[] = [];
  statusFilter: StatusFilter = 'all';
  searchTerm = '';
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;
  loading = false;
  loadingMore = false;
  creatingTask = false;
  openingTeamAssignment = false;
  error = '';
  private statusUpdatingTaskIds = new Set<string>();
  private searchChanged = new Subject<string>();
  private destroyed = new Subject<void>();

  constructor(
    private auth: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private taskService: TaskService,
    private toast: ToastService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.searchChanged
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroyed))
      .subscribe(() => this.applyFilters());

    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  get currentUser(): User {
    return this.auth.currentUser as User;
  }

  get isManager(): boolean {
    return this.currentUser.role === 'Manager';
  }

  get employees(): User[] {
    return this.users.filter((user) => user.role === 'Employee');
  }

  get teamLeads(): User[] {
    return this.users.filter((user) => user.role === 'Team Lead');
  }

  get emptyStateTitle(): string {
    if (this.statusFilter === 'pending') {
      return 'No pending tasks';
    }

    if (this.statusFilter === 'completed') {
      return 'No completed tasks';
    }

    return 'No tasks yet';
  }

  get emptyStateMessage(): string {
    if (this.statusFilter === 'pending') {
      return 'There are no pending tasks in your current view.';
    }

    if (this.statusFilter === 'completed') {
      return 'Completed tasks will appear here once work is marked done.';
    }

    return 'Create your first task to start tracking work.';
  }

  get subtitle(): string {
    if (this.currentUser.role === 'Manager') {
      return 'Manage all users and tasks.';
    }
    if (this.currentUser.role === 'Team Lead') {
      return 'Manage your tasks and your team member tasks.';
    }
    return 'Manage your own tasks.';
  }

  get showTaskFilters(): boolean {
    return this.tasks.length > 0 || this.searchTerm.trim().length > 0 || this.statusFilter !== 'all';
  }

  loadTasks(append = false): void {
    if (append) {
      this.loadingMore = true;
    } else {
      this.loading = true;
    }

    this.taskService
      .getTasks({
        status: this.statusFilter,
        page: this.page,
        limit: this.limit,
        search: this.searchTerm
      })
      .subscribe({
        next: (response) => {
          this.tasks = append ? [...this.tasks, ...response.items] : response.items;
          this.total = response.total;
          this.totalPages = response.totalPages;
          this.loading = false;
          this.loadingMore = false;
        },
        error: (error) => {
          this.loading = false;
          this.loadingMore = false;
          this.showError(error, 'Failed to load tasks');
        }
      });
  }

  clearFilter(): void {
    this.statusFilter = 'all';
    this.searchTerm = '';
    this.page = 1;
    this.loadTasks();
  }

  trackByTask(_index: number, task: Task): string {
    return task._id;
  }

  trackByValue(_index: number, value: number): number {
    return value;
  }

  isStatusUpdating(task: Task): boolean {
    return this.statusUpdatingTaskIds.has(task._id);
  }

  statusButtonLabel(task: Task): string {
    if (this.isStatusUpdating(task)) {
      return 'Updating...';
    }

    return task.status === 'completed' ? 'Mark pending' : 'Complete';
  }

  onSearchChange(value: string): void {
    this.searchChanged.next(value.trim());
  }

  applyFilters(): void {
    this.page = 1;
    this.loadTasks();
  }

  loadNextPage(): void {
    if (this.loading || this.loadingMore || this.page >= this.totalPages) {
      return;
    }

    this.page += 1;
    this.loadTasks(true);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const threshold = 320;
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - threshold) {
      this.loadNextPage();
    }
  }

  createTask(): void {
    this.creatingTask = true;
    this.router.navigate(['/tasks/new']).finally(() => {
      this.creatingTask = false;
    });
  }

  editTask(task: Task): void {
    this.router.navigate(['/tasks', task._id, 'edit']);
  }

  openTeamAssignment(): void {
    if (this.openingTeamAssignment) {
      return;
    }

    this.openingTeamAssignment = true;
    this.error = '';

    this.userService
      .getUsers({ limit: 100 })
      .pipe(takeUntil(this.destroyed))
      .subscribe({
        next: (response) => {
          this.users = response.items;
          this.openingTeamAssignment = false;
          this.openTeamAssignmentDialog();
        },
        error: (error) => {
          this.openingTeamAssignment = false;
          this.showError(error, 'Failed to load users');
        }
      });
  }

  private openTeamAssignmentDialog(): void {
    this.dialog.open(TeamAssignmentDialogComponent, {
      width: '640px',
      data: {
        employees: this.employees,
        teamLeads: this.teamLeads
      }
    });
  }

  canEditTask(task: Task): boolean {
    if (this.currentUser.role === 'Manager') {
      return true;
    }

    if (this.currentUser.role === 'Employee') {
      return task.createdBy._id === this.currentUser._id;
    }

    return this.wasCreatedByCurrentUserOrTeam(task);
  }

  canDeleteTask(task: Task): boolean {
    if (this.currentUser.role === 'Manager') {
      return true;
    }

    if (this.currentUser.role === 'Employee') {
      return task.createdBy._id === this.currentUser._id;
    }

    return this.wasCreatedByCurrentUserOrTeam(task);
  }

  private wasCreatedByCurrentUserOrTeam(task: Task): boolean {
    if (task.createdBy._id === this.currentUser._id) {
      return true;
    }

    return this.userId(task.createdBy.teamLead) === this.currentUser._id;
  }

  private userId(user: string | User | null | undefined): string | null {
    if (!user) {
      return null;
    }

    return typeof user === 'string' ? user : user._id;
  }

  toggleStatus(task: Task): void {
    if (this.isStatusUpdating(task)) {
      return;
    }

    const status: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    this.statusUpdatingTaskIds.add(task._id);

    this.taskService.updateTask(task._id, { status }).subscribe({
      next: (updatedTask) => {
        this.applyUpdatedTask(updatedTask);
        this.statusUpdatingTaskIds.delete(task._id);
      },
      error: (error) => {
        this.statusUpdatingTaskIds.delete(task._id);
        this.showError(error, 'Status update failed');
      }
    });
  }

  private applyUpdatedTask(updatedTask: Task): void {
    if (this.statusFilter !== 'all' && updatedTask.status !== this.statusFilter) {
      const previousLength = this.tasks.length;
      this.tasks = this.tasks.filter((task) => task._id !== updatedTask._id);

      if (this.tasks.length !== previousLength) {
        this.total = Math.max(0, this.total - 1);
      }

      return;
    }

    this.tasks = this.tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task));
  }

  deleteTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      width: '420px',
      data: {
        title: 'Delete task',
        message: `Are you sure you want to delete "${task.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    const confirmSubscription = dialogRef.componentInstance.confirmed.subscribe(() => {
      dialogRef.componentInstance.loading = true;
      this.taskService.deleteTask(task._id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter((item) => item._id !== task._id);
          this.total = Math.max(0, this.total - 1);
          dialogRef.close(true);
        },
        error: (error) => {
          dialogRef.componentInstance.loading = false;
          this.showError(error, 'Delete failed');
        }
      });
    });

    dialogRef.afterClosed().subscribe(() => confirmSubscription.unsubscribe());
  }

  private showError(error: unknown, fallback: string): void {
    this.error = '';
    this.toast.error(apiErrorMessage(error, fallback));
  }
}
