import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class S_TableService {
  private V_baseUrl = 'http://127.0.0.1:8000/api/database/tables/';
  private V_fieldUrl ='http://127.0.0.1:8000/api/database/fields/';
  private V_dataUrl = 'http://127.0.0.1:8000/api/database/data/';
  private V_relatedFieldsUrl = 'http://127.0.0.1:8000/api/database/related-fields/';


  private V_selectedTableId = new BehaviorSubject<number | null>(null);
  selectedTableId$ = this.V_selectedTableId.asObservable();

  private V_tablesByCategory = new BehaviorSubject<any[]>([]);
  tablesByCategory$ = this.V_tablesByCategory.asObservable();

  private V_dataByTable = new BehaviorSubject<any[]>([]);
  dataByTable$ = this.V_dataByTable.asObservable();

  constructor(private http: HttpClient) {}

/** TABLE **/
  
S_getAllTables(): Observable<any[]> {
    return this.http.get<any[]>(`${this.V_baseUrl}`);
  }

  S_getTableById(TableId: number): Observable<any> {
    return this.http.get(`${this.V_baseUrl}${TableId}`);
  }

  S_getTablesByCategoryId(categoryId: number): Observable<any[]> {
  const url = `${this.V_baseUrl}?categoryId=${categoryId}`;
  return this.http.get<any[]>(url).pipe(tap(tables => this.V_tablesByCategory.next(tables)));
  }

  S_createTable(newtable: any): Observable<any> {
    return this.http.post(`${this.V_baseUrl}`, newtable);
  }

  S_updateTable(TableId: number, updateTable: any): Observable<any> {
    return this.http.put(`${this.V_baseUrl}${TableId}`, updateTable);
  }

  S_deleteTable(TableId: number): Observable<any> {
    return this.http.delete(`${this.V_baseUrl}${TableId}`);

  }

  S_setSelectedTableId(tableId: number | null): void {
    this.V_selectedTableId.next(tableId);
  }
/** FIELDS**/

S_getAllFields(): Observable<any[]> {
    return this.http.get<any[]>(`${this.V_fieldUrl}`);
  }

  S_getFieldsByTable(tableId: number): Observable<any> {
    return this.http.get<any[]>(`${this.V_fieldUrl}?tableId=${tableId}`);
  }

  S_getRelatedFieldsByListFieldId(listFieldId: number): Observable<any[]> {
    const url = `${this.V_relatedFieldsUrl}?listFieldId=${listFieldId}`;
    return this.http.get<any[]>(url)
  }

  S_createField(newfield: any): Observable<any> {
    if (newfield.field_type === 'LIST') {
      console.log('Creating a field with a LIST type', newfield);}
      console.log("creating a field ", newfield);
      return this.http.post(`${this.V_fieldUrl}`, newfield)
    }

    S_updateField(fieldId: number, updatefield: any): Observable<any> {
    return this.http.put(`${this.V_fieldUrl}${fieldId}/`, updatefield);
  }

  S_deleteField(fieldId: number): Observable<any> {
    return this.http.delete(`${this.V_fieldUrl}${fieldId}/`);
  }

/** DATA **/

S_createData(data: any): Observable<any> {
    console.log("Sending data:", data);
    return this.http.post(`${this.V_dataUrl}`, data);
  }

  S_getAllData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.V_dataUrl}`)
  }

  S_getDataByTable(tableId: number): Observable<any[]> {
    const url = `${this.V_dataUrl}?tableId=${tableId}`;
    return this.http.get<any[]>(url).pipe(tap(data => this.V_dataByTable.next(data)));
  }

  S_getDataForField(tableId: number, fieldId: number): Observable<any[]> {
    const url = `${this.V_dataUrl}?tableId=${tableId}&fieldId=${fieldId}`;
    return this.http.get<any[]>(url)
  }
  S_updateData(dataId: number, updatedData: any): Observable<any> {
    return this.http.put(`${this.V_dataUrl}${dataId}/`, updatedData);
  }

S_deleteData(dataId: number): Observable<any> {
    return this.http.delete(`${this.V_dataUrl}${dataId}/`);
  }
  // Angular service method to update category
  S_updateTableCategory(tableId: number, categoryId: number): Observable<any> {
    const url = `http://127.0.0.1:8000/api/database/tables/${tableId}/category/${categoryId}/`;
    const body = {};  // If no additional body is required, you can omit this
    console.log('Request URL:', url);  // Log the request URL
    return this.http.put(url, body);
  }
  
  
  

}
