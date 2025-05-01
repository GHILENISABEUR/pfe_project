// src/app/services/code-generator.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodeGeneratorService {
  private apiUrl = 'http://localhost:8000/api/generate-code/';  // Django backend URL

  constructor(private http: HttpClient) { }

  generateCode(prompt: string, language: string = 'python'): Observable<any> {
    return this.http.post(this.apiUrl, { prompt, language });
  }
}