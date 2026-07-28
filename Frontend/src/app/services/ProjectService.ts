import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError, tap } from "rxjs/operators";
import { ProjectModel } from "../models/ProjectModel";
import { UserService } from "./UserService";

@Injectable({ providedIn: 'root' })
export class ProjectService {
    apiUrl = 'https://ahmedtrialproject-default-rtdb.firebaseio.com/projects.json';

    // Reactive list, so any component can just read this signal
    // instead of re-fetching on every navigation.
    projects = signal<ProjectModel[]>([]);

    constructor(
        private http: HttpClient,
        private userService: UserService
    ) {}

    AddProject(project: Omit<ProjectModel, 'id' | 'ownerId' | 'organization'>): Observable<ProjectModel> {
        const currentUser = this.userService.currentUser();

        if (!currentUser) {
            return throwError(() => new Error("You must be logged in to create a project."));
        }

        const fullProject: Partial<ProjectModel> = {
            ...project,
            ownerId: currentUser.username,
            organization: currentUser.organization, // was organizationId
        };

        return this.http.post<{ name: string }>(this.apiUrl, fullProject).pipe(
            map(response => ({ ...fullProject, id: response.name }) as ProjectModel),
            tap(createdProject => {
                this.projects.update(current => [...current, createdProject]);
            }),
            catchError(err => throwError(() => err))
        );
    }

    GetProjectsForOrganization(): Observable<ProjectModel[]> {
        const currentUser = this.userService.currentUser();

        if (!currentUser) {
            return throwError(() => new Error("You must be logged in to view projects."));
        }

        const url = `${this.apiUrl.replace('.json', '')}.json?orderBy="organization"&equalTo="${currentUser.organization}"`;

        return this.http.get<{ [key: string]: ProjectModel }>(url).pipe(
            map(response => {
                const entries = Object.entries(response || {});
                return entries.map(([id, data]) => ({ ...data, id }));
            }),
            tap(projects => this.projects.set(projects)),
            catchError(err => throwError(() => err))
        );
    }

    GetRecentProjects(count: number): Observable<ProjectModel[]> {
        return this.GetProjectsForOrganization().pipe(
            map(projects => projects.slice(0, count))
        );
    }
    DeleteProject(projectId: string): Observable<void> {
        const url = `${this.apiUrl.replace('.json', '')}/${projectId}.json`;
        return this.http.delete<void>(url);
    }

    SelectProject(projectId: string): Observable<ProjectModel> {
        const url = `${this.apiUrl.replace('.json', '')}/${projectId}.json`;
        return this.http.get<ProjectModel>(url).pipe(
            catchError(err => throwError(() => err))
        );
    }
}