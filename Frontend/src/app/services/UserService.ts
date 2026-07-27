import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError, tap } from "rxjs/operators";
import { UserModel } from "../models/UserModel";
import { validatePassword, validateConfirmPassword, validateDob,
    validateEmail, validateUsername } from "../utils/Validators";

const CURRENT_USER_KEY = "currentUser";

@Injectable({ providedIn: 'root' })
export class UserService {
    apiUrl = "https://ahmedtrialproject-default-rtdb.firebaseio.com/users.json";

    currentUser = signal<UserModel | null>(this.loadStoredUser());

    constructor(private http: HttpClient) {}

    private loadStoredUser(): UserModel | null {
        const raw = localStorage.getItem(CURRENT_USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    private persistUser(user: UserModel | null) {
        if (user) {
            // never persist the password client-side, even in localStorage
            const { password, ...safeUser } = user as any;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
        } else {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    }

    RegisterUser(user: UserModel, reEnterPassword: string): Observable<UserModel> {
        const validationError = this.ValidateUser(user, reEnterPassword);
        if (validationError) {
            return throwError(() => new Error(validationError));
        }

        return this.http.post<UserModel>(this.apiUrl, user).pipe(
            tap(registeredUser => {
                this.currentUser.set(registeredUser);
                this.persistUser(registeredUser);
            })
        );
    }

    private ValidateUser(user: UserModel, reEnterPassword: string): string | null {
        return validateUsername(user.username)
            ?? validateEmail(user.email)
            ?? validateDob(user.DateOfBirth)
            ?? validateConfirmPassword(user.password, reEnterPassword)
            ?? validatePassword(user.password);
    }

    RetrieveUser(usernameOrEmail: string, password: string): Observable<UserModel> {
        const field = usernameOrEmail.includes("@") ? "email" : "username";
        const url = `${this.apiUrl}?orderBy="${field}"&equalTo="${usernameOrEmail}"`;

        return this.http.get<{ [key: string]: UserModel }>(url).pipe(
            map(response => {
                const matches = Object.values(response || {});
                if (matches.length === 0) {
                    throw new Error("No account found with that username or email.");
                }
                const foundUser = matches[0];
                if (foundUser.password !== password) {
                    throw new Error("Incorrect password.");
                }
                return foundUser;
            }),
            tap(foundUser => {
                this.currentUser.set(foundUser);
                this.persistUser(foundUser);
            }),
            catchError(err => throwError(() => err))
        );
    }

    Logout(): void {
        this.currentUser.set(null);
        this.persistUser(null);
    }

    IsLoggedIn(): boolean {
        return this.currentUser() !== null;
    }
    GetOrganizationMembers(): Observable<UserModel[]> {
    const currentUser = this.currentUser();

    if (!currentUser) {
        return throwError(() => new Error("You must be logged in to view organization members."));
    }

    const url = `https://ahmedtrialproject-default-rtdb.firebaseio.com/users.json?orderBy="organization"&equalTo="${currentUser.organization}"`;

    return this.http.get<{ [key: string]: UserModel }>(url).pipe(
        map(response => {
            const entries = Object.entries(response || {});
            return entries
                .map(([key, data]) => ({ ...data, key }))
                // exclude yourself from your own "who can I chat with" list
                .filter(member => member.username !== currentUser.username);
        }),
        catchError(err => throwError(() => err))
    );
}
}