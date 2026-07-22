import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { UserModel } from "../models/UserModel";
@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }
    user: UserModel | null = null;
    apiUrl = "https://ahmedtrialproject-default-rtdb.firebaseio.com/users.json";

        RegisterUser(user: UserModel, reEnterPassword: string): Observable<UserModel> {
        const validationError = this.ValidateUser(user, reEnterPassword);
        if (validationError) {
            return throwError(() => new Error(validationError));
        }

        return this.http.post<UserModel>(this.apiUrl, user);
    }

    private ValidateUser(user: UserModel, reEnterPassword: string): string | null {
        // 1. Empty required fields
        if (
            !user.username?.trim() ||
            !user.email?.trim() ||
            !user.password?.trim() ||
            !reEnterPassword?.trim() ||
            user.age === null || user.age === undefined
        ) {
            return "Please fill in all required fields.";
        }

        // 2. Symbols on username (only "_" allowed)
        const usernamePattern = /^[a-zA-Z0-9_]+$/;
        if (!usernamePattern.test(user.username)) {
            return "Username can only contain letters, numbers, and '_'.";
        }

        // 3. Age range
        if (user.age < 16 || user.age > 120) {
            return "Age must be between 16 and 120.";
        }

        // 4. Valid email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(user.email)) {
            return "Please enter a valid email address.";
        }

        // 5. Passwords match
        if (user.password !== reEnterPassword) {
            return "Passwords do not match.";
        }

        // 6. Password strength: 8+ chars, letters, digits, symbols
        const hasMinLength = user.password.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(user.password);
        const hasDigit = /[0-9]/.test(user.password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(user.password);

        if (!hasMinLength || !hasLetter || !hasDigit || !hasSymbol) {
            return "Password must be at least 8 characters and include letters, digits, and symbols.";
        }

        return null; // no errors
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
                this.user = foundUser;
                return foundUser;
            }),
            catchError(err => throwError(() => err))
        );
    }
}