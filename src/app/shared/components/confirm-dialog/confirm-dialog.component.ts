import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  show = input.required<boolean>();
  title = input.required<string>();
  message = input.required<string>();
  confirmText = input<string>('Confirm');
  icon = input<string>('help_outline');
  type = input<'danger' | 'primary'>('primary');

  confirm = output<void>();
  cancel = output<void>();

  onCancel() {
    this.cancel.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
