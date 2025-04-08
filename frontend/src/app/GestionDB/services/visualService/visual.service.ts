import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class S_VisualService {

  private V_VisUrl = 'http://localhost:8000/api/database/visuals/';
  constructor(private http: HttpClient) { }

    S_getAllVisuals(): Observable<any[]> {
      return this.http.get<any[]>(`${this.V_VisUrl}`);
    }
    S_getVisualById(VisId: number): Observable<any> {
      return this.http.get<any>(`${this.V_VisUrl}${VisId}`);
    }
    S_createVisual(visualData: any): Observable<any> {
      return this.http.post<any>(`${this.V_VisUrl}`, visualData);
    }
    S_updateVisual(VisId: number, visualData: any): Observable<any> {
      return this.http.put<any>(`${this.V_VisUrl}${VisId}/`, visualData);
    }
    S_deleteVisual(VisId: number): Observable<any> {
      return this.http.delete<any>(`${this.V_VisUrl}${VisId}/`);
    }
    S_getVisualsByWebsiteId(websiteId: number): Observable<any[]> {
      const url = `${this.V_VisUrl}website/${websiteId}/`; // Assurez-vous que l'URL est correcte
      return this.http.get<any[]>(url);
    }


}
