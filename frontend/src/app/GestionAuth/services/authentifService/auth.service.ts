import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class S_AuthService {

  private V_baseUrl: string = 'http://127.0.0.1:8000/api/accounts/';

  private V_currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.V_currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    this.currentUser = this.V_currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.V_currentUserSubject.value;
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.V_baseUrl}login/`, { email, password }, { withCredentials: true })
}

  logout() {
    // Remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.V_currentUserSubject.next(null);
  }

  forgotPassword(email: string) {
    const url = `${this.V_baseUrl}/forgot-password/`;
    return this.http.post(url, { email });
  }
}
