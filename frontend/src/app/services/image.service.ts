import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Image } from '../models/Image.Model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'http://localhost:8000/clev/images/';  

  constructor(private http: HttpClient) { }

  addImage(imageData: Image): Observable<Image> {
    return this.http.post<Image>(this.apiUrl + 'create/', imageData);
  }

  getImages(): Observable<Image[]> {
    return this.http.get<Image[]>(this.apiUrl);
  }

  getImageById(id: number): Observable<Image> {
    const url = `${this.apiUrl}${id}/`;
    return this.http.get<Image>(url);
  }

  updateImage(id: number, imageData: Image): Observable<Image> {
    const url = `${this.apiUrl}${id}/update/`;
    return this.http.put<Image>(url, imageData);
  }

  deleteImage(id: number): Observable<any> {
    const url = `${this.apiUrl}${id}/delete/`;
    return this.http.delete(url);
  }

  getImagesByWebsite(websiteId: number): Observable<Image[]> {
    return this.http.get<Image[]>(`${this.apiUrl}webside/${websiteId}/`);
  }

  getImagesByWebsiteAndFrame(websiteId: number, frameId: number): Observable<Image[]> {
    return this.http.get<Image[]>(`${this.apiUrl}webside/${websiteId}/frame/${frameId}/`);
  }
}
