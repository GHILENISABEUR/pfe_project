import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InputField } from '../models/InputField.Model'; 

@Injectable({
  providedIn: 'root'
})
export class InputFieldService {
  private apiUrl = 'http://localhost:8000/clev/input_fields/';  

  constructor(private http: HttpClient) { }

  addInputField(inputFieldData: InputField): Observable<InputField> {
    return this.http.post<InputField>(`${this.apiUrl}create/`, inputFieldData);
  }

  getInputFields(): Observable<InputField[]> {
    return this.http.get<InputField[]>(this.apiUrl);
  }

  getInputFieldById(id: number): Observable<InputField> {
    return this.http.get<InputField>(`${this.apiUrl}${id}/`);
  }

  updateInputField(id: number, inputFieldData: InputField): Observable<InputField> {
    return this.http.put<InputField>(`${this.apiUrl}${id}/update/`, inputFieldData);
  }

  deleteInputField(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/delete/`);
  }

  updateInputFieldPosition(id: number, position: { top: string, left: string }): Observable<InputField> {
    return this.http.patch<InputField>(`${this.apiUrl}${id}/update/`, { style: position });
  }

  
  getInputFieldsByWebsite(websiteId: number): Observable<InputField[]> {
    return this.http.get<InputField[]>(`${this.apiUrl}webside/${websiteId}/`);
  }

  
  getInputFieldsByWebsiteAndFrame(websiteId: number, frameId: number): Observable<InputField[]> {
    return this.http.get<InputField[]>(`${this.apiUrl}webside/${websiteId}/frame/${frameId}/`);
  }
}
