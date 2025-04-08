import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class S_CategoryService {
  private V_CatUrl = 'http://localhost:8000/api/database/categories/';

  constructor(private http: HttpClient) { }

  S_getAllCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.V_CatUrl}`);
  }

  getCategoriesByWebsiteId(websiteId: number): Observable<any[]> {
    const url = `${this.V_CatUrl}website/${websiteId}/`;
    return this.http.get<any[]>(url);
  }
  // S_getCategoryById(CatId: number): Observable<any> {
  //   return this.http.get<any>(`${this.V_CatUrl}${CatId}`);
  // }

  S_createCategory(categoryData: any): Observable<any> {
    return this.http.post<any>(`${this.V_CatUrl}`, categoryData);
  }

  S_updateCategory(CatId: number, categoryData: any): Observable<any> {
    return this.http.put<any>(`${this.V_CatUrl}${CatId}/`, categoryData);
  }
// Dans votre service de catégorie (S_CategoryService)
S_deleteCategoryWithReplacement(categoryId: number, newCategoryId: number): Observable<any> {
  return this.http.delete(`${this.V_CatUrl}${categoryId}/`, { params: { new_category_id: newCategoryId } });
}

  S_deleteCategory(CatId: number): Observable<any> {
    return this.http.delete<any>(`${this.V_CatUrl}${CatId}/`);
  }
  S_getCategoryByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.V_CatUrl}?name=${name}`);
  }


}
