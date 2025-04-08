import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarHorizentalService {
  private apiUrl = 'http://localhost:8000/api/navbar/';

  constructor(private http: HttpClient) { }

  getNavbarItems(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addNavbarItem(item: any): Observable<any> {
    return this.http.post(this.apiUrl, item);
  }

  updateNavbarItem(id: number, item: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}/`, item);
  }

  deleteNavbarItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
