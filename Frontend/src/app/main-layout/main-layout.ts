import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { UserService } from '../services/UserService';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  activeTab: string = 'home';
  comingSoonLabel = signal<string | null>(null);

  constructor(public userService: UserService, private router: Router) {}

  setTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([`/${tab}`]);
  }

  showComingSoon(feature: string) {
    this.comingSoonLabel.set(feature);
    setTimeout(() => this.comingSoonLabel.set(null), 2000);
  }
  Logout() {
    this.userService.Logout();
    this.router.navigate(['/login']);
  }
}