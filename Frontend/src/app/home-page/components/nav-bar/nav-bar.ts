import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/UserService';

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  constructor(private router: Router, public userService: UserService) {}
    comingSoonLabel = signal<string | null>(null);
    activeTab: string = 'home';
  showComingSoon(feature: string) {
      this.comingSoonLabel.set(feature);
      setTimeout(() => this.comingSoonLabel.set(null), 2000);
  }

  goToProjects() {
      this.router.navigate(['/projects']);
  }
  setTab(tab: string) {
        this.activeTab = tab;
    }
  LogOut(){
    this.userService.Logout();
    this.router.navigate(['/log-in']);
  }
}
