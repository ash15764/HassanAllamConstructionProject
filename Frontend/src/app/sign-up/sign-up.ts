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
import { validatePassword, validateConfirmPassword, validateDob, 
    validateEmail, validateUsername } from "../utils/Validators";
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
  role: 'admin' | 'project_manager' | 'site_engineer' | 'viewer' = 'viewer';
  email: string = '';
  password: string = '';
  reEnterPassword: string = '';
  IsError = signal(false);
  errorMessage = signal('');
  age = signal<number | null>(null);
  termsAccepted: boolean = false;
  showTermsModal: boolean = false;
  termsViewed: boolean = false;
  usernameError = signal<string | null>(null);
  emailError = signal<string | null>(null);
  dobError = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  confirmPasswordError = signal<string | null>(null);
  constructor(private userService: UserService, private route: Router, private Http: HttpClient) {}

  SignUpUser(user: UserModel, reEnterPassword: string) {
    this.userService.RegisterUser(user, reEnterPassword).subscribe({
      next: (user) => {
        console.log('User registered:', user);
        this.IsError.set(false);
        this.route.navigate(['/log-in']);
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
    onUsernameBlur() {
        this.usernameError.set(validateUsername(this.username));
    }

    onEmailBlur() {
        this.emailError.set(validateEmail(this.email));
    }

    onDobBlur() {
        this.dobError.set(validateDob(this.DateOfBirth));
        this.CalculateAge(this.DateOfBirth); // your existing call, kept
    }

    onPasswordBlur() {
        this.passwordError.set(validatePassword(this.password));
        // re-check confirm password too, in case it was filled first
        if (this.reEnterPassword) {
            this.confirmPasswordError.set(validateConfirmPassword(this.password, this.reEnterPassword));
        }
    }

    onConfirmPasswordBlur() {
        this.confirmPasswordError.set(validateConfirmPassword(this.password, this.reEnterPassword));
    }
}