import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExternalDBService {

  constructor(private http: HttpClient) { }

  // Method to fetch tables from database
  getTablesFromDatabase(databaseInfo: any): Observable<string[]> {
    console.log("about to sent query ")
    return this.http.post<string[]>('http://localhost:8000/api/database/external/tables/', databaseInfo);
  }

  // Method to fetch fields from a selected table
  getFieldsFromTable(databaseInfo: any, tableName: string): Observable<string[]> {
    console.log("tableName",tableName)
    return this.http.post<string[]>(`http://localhost:8000/api/database/external/fields/${tableName}/`, databaseInfo);
  }

  // Method to fetch values from a selected field in a table
  getValuesFromField(databaseInfo: any, tableName: string, fieldName: string): Observable<string[]> {
    return this.http.post<string[]>(`http://localhost:8000/api/database/external/values/${tableName}/${fieldName}/`, databaseInfo);
  }

  S_getTableFromDatabase(databaseInfo: any,tableName:string): Observable<string[]> {
    return this.http.post<string[]>(`http://localhost:8000/api/database/external/fetch_table/${tableName}/`, databaseInfo);
  }
}
