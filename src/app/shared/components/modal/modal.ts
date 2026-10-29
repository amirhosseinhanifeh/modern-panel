import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  // عنوان مودال از نوع سیگنال
  readonly title = input<string>('عنوان پنجره');
  
  // رویداد خروجی مدرن با تابع output() به جای دکوراتور قدیمی @Output()
  readonly closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
