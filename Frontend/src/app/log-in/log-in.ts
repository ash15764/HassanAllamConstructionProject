import { Component } from '@angular/core';
import { signal } from '@angular/core';
import { Router, ActivatedRoute  } from '@angular/router';
import { UserService } from '../services/UserService';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-log-in',
  imports: [FormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  usernameOrEmail: string = '';
  password: string = '';
  IsError = signal(false);
  errorMessage = signal('');
  sessionExpiredMessage = signal<string | null>(null);
  constructor(private userService: UserService, private route: Router, private activatedRoute: ActivatedRoute) {}
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['sessionExpired'] === 'true') {
        this.sessionExpiredMessage.set(
          "Your previous session included protected data. Please sign in again to continue."
        );
      }
    });
  }
  SendToSignUp() {
    this.route.navigate(['/sign-up']);
  }
  VerifyUser(usernameOrEmail: string, password: string) {
    this.userService.RetrieveUser(usernameOrEmail, password).subscribe({
      next: (user) => {
        console.log('User retrieved:', user);
        this.route.navigate(['/home']);
        this.IsError.set(false);
      },
      error: (err) => {
        console.error('Error retrieving user:', err);
        this.IsError.set(true);
        this.errorMessage.set(err.message || 'An error occurred while retrieving the user.');
      },
    });
  }
}
