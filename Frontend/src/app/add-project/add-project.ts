import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectModel } from '../models/ProjectModel';
import { ProjectService } from '../services/ProjectService';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-project.html',
  styleUrl: './add-project.css',
})
export class AddProject {
  projectName: string = '';
  allocatedBudget: number | null = null;
  status: 'planning' | 'in-progress' | 'completed' | '' = '';
  phase: string = '';
  progress: number = 0;
  startDate: string = '';
  endDate: string = '';

  IsError = signal(false);
  errorMessage = signal('');

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  OnSubmit() {
    if (this.status === '') {
      this.errorMessage.set('Please select a status.');
      this.IsError.set(true);
      return;
    }

    if (this.allocatedBudget === null || this.allocatedBudget <= 0) {
      this.errorMessage.set('Please enter a valid budget.');
      this.IsError.set(true);
      return;
    }

    if (new Date(this.endDate) < new Date(this.startDate)) {
      this.errorMessage.set('End date cannot be before the start date.');
      this.IsError.set(true);
      return;
    }

    const project: Omit<ProjectModel, 'id' | 'ownerId' | 'organization'> = {
      name: this.projectName,
      status: this.status,
      phase: this.phase,
      startDate: this.startDate,
      estimatedEndDate: this.endDate,
      allocatedBudget: this.allocatedBudget,
      currentSpend: 0,
      progress: this.progress,
    };

    this.projectService.AddProject(project).subscribe({
      next: (createdProject) => {
        console.log('Project created:', createdProject);
        this.IsError.set(false);
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        console.error('Error creating project:', err);
        this.IsError.set(true);
        this.errorMessage.set(err.message);
      },
    });
  }
}