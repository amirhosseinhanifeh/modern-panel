import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  // ورودی‌های سیگنالی مدرن (Signal Inputs)
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly changeRate = input<string>(); // درصد تغییرات: مثبت یعنی رشد، منفی یعنی افت
  readonly icon = input<string>('📊');
  readonly colorScheme = input<string>();

  // رنگ پس‌زمینه و آیکون با سیگنال محاسباتی (computed)
  readonly colorClasses = computed(() => {
    switch (this.colorScheme()) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'amber':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'rose':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  });

  readonly isPositiveChange = computed(() => this.changeRate());
}
