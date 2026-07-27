import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';

@Component({
  selector: 'app-dob-picker',
  standalone: true,
  templateUrl: './calendar-component.html',
  styleUrl: './calendar-component.css'
})
export class CalendarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dobInput') dobInput!: ElementRef<HTMLInputElement>;
  @Input() label: string = 'date of birth';
  @Output() dateSelected = new EventEmitter<string>();
  @Output() dobBlurred = new EventEmitter<void>();

  private fpInstance: Instance | null = null;

  ngAfterViewInit() {
    this.fpInstance = flatpickr(this.dobInput.nativeElement, {
      dateFormat: 'Y-m-d',
      onChange: (dates, dateStr) => this.dateSelected.emit(dateStr)
    }) as Instance;

    this.dobInput.nativeElement.addEventListener('blur', () => {
      this.dobBlurred.emit();
    });
  }

  ngOnDestroy() {
    this.fpInstance?.destroy();
  }
}