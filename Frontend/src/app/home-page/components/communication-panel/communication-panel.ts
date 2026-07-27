import { Component, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserModel } from '../../../models/UserModel';
import { UserService } from '../../../services/UserService';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-communication-panel',
  imports: [],
  templateUrl: './communication-panel.html',
  styleUrl: './communication-panel.css',
})
export class CommunicationPanel {
  constructor(private userService: UserService, private http: HttpClient) {}

  orgMembers = signal<UserModel[]>([]);

  ngOnInit() {
    this.userService.GetOrganizationMembers().subscribe({
        next: (members) => this.orgMembers.set(members),
        error: (err) => console.error('Failed to load org members:', err)
    });}
}
