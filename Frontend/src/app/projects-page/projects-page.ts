import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectModel } from '../models/ProjectModel';
import { Router } from '@angular/router';
import { UserService } from '../services/UserService';
import { ProjectService } from '../services/ProjectService';
@Component({
  selector: 'app-projects-page',
  imports: [CommonModule],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.css',
})
export class ProjectsPage {
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
    this.router.navigate(['./add']);
  }
  AllProjects(){
    this.projectService.GetProjectsForOrganization().subscribe(projects => {
      this.projects.set(projects);
    });
  }
  ToEdit(projectId: string) {
    this.router.navigate([`./edit/${projectId}`]);
  }
  DeleteProject(projectId: string) {
    this.projectService.DeleteProject(projectId).subscribe(() => {
      this.AllProjects();
    });
  }
}
