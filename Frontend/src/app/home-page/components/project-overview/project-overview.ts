import { Component, computed, signal } from '@angular/core';
import { ProjectModel } from '../../../models/ProjectModel';
import { UserService } from '../../../services/UserService';
import { ProjectService } from '../../../services/ProjectService';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-project-overview',
  imports: [CommonModule],
  templateUrl: './project-overview.html',
  styleUrl: './project-overview.css',
})
export class ProjectOverview {
  constructor(public userService: UserService, private router: Router, private projectService: ProjectService) {
  }
  previewProjects = signal<ProjectModel[]>([]); // slice of top 3-5, loaded from Firestore
   canAddProject = computed(() => {
    const role = this.userService.currentUser()?.role;
    return role === 'project_manager' || role === 'admin';
  });
  ngOnInit() {
      this.projectService.GetRecentProjects(5).subscribe(projects => {
          this.previewProjects.set(projects);
      });
  }
  goToProjects() {
      this.router.navigate(['/projects']);
  }
  addProject() {
      this.router.navigate(['/projects/add']);
  }
}
