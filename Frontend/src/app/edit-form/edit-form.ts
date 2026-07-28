import { Component, signal, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../services/ProjectService';
@Component({
  selector: 'app-edit-form',
  imports: [FormsModule],
  templateUrl: './edit-form.html',
  styleUrl: './edit-form.css',
})
export class EditForm implements OnChanges, OnInit {
  @Input() projectId!: string;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  ChangingEssentials = false;
  projectName: string = '';
  location: string = '';
  endDate: string = '';
  Extra_Budget: number = 0;
  Current_Budget: number = 0;
  Initial_Budget: number = 0;
  progress: number = 0;
  phase: string = '';
  minEndDate: string = new Date().toISOString().split('T')[0];
  status: "planning" | "in-progress" | "completed" = "planning";
  IsError = signal(false);
  errorMessage = signal('');
  IsBudgetError = signal(false);
  allowManualProgress = signal(false);
  constructor(private projectService: ProjectService, private cdr: ChangeDetectorRef) {}
  ngOnInit() {
    if (this.projectId) {
      this.RetrieveProjectDetails(this.projectId);
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['projectId'] && this.projectId) {
      this.RetrieveProjectDetails(this.projectId);
    }
  }
  RetrieveProjectDetails(projectId: string) {
    this.projectService.SelectProject(projectId).subscribe({
      next: (project) => {
        this.projectName = project.name;
        this.location = project.location;
        this.endDate = project.estimatedEndDate;
        this.Initial_Budget = project.allocatedBudget;
        this.Current_Budget = project.allocatedBudget;
        this.progress = project.progress;
        this.phase = project.phase;
        this.status = project.status;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage.set('Failed to retrieve project details.');
        this.IsError.set(true);
        this.cdr.detectChanges();
      }
    });
  }
  OnSubmit(){
    
    this.projectService.UpdateProject(this.projectId, {
        name: this.projectName,
        location: this.location,
        estimatedEndDate: this.endDate,
        allocatedBudget: this.Current_Budget,
        progress: this.progress,
        phase: this.phase,
        status: this.status
    }).subscribe({
        next: () => this.saved.emit(),
        error: (err) => {
            this.errorMessage.set('Failed to save changes.');
            this.IsError.set(true);
        }
    });  
  }
  onCancel(){
    this.closed.emit();
  }
  UpdateCurrentBudget(){
    if(this.Extra_Budget < 0) {
      this.Extra_Budget = 0;
      this.IsBudgetError.set(true);
    }
    this.Current_Budget = this.Initial_Budget + this.Extra_Budget;
    setTimeout(() => {
      this.IsBudgetError.set(false);
    }, 2000);
  }
  AutoUpdateProgress(){
    if(this.phase !== null && this.phase !== undefined && !this.allowManualProgress()) {
      const allphases = ["site-survey", "designing-permitting", "procurement", "budget-approval", "site-preparation", "foundation", 
        "structure", "MEP", "Exterior-finishes", "interior-finishes", "final-inspection", "punch-list", "final-handover" , "close-out"];
      let phaseIndex = allphases.indexOf(this.phase);
      if(phaseIndex !== -1) {
        this.progress = Math.round(((phaseIndex + 1) / allphases.length) * 100);
      }
    }
  }
}
