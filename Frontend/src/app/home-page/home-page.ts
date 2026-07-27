import { Component } from '@angular/core';
import { NavBar } from './components/nav-bar/nav-bar';
import { ProjectOverview } from './components/project-overview/project-overview';
import { CommunicationPanel } from './components/communication-panel/communication-panel';
@Component({
  selector: 'app-home-page',
  imports: [NavBar, ProjectOverview, CommunicationPanel],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  
}
