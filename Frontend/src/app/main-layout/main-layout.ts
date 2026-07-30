import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd  } from '@angular/router';
import { UserService } from '../services/UserService';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  activeTab = signal<string>('home');
  comingSoonLabel = signal<string | null>(null);

  constructor(public userService: UserService, private router: Router) {
    this.updateActiveTab(this.router.url);

    // Keep it in sync on every navigation, regardless of what triggered it
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateActiveTab(event.urlAfterRedirects);
      });
  }
  private updateActiveTab(url: string) {
    if (url.startsWith('/projects')) {
      this.activeTab.set('projects');
    } else if (url.startsWith('/home')) {
      this.activeTab.set('home');
    }else if (url.startsWith('/statistics')) {
      this.activeTab.set('statistics');
    }
    // add more branches here as you add real routes (statistics, news, etc.)
  }
  goToProjects() {
    this.router.navigate(['/projects']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
  goToStatistics() {
    this.router.navigate(['/statistics']);
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