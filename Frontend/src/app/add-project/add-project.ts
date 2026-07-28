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
  startDate: string = '';
  endDate: string = '';
  location: string = '';
  warningAcknowledged = signal(false);
  IsError = signal(false);
  errorMessage = signal('');

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  OnSubmit() {

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

    if(!this.warningAcknowledged()) {
      this.errorMessage.set('Please read the instructions provided above before submitting.');
      this.IsError.set(true);
      return;
    }

    const project: Omit<ProjectModel, 'id' | 'ownerId' | 'organization'> = {
      name: this.projectName,
      location: this.location,
      status: "planning",
      phase: "initialization",
      startDate: this.startDate,
      estimatedEndDate: this.endDate,
      allocatedBudget: this.allocatedBudget,
      currentSpend: 0,
      progress: 0,
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