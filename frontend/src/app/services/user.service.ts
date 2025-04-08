import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/GestionAuth';  // Backend base URL
  public currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || '{}'));
    this.currentUser = this.currentUserSubject.asObservable();
  }
  signup(fullName: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup/`, { full_name: fullName, email, password })
      .pipe(
        tap(response => {
          const user = {
            id: response.data.id,
            full_name: response.data.full_name,
            email: response.data.email
          }; // Extract user data from response
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          let errorMessage = 'Signup failed';
          if (error.error && error.error.errors) {
            // If backend provides specific error messages
            const errors = error.error.errors;
            errorMessage = Object.values(errors).flat().join(', ');
          } else if (error.message) {
            // General error message
            errorMessage = error.message;
          }
          console.error('Signup failed:', errorMessage);
          return throwError(errorMessage);
        })
      );
  }
  
  
  

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signin/`, { email, password }, { withCredentials: true })
      .pipe(
        tap(response => {
          const { id, user } = response;
          localStorage.setItem('currentUser', JSON.stringify({ id, ...user }));
          this.currentUserSubject.next({ id, ...user });
          console.log('Login successful:', user);
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(error);
        })
      );
  }
  
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    return this.http.post<any>(`${this.apiUrl}/logout/`, {});
  }

  verifyGoogleToken(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-google-token/`, { token })
      .pipe(
        tap(response => {
          if (response.success) {
            const user = {
              id: response.id,
              full_name: response.user.full_name,
              email: response.user.email
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            console.log('Google login successful:', response);
          } else {
            throw new Error(response.error);
          }
        }),
        catchError(error => {
          console.error('Google login failed:', error);
          return throwError(error);
        })
      );
  }

  private getCsrfToken(): string {
    const name = 'csrftoken';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const token = parts.pop()?.split(';').shift();
      return token ?? '';
    }
    return '';
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password/`, { email }, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Forgot password request failed:', error);
          return throwError(error);
        })
      );
  }

  verifyCode(code: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { code };

    return this.http.post<any>(`${this.apiUrl}/verify-code/`, body, { headers, withCredentials: true })
      .pipe(
        tap(response => {
          if (response.status === 'success') {
            const user = {
              id: response.user.id,
              full_name: response.user.full_name,
              email: response.user.email
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }),
        catchError(error => {
          console.error('Verification code request failed:', error);
          return throwError(error);
        })
      );
  }

  changePassword(password: string): Observable<any> {
    const csrfToken = this.getCsrfToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken });
    const body = { password };

    return this.http.post<any>(`${this.apiUrl}/change-password/`, body, { headers, withCredentials: true })
      .pipe(
        tap(response => {
          if (response.status === 'success') {
            const user = {
              id: response.user.id,
              full_name: response.user.full_name,
              email: response.user.email
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }),
        catchError(error => {
          console.error('Password change request failed:', error);
          return throwError(error);
        })
      );
  }
}
