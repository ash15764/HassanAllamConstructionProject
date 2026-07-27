import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { UserModel } from "../models/UserModel";
import { validatePassword, validateConfirmPassword, validateDob, 
    validateEmail, validateUsername } from "../utils/Validators";
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
                this.user = foundUser;
                return foundUser;
            }),
            catchError(err => throwError(() => err))
        );
    }
}