import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserModel } from '../models/UserModel';
import { UserService } from '../services/UserService';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarComponent } from './calendar-component/calendar-component';
import { NgStyle } from '@angular/common';
import { TermsAndConditions } from './terms-and-conditions/terms-and-conditions';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, CalendarComponent, NgStyle, TermsAndConditions],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  username: string = '';
  DateOfBirth: string = '';
  organization: string = '';
  role: string = '';
  email: string = '';
  password: string = '';
  reEnterPassword: string = '';
  IsError = signal(false);
  errorMessage = signal('');
  age = signal<number | null>(null);
  termsAccepted: boolean = false;
  showTermsModal: boolean = false;
  termsViewed: boolean = false;
  constructor(private userService: UserService, private route: Router, private Http: HttpClient) {}

  apiUrl = "https://ahmedtrialproject-default-rtdb.firebaseio.com/users.json";
  SignUpUser(user: UserModel, reEnterPassword: string) {
    this.userService.RegisterUser(user, reEnterPassword).subscribe({
      next: (user) => {
        this.Http.post(this.apiUrl, user).subscribe({
          next: (response) => {
            console.log('User data saved successfully:', response);
            this.IsError.set(false);
            this.route.navigate(['/log-in']);
          },
          error: (err) => {
            console.error('Error saving user data:', err);
            this.IsError.set(true);
            this.errorMessage.set('Failed to save user data.');
          },
        });
        
      },
      error: (err) => {
        console.error('Error registering user:', err);
        this.IsError.set(true);
        this.errorMessage.set(err.message);
      },
    });
    
  }


 CalculateAge(dateOfBirth: string): void {
    const dob = new Date(dateOfBirth);

    if (isNaN(dob.getTime())) {
        this.age.set(null);
        return;
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const hasHadBirthdayThisYear =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    if (!hasHadBirthdayThisYear) {
        age--;
    }

    this.age.set(age); // <-- the actual fix
}

onDobSelected(dateStr: string) {
    this.DateOfBirth = dateStr;
    this.CalculateAge(dateStr);
}


openTerms() {
    this.showTermsModal = true;
    this.termsViewed = true;
}

onTermsAccepted() {
    this.termsAccepted = true;
    this.showTermsModal = false;
}

onTermsClosed() {
    this.showTermsModal = false;

}
}