import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class S_TableService {
  private V_baseUrl = 'http://127.0.0.1:8000/api/database/tables/';
  private V_fieldUrl = 'http://127.0.0.1:8000/api/database/fields/';
  private V_dataUrl = 'http://127.0.0.1:8000/api/database/data/';
  private V_relatedFieldsUrl = 'http://127.0.0.1:8000/api/database/related-fields/';
  private V_foreignKeysUrl = 'http://127.0.0.1:8000/api/database/';
  private V_tableDataUrl = 'http://127.0.0.1:8000/api/database/get-table-data/';

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

  /** FIELDS **/
  S_getAllFields(): Observable<any[]> {
    return this.http.get<any[]>(`${this.V_fieldUrl}`);
  }

  S_getFieldsByTable(tableId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.V_fieldUrl}?tableId=${tableId}`).pipe(
      map(fields => fields.map(field => ({
        ...field,
        foreign_key_field: field.is_foreign_key ? {
          id: field.id,
          name: field.name,
          field_type: field.field_type
        } : null
      })))
    );
  }

  S_getRelatedFieldsByListFieldId(listFieldId: number): Observable<any[]> {
    const url = `${this.V_relatedFieldsUrl}?listFieldId=${listFieldId}`;
    return this.http.get<any[]>(url);
  }

  S_createField(newfield: any): Observable<any> {
    if (newfield.field_type === 'LIST') {
      console.log('Creating a field with a LIST type', newfield);
    }
    console.log("creating a field ", newfield);
    return this.http.post(`${this.V_fieldUrl}`, newfield);
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
    return this.http.get<any[]>(`${this.V_dataUrl}`);
  }

  S_getDataByTable(tableId: number): Observable<any[]> {
    const url = `${this.V_dataUrl}?tableId=${tableId}`;
    return this.http.get<any[]>(url).pipe(tap(data => this.V_dataByTable.next(data)));
  }

  S_getDataForField(tableId: number, fieldId: number): Observable<any[]> {
    const url = `${this.V_dataUrl}?tableId=${tableId}&fieldId=${fieldId}`;
    return this.http.get<any[]>(url);
  }

  S_updateData(dataId: number, updatedData: any): Observable<any> {
    return this.http.put(`${this.V_dataUrl}${dataId}/`, updatedData);
  }

  S_deleteData(dataId: number): Observable<any> {
    return this.http.delete(`${this.V_dataUrl}${dataId}/`);
  }

  S_updateTableCategory(tableId: number, categoryId: number): Observable<any> {
    const url = `http://127.0.0.1:8000/api/database/tables/${tableId}/category/${categoryId}/`;
    const body = {};
    console.log('Request URL:', url);
    return this.http.put(url, body);
  }

  S_createForeignKey(foreignKeyData: any): Observable<any> {
    const url = `${this.V_foreignKeysUrl}create-foreign-key/`;
    return this.http.post(url, foreignKeyData);
  }

  S_createDataAndForeignKey(fieldData: any, foreignKeyData: any, fieldID: number, update: boolean, FieldEditId: number | null): Observable<any> {
    return new Observable((observer) => {
      this.S_createField(({ name: 'fk_' + fieldData.name, field_type: 'INTEGER', table: fieldData.table, table_id: fieldData.table, referedFieldId: fieldID, list_values: [], is_foreign_key: true, relatedField: fieldData.name })).subscribe({
      });
      fieldData.is_foreign_key = false;
      if (update === false) {
        console.log("hello i am not updated ", update);
        this.S_createField(fieldData).subscribe({
          next: (createdField) => {
            if (foreignKeyData) {
              this.S_createForeignKey(foreignKeyData).subscribe({
                next: () => {
                  observer.next('Field and foreign key created successfully');
                  observer.complete();
                },
                error: (error) => {
                  observer.error(error);
                }
              });
            } else {
              observer.next('Field created successfully');
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      }
      if (update && FieldEditId != null) {
        console.log("fieldData", fieldData);
        this.S_updateField(FieldEditId, fieldData).subscribe({
          next: (createdField) => {
            if (foreignKeyData) {
              this.S_createForeignKey(foreignKeyData).subscribe({
                next: () => {
                  observer.next('Field and foreign key created successfully');
                  observer.complete();
                },
                error: (error) => {
                  observer.error(error);
                }
              });
            } else {
              observer.next('Field created successfully');
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      }
    });
  }

  S_getTableDataByName(tableName: string): Observable<any[]> {
    const url = `${this.V_tableDataUrl}${tableName}/`;
    return this.http.get<any[]>(url);
  }

  S_findCommonKeys(tableIds: string[]): Observable<string[]> {
    return this.S_getAllFields().pipe(
      map((allFields: { id: string; table: number; referedFieldId?: string }[]) => {
        const fieldsByTable = tableIds.map((tableId) =>
          allFields.filter((field) => field.table === Number(tableId))
        );

        const commonKeysSet = new Set<string>();

        const findCommonKeys = (
          fields1: { id: string; table: number; referedFieldId?: string }[],
          fields2: { id: string; table: number; referedFieldId?: string }[]
        ): string[] => {
          const commonKeys = [
            ...fields1
              .filter((field1) => {
                const field2 = fields2.find((f2) => f2.id === field1.referedFieldId);
                return field1.referedFieldId && field2;
              })
              .map((field) => field.id),
            ...fields2
              .filter((field2) => {
                const field1 = fields1.find((f1) => f1.id === field2.referedFieldId);
                return field2.referedFieldId && field1;
              })
              .map((field) => field.id)
          ];
          return commonKeys;
        };

        for (let i = 0; i < fieldsByTable.length; i++) {
          for (let j = i + 1; j < fieldsByTable.length; j++) {
            const commonKeys = findCommonKeys(fieldsByTable[i], fieldsByTable[j]);
            commonKeys.forEach((key) => commonKeysSet.add(key));
          }
        }

        const commonKeysArray = Array.from(commonKeysSet);
        console.log('Common keys between the tables:', commonKeysArray);
        return commonKeysArray;
      })
    );
  }

  S_dynamicJoinedData(tables: string[], fields: string[], foreignKeys: string[]): Observable<any[]> {
    const params = {
      tables: tables,
      fields: fields,
      foreign_keys: foreignKeys
    };

    return this.http.get<any[]>('http://127.0.0.1:8000/api/database/dynamic-joined-data/', { params });
  }
}