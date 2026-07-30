import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectModel } from '../models/ProjectModel';
import { ProjectService } from '../services/ProjectService';
import { LineChart } from './line-chart/line-chart';
import { ExpenseService } from '../services/ExpenseService';
import { ExpenseModel } from '../models/ExpenseModel';

type BudgetState = 'safe' | 'near-threshold' | 'over-budget';
type OverallBudgetStatus = 'safe' | 'warning' | 'danger';
type Timeframe = 'all' | 'months' | 'years';

const NEAR_THRESHOLD_RATIO = 0.8;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [CommonModule, LineChart, FormsModule],
  templateUrl: './statistics-page.html',
  styleUrl: './statistics-page.css',
})
export class StatisticsPage implements OnInit {
  projects = signal<ProjectModel[]>([]);
  expenses = signal<ExpenseModel[]>([]);

  // ---------- Timeframe selection (all signals, so computed() reacts to them) ----------
  selectedTimeframe = signal<Timeframe>('all');
  selectedYear = signal<number | null>(null);
  selectedMonth = signal<string | null>(null); // format: 'YYYY-MM'

  timeframeOptions: Timeframe[] = ['all', 'months', 'years'];

  constructor(private projectService: ProjectService, private expenseService: ExpenseService) {}

  ngOnInit() {
    this.LoadProjects();
    this.LoadExpenses();
  }

  LoadProjects() {
    this.projectService.GetProjectsForOrganization().subscribe(projects => {
      this.projects.set(projects);
    });
  }

  LoadExpenses() {
    this.expenseService.GetAllExpenses().subscribe(expenses => {
      this.expenses.set(expenses);
    });
  }

  setTimeframe(option: Timeframe) {
    this.selectedTimeframe.set(option);
    // reset selections when switching modes so a stale year doesn't linger under "months"
    this.selectedYear.set(null);
    this.selectedMonth.set(null);
  }

  // ---------- Shared helper: same budget-state logic used on the project cards ----------
  getBudgetState(p: ProjectModel): BudgetState {
    if (p.currentSpend > p.allocatedBudget) return 'over-budget';
    const ratio = p.allocatedBudget > 0 ? p.currentSpend / p.allocatedBudget : 0;
    if (ratio >= NEAR_THRESHOLD_RATIO) return 'near-threshold';
    return 'safe';
  }

  // ---------- Org-wide expenses, scoped via project membership (no org field on expenses) ----------
  orgExpenses = computed(() => {
    const projectIds = new Set(this.projects().map(p => p.id));
    return this.expenses().filter(e => projectIds.has(e.projectId));
  });

  // ---------- Earliest project start date — lower bound for year/month pickers + "all" chart range ----------
  earliestProjectDate = computed(() => {
    const projectList = this.projects();
    if (projectList.length === 0) return new Date();

    const dates = projectList
      .map(p => new Date(p.startDate))
      .filter(d => !isNaN(d.getTime()));

    if (dates.length === 0) return new Date();

    return new Date(Math.min(...dates.map(d => d.getTime())));
  });

  availableYears = computed(() => {
    const startYear = this.earliestProjectDate().getFullYear();
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y);
    }
    return years;
  });

  availableMonths = computed(() => {
    const start = this.earliestProjectDate();
    const now = new Date();

    const months: { value: string; label: string }[] = [];
    let cursor = new Date(now.getFullYear(), now.getMonth(), 1);
    const floor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cursor >= floor) {
      const value = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      const label = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value, label });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
    }

    return months;
  });

  // ---------- Period bounds derived from the current timeframe selection ----------
  periodBounds = computed<{ start: Date | null; end: Date | null }>(() => {
    const timeframe = this.selectedTimeframe();

    if (timeframe === 'years') {
      const year = this.selectedYear();
      if (year === null) return { start: null, end: null };
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    if (timeframe === 'months') {
      const month = this.selectedMonth();
      if (month === null) return { start: null, end: null };
      const [y, m] = month.split('-').map(Number);
      return {
        start: new Date(y, m - 1, 1),
        end: new Date(y, m, 0, 23, 59, 59), // day 0 of next month = last day of this month
      };
    }

    return { start: null, end: null }; // 'all'
  });

  private isWithinBounds(date: Date, bounds: { start: Date | null; end: Date | null }): boolean {
    if (!bounds.start || !bounds.end) return true; // no bounds = no filtering
    return date >= bounds.start && date <= bounds.end;
  }

  // ---------- Projects filtered to the selected period (by project start date) ----------
  filteredProjects = computed(() => {
    const bounds = this.periodBounds();
    return this.projects().filter(p => {
      const d = new Date(p.startDate);
      return !isNaN(d.getTime()) && this.isWithinBounds(d, bounds);
    });
  });

  // ---------- Expenses filtered to the selected period (by expense date) ----------
  filteredExpenses = computed(() => {
    const bounds = this.periodBounds();
    return this.orgExpenses().filter(e => {
      const d = new Date(e.date);
      return !isNaN(d.getTime()) && this.isWithinBounds(d, bounds);
    });
  });

  // ---------- Card 1: Active vs Completed counts ----------
  activeProjectsCount = computed(() =>
    this.filteredProjects().filter(p => p.status !== 'completed').length
  );

  completedProjectsCount = computed(() =>
    this.filteredProjects().filter(p => p.status === 'completed').length
  );

  activeProjectsList = computed(() =>
    this.filteredProjects().filter(p => p.status !== 'completed')
  );

  hasActiveProjects = computed(() => this.activeProjectsCount() > 0);

  // ---------- Card 2: Budget-state counts ----------
  safeCount = computed(() =>
    this.filteredProjects().filter(p => this.getBudgetState(p) === 'safe').length
  );

  nearThresholdCount = computed(() =>
    this.filteredProjects().filter(p => this.getBudgetState(p) === 'near-threshold').length
  );

  overBudgetCount = computed(() =>
    this.filteredProjects().filter(p => this.getBudgetState(p) === 'over-budget').length
  );

  // ---------- Card 3: Org-wide budget totals + overall status (scoped to selected period) ----------
  totalAllocatedBudget = computed(() =>
    this.filteredProjects().reduce((sum, p) => sum + p.allocatedBudget, 0)
  );

  totalCurrentSpend = computed(() =>
    this.filteredProjects().reduce((sum, p) => sum + p.currentSpend, 0)
  );

  spendRatio = computed(() => {
    const budget = this.totalAllocatedBudget();
    return budget > 0 ? this.totalCurrentSpend() / budget : 0;
  });

  spendPercentage = computed(() => Math.min(this.spendRatio() * 100, 100));

  overallBudgetStatus = computed<OverallBudgetStatus>(() => {
    const ratio = this.spendRatio();
    if (ratio > 1) return 'danger';
    if (ratio >= NEAR_THRESHOLD_RATIO) return 'warning';
    return 'safe';
  });

  overallBudgetStatusLabel = computed(() => {
    switch (this.overallBudgetStatus()) {
      case 'danger': return 'Over Budget';
      case 'warning': return 'Approaching Limit';
      default: return 'Healthy';
    }
  });

  // ---------- Card 4: Average progress across active projects (scoped to selected period) ----------
  averageActiveProgress = computed(() => {
    const active = this.activeProjectsList();
    if (active.length === 0) return 0;
    const total = active.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(total / active.length);
  });

  // ---------- Dropdown state: per-project breakdowns ----------
  isBudgetDropdownOpen = signal(false);
  isProgressDropdownOpen = signal(false);

  toggleBudgetDropdown() {
    this.isBudgetDropdownOpen.update(open => !open);
  }

  toggleProgressDropdown() {
    this.isProgressDropdownOpen.update(open => !open);
  }

  // ---------- Line chart: granularity adapts to the selected timeframe ----------
  // - 'months' with a specific month picked    -> x-axis = days of that month
  // - 'years' with a specific year picked      -> x-axis = months of that year
  // - 'all' (or years/months with no pick yet) -> x-axis = months across the full project history
  private buildDailyBuckets(year: number, month: number): { key: string; label: string; total: number }[] {
    const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-indexed here
    const buckets = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      buckets.push({ key, label: day.toString(), total: 0 });
    }
    return buckets;
  }

  private buildYearlyMonthBuckets(year: number): { key: string; label: string; total: number }[] {
    const buckets = [];
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${String(m + 1).padStart(2, '0')}`;
      buckets.push({ key, label: MONTH_NAMES[m], total: 0 });
    }
    return buckets;
  }

  private buildFullRangeMonthBuckets(): { key: string; label: string; total: number }[] {
    const start = this.earliestProjectDate();
    const now = new Date();
    const buckets = [];
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endCursor = new Date(now.getFullYear(), now.getMonth(), 1);

    while (cursor <= endCursor) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      const label = cursor.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      buckets.push({ key, label, total: 0 });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }

    return buckets;
  }

  chartResult = computed(() => {
    const timeframe = this.selectedTimeframe();
    const year = this.selectedYear();
    const month = this.selectedMonth();
    const expenses = this.filteredExpenses();

    let buckets: { key: string; label: string; total: number }[];
    let keyOf: (d: Date) => string;

    if (timeframe === 'months' && month !== null) {
      const [y, m] = month.split('-').map(Number);
      buckets = this.buildDailyBuckets(y, m);
      keyOf = (d: Date) => d.toISOString().split('T')[0];
    } else if (timeframe === 'years' && year !== null) {
      buckets = this.buildYearlyMonthBuckets(year);
      keyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else {
      buckets = this.buildFullRangeMonthBuckets();
      keyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    const bucketMap = new Map(buckets.map(b => [b.key, b]));

    for (const expense of expenses) {
      const d = new Date(expense.date);
      if (isNaN(d.getTime())) continue;
      const bucket = bucketMap.get(keyOf(d));
      if (bucket) bucket.total += expense.amount;
    }

    return {
      labels: buckets.map(b => b.label),
      data: buckets.map(b => Math.round(b.total * 100) / 100),
    };
  });

  chartLabels = computed(() => this.chartResult().labels);
  chartData = computed(() => this.chartResult().data);
}