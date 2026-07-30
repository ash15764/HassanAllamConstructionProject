import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { ExpenseModel } from "../models/ExpenseModel";

@Injectable({ providedIn: 'root' })
export class ExpenseService {
    apiUrl = 'https://ahmedtrialproject-default-rtdb.firebaseio.com/expenses.json';
    constructor(private http: HttpClient) {}

    AddExpense(expense: Omit<ExpenseModel, 'id'>): Observable<ExpenseModel> {
        return this.http.post<{ name: string }>(this.apiUrl, expense).pipe(
            map(response => ({ ...expense, id: response.name } as ExpenseModel)),
            catchError(err => throwError(() => err))
        );
    }

    GetExpensesForProject(projectId: string): Observable<ExpenseModel[]> {
        const url = `${this.apiUrl.replace('.json', '')}.json?orderBy="projectId"&equalTo="${projectId}"`;

        return this.http.get<Record<string, Omit<ExpenseModel, 'id'>> | null>(url).pipe(
            map(response => Object.entries(response ?? {}).map(([id, expense]) => ({ ...expense, id }))),
            catchError(err => throwError(() => err))
        );
    }
}
