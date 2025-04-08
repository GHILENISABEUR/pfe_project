import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Button } from '../models/Button.Model'; 

@Injectable({
  providedIn: 'root'
})
export class ButtonService {
  private baseUrl = 'http://localhost:8000/clev/buttons';

  constructor(private http: HttpClient) {}

  createButton(button: Button): Observable<Button> {
    return this.http.post<Button>(`${this.baseUrl}/create/`, button);
  }

  updateButton(button: Button): Observable<Button> {
    return this.http.put<Button>(`${this.baseUrl}/${button.id}/update/`, button);
  }

  deleteButton(buttonId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${buttonId}/delete/`);
  }

  getButton(buttonId: number): Observable<Button> {
    return this.http.get<Button>(`${this.baseUrl}/${buttonId}/`);
  }

  getButtons(): Observable<Button[]> {
    return this.http.get<Button[]>(`${this.baseUrl}/`);
  }

  // Method to get buttons by website ID
  getButtonsByWebsite(websiteId: number): Observable<Button[]> {
    return this.http.get<Button[]>(`${this.baseUrl}/webside/${websiteId}/`);
  }

  // Method to get buttons by website ID and frame ID
  getButtonsByWebsiteAndFrame(websiteId: number, frameId: number): Observable<Button[]> {
    return this.http.get<Button[]>(`${this.baseUrl}/webside/${websiteId}/frame/${frameId}/`);
  }
}
