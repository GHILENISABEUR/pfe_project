import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Text } from '../models/Text.Model';

@Injectable({
  providedIn: 'root'
})
export class TextService {
  private apiUrl = 'http://127.0.0.1:8000/clev/texts/';

  constructor(private http: HttpClient) { }

  addText(textData: Text): Observable<Text> {
    return this.http.post<Text>(this.apiUrl + 'create/', textData);
  }

  getTexts(): Observable<Text[]> {
    return this.http.get<Text[]>(this.apiUrl);
  }

  getTextById(id: number): Observable<Text> {
    const url = `${this.apiUrl}${id}/`;
    return this.http.get<Text>(url);
  }

  updateText(id: number, textData: Text): Observable<Text> {
    const url = `${this.apiUrl}${id}/update/`;
    return this.http.put<Text>(url, textData);
  }

  deleteText(id: number): Observable<any> {
    const url = `${this.apiUrl}${id}/delete/`;
    return this.http.delete(url);
  }

  updateTextPosition(id: number, position: { top: string, left: string }): Observable<Text> {
    return this.http.put<Text>(`${this.apiUrl}${id}/update/`, { style: position });
  }

  getTextsByWebsite(websiteId: number): Observable<Text[]> {
    return this.http.get<Text[]>(`${this.apiUrl}webside/${websiteId}/`);
  }


  getTextsByWebsiteAndFrame(websiteId: number, frameId: number): Observable<Text[]> {
    return this.http.get<Text[]>(`${this.apiUrl}webside/${websiteId}/frame/${frameId}/`);
  }
}
