import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Sidebar, SidebarItem } from '../models/sidebar-item.model';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private apiUrl = 'http://localhost:8000/api/sidebars/';
  private sidebarItemsUrl = 'http://localhost:8000/api/sidebar-items/';

  constructor(private http: HttpClient) { }

  getSidebars(): Observable<Sidebar[]> {
    return this.http.get<Sidebar[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getSidebarItems(sidebarId: number): Observable<SidebarItem[]> {
    return this.http.get<SidebarItem[]>(`${this.apiUrl}${sidebarId}/items/`).pipe(
      catchError(this.handleError)
    );
  }

  addSidebar(sidebar: Sidebar): Observable<Sidebar> {
    return this.http.post<Sidebar>(this.apiUrl, sidebar).pipe(
      catchError(this.handleError)
    );
  }

  deleteSidebar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  addSidebarItem(item: SidebarItem): Observable<SidebarItem> {
    return this.http.post<SidebarItem>(`${this.apiUrl}${item.sidebar}/items/`, item).pipe(
      catchError(this.handleError)
    );
  }

  updateSidebarItem(id: number, item: SidebarItem): Observable<void> {
    return this.http.put<void>(`${this.sidebarItemsUrl}${id}/`, item).pipe(
      catchError(this.handleError)
    );
  }

  deleteSidebarItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sidebarItemsUrl}${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error);
  }

  updateSidebar(id: number, sidebar: Sidebar): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${id}/`, sidebar).pipe(
      catchError(this.handleError)
    );
  }

  updateSidebarStyle(id: number, style: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}${id}/`, { style }).pipe(
      catchError(this.handleError)
    );
  }
  
  
}
