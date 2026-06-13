import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { DisplayNamePipe } from './display-name.pipe';

@NgModule({
  declarations: [ConfirmDialogComponent, DisplayNamePipe],
  imports: [CommonModule, MaterialModule],
  exports: [ConfirmDialogComponent, DisplayNamePipe]
})
export class SharedModule {}
