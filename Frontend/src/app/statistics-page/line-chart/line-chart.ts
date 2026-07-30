import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.css',
})
export class LineChart {
  labels = input<string[]>([]);
  data = input<number[]>([]);
  lineColor = input('#ff6a00');
  gradientFrom = input('#ff9a3c');
  gradientTo = input('#ff6a00');

  // viewBox dimensions — kept fixed, scaled responsively via CSS width: 100%
  readonly viewWidth = 600;
  readonly viewHeight = 220;
  private readonly paddingLeft = 36;
  private readonly paddingRight = 16;
  private readonly paddingTop = 16;
  private readonly paddingBottom = 34;
  hoveredIndex = signal<number | null>(null);

  private get plotWidth(): number {
    return this.viewWidth - this.paddingLeft - this.paddingRight;
  }

  private get plotHeight(): number {
    return this.viewHeight - this.paddingTop - this.paddingBottom;
  }

  maxValue = computed(() => {
    const max = Math.max(...this.data(), 0);
    return max === 0 ? 1 : max; // avoid divide-by-zero when all values are 0
  });

  hasData = computed(() => this.data().length > 0);

  // Gridline reference values (0%, 25%, 50%, 75%, 100% of max), top to bottom
  gridLines = computed(() => {
    const max = this.maxValue();
    return [1, 0.75, 0.5, 0.25, 0].map(fraction => ({
      value: Math.round(max * fraction),
      y: this.paddingTop + this.plotHeight * (1 - fraction),
    }));
  });

  points = computed(() => {
    const max = this.maxValue();
    const count = this.data().length;
    if (count === 0) return [];

    return this.data().map((value, i) => {
      const x = count === 1
        ? this.paddingLeft + this.plotWidth / 2
        : this.paddingLeft + (this.plotWidth * i) / (count - 1);
      const y = this.paddingTop + this.plotHeight * (1 - value / max);
      return { x, y, value, label: this.labels()[i] ?? '' };
    });
  });

  linePath = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  });

  areaPath = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return '';
    const baseline = this.paddingTop + this.plotHeight;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const linePart = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return `${linePart} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
  });

  // How many x-axis labels to show at once, so long ranges (e.g. 31 days)
  // don't overlap into unreadable text
  labelStep = computed(() => {
    const count = this.data().length;
    if (count <= 7) return 1;
    if (count <= 14) return 2;
    return Math.ceil(count / 6);
  });

  shouldShowLabel(index: number): boolean {
    const step = this.labelStep();
    const lastIndex = this.data().length - 1;
    return index % step === 0 || index === lastIndex;
  }

  onPointHover(index: number) {
    this.hoveredIndex.set(index);
  }

  onPointLeave() {
    this.hoveredIndex.set(null);
  }
}