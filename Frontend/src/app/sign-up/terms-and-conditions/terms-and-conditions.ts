import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [],
  templateUrl: './terms-and-conditions.html',
  styleUrl: './terms-and-conditions.css',
})
export class TermsAndConditions {
  @Output() accepted = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  onAccept() {
      this.accepted.emit();
    }

  onReturn() {
      this.closed.emit();
  }
}
