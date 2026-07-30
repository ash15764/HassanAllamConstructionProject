import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ExpenseModel } from '../models/ExpenseModel';
import { ExpenseService } from '../services/ExpenseService';
import { ProjectService } from '../services/ProjectService';

@Component({
  selector: 'app-expenses-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './expenses-form.html',
  styleUrl: './expenses-form.css',
})
export class ExpensesForm implements OnChanges {
  @Input({ required: true }) projectId = '';
  @Input({ required: true }) projectName = '';
  @Input({ required: true }) totalBudget = 0;
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  existingExpenses = signal<ExpenseModel[]>([]);
  pendingExpenses = signal<ExpenseModel[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  expandedExpenseIds = signal<Set<string>>(new Set());
  name = '';
  note = '';
  amount: number | null = null;
  expenseDate = new Date().toISOString().slice(0, 10);

  allExpenses = computed(() => [...this.existingExpenses(), ...this.pendingExpenses()]);
  totalExpenses = computed(() => this.allExpenses().reduce((total, expense) => total + Number(expense.amount), 0));
  remaining = computed(() => this.totalBudget - this.totalExpenses());

  constructor(private expenseService: ExpenseService, private projectService: ProjectService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.loadExpenses();
    }
  }

  loadExpenses(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.expenseService.GetExpensesForProject(this.projectId).subscribe({
      next: expenses => {
        this.existingExpenses.set(expenses);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load project expenses.');
        this.isLoading.set(false);
      },
    });
  }

  stageExpense(): void {
    const trimmedName = this.name.trim();
    if (!trimmedName || this.amount === null || this.amount <= 0 || !this.expenseDate) {
      this.errorMessage.set('Enter an expense name, a positive amount, and a date before adding it.');
      return;
    }

    this.pendingExpenses.update(expenses => [...expenses, {
      id: `pending-${Date.now()}`,
      projectId: this.projectId,
      name: trimmedName,
      note: this.note.trim(),
      amount: this.amount!,
      date: this.expenseDate,
    }]);
    this.note = '';
    this.name = '';
    this.amount = null;
    this.expenseDate = new Date().toISOString().slice(0, 10);
    this.errorMessage.set('');
  }

  confirmExpenses(): void {
    const expenses = this.pendingExpenses();
    if (!expenses.length || this.isSaving()) return;

    const updatedCurrentSpend = this.totalExpenses();
    this.isSaving.set(true);
    this.errorMessage.set('');
    forkJoin(expenses.map(({ id, ...expense }) => this.expenseService.AddExpense(expense))).subscribe({
      next: savedExpenses => {
        this.projectService.UpdateCurrentSpend(this.projectId, updatedCurrentSpend).subscribe({
          next: () => {
            this.existingExpenses.update(current => [...current, ...savedExpenses]);
            this.pendingExpenses.set([]);
            this.isSaving.set(false);
            this.updated.emit();
          },
          error: () => {
            this.existingExpenses.update(current => [...current, ...savedExpenses]);
            this.pendingExpenses.set([]);
            this.errorMessage.set('Expenses were saved, but the project total could not be updated.');
            this.isSaving.set(false);
          }
        });
      },
      error: () => {
        this.errorMessage.set('Unable to save expenses. Please try confirming again.');
        this.isSaving.set(false);
      },
    });
  }

  isNoteExpanded(expenseId: string): boolean {
    return this.expandedExpenseIds().has(expenseId);
  }

  toggleNote(expenseId: string): void {
    this.expandedExpenseIds.update(ids => {
      const updatedIds = new Set(ids);
      updatedIds.has(expenseId) ? updatedIds.delete(expenseId) : updatedIds.add(expenseId);
      return updatedIds;
    });
  }

  close(): void {
    this.closed.emit();
  }
}
