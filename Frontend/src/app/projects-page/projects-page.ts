import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectModel } from '../models/ProjectModel';
import { Router } from '@angular/router';
import { UserService } from '../services/UserService';
import { ProjectService } from '../services/ProjectService';
import { EditForm } from '../edit-form/edit-form';
import { ExpensesForm } from '../expenses-form/expenses-form';
@Component({
  selector: 'app-projects-page',
  imports: [CommonModule, EditForm, ExpensesForm],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.css',
})
export class ProjectsPage {
  editingProjectId = signal<string | null>(null);
  selectedExpenseProject = signal<ProjectModel | null>(null);
  constructor(private router: Router, private userService: UserService, 
    private projectService: ProjectService) {
  }
   ngOnInit() {
    this.AllProjects();
  }
  projects = signal<ProjectModel[]>([]);
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
}
