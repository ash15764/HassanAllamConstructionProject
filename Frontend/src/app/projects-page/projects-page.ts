import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectModel } from '../models/ProjectModel';
import { Router } from '@angular/router';
import { UserService } from '../services/UserService';
import { ProjectService } from '../services/ProjectService';
import { EditForm } from '../edit-form/edit-form';
import { ExpensesForm } from '../expenses-form/expenses-form';
import { FormsModule } from '@angular/forms';

type StatusFilter = 'all' | 'planning' | 'in-progress' | 'completed';
type BudgetFilter = 'all' | 'over-budget' | 'near-threshold' | 'safe';


@Component({
  selector: 'app-projects-page',
  imports: [CommonModule, EditForm, ExpensesForm, FormsModule],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.css',
})
export class ProjectsPage {
  editingProjectId = signal<string | null>(null);
  selectedExpenseProject = signal<ProjectModel | null>(null);
    hasOverBudgetProjects = computed(() => {
    return this.projects().some(p => p.currentSpend > p.allocatedBudget);
  });
  searchTerm = signal('');
  statusFilter = signal<StatusFilter>('all');
  budgetFilter = signal<BudgetFilter>('all');
  constructor(private router: Router, private userService: UserService, 
    private projectService: ProjectService) {
  }
   ngOnInit() {
    this.AllProjects();
  }
  projects = signal<ProjectModel[]>([]);
  private BUDGET_NEAR_THRESHOLD_RATIO = 0.8; // 80% of budget spent counts as "near threshold"

  getBudgetState(p: ProjectModel): 'over-budget' | 'near-threshold' | 'safe' {
    if (p.currentSpend > p.allocatedBudget) return 'over-budget';
    const ratio = p.allocatedBudget > 0 ? p.currentSpend / p.allocatedBudget : 0;
    if (ratio >= this.BUDGET_NEAR_THRESHOLD_RATIO) return 'near-threshold';
    return 'safe';
  }
  canAddProject = computed(() => {
    const role = this.userService.currentUser()?.role;
    return role === 'project_manager' || role === 'admin';
  });
  canEditProject = computed(() => {
    const role = this.userService.currentUser()?.role;
    return role === 'project_manager' || role === 'admin' || role === 'site_engineer';
  });
  addProject() {
    this.router.navigate(['projects/add']);
  }
  AllProjects(){
    this.projectService.GetProjectsForOrganization().subscribe(projects => {
      this.projects.set(projects);
    });
  }
  ToEdit(projectId: string) {
    this.editingProjectId.set(projectId);
  }
  onEditSaved() {
    this.editingProjectId.set(null);
    this.AllProjects();
  }
  onEditClosed() {
    this.editingProjectId.set(null);
  }
  ShowExpenses(project: ProjectModel) {
    this.selectedExpenseProject.set(project);
  }
  onExpensesClosed() {
    this.selectedExpenseProject.set(null);
  }
  DeleteProject(projectId: string) {
    this.projectService.DeleteProject(projectId).subscribe(() => {
      this.AllProjects();
    });
  }
  filteredProjects = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const budget = this.budgetFilter();

    return this.projects().filter(p => {
      const matchesSearch = term === '' || p.name.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || p.status === status;
      const matchesBudget = budget === 'all' || this.getBudgetState(p) === budget;
      return matchesSearch && matchesStatus && matchesBudget;
    });
  });
  
}
