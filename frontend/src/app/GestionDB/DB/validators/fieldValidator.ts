import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { S_TableService } from '../../services/TableService/Table.service'; 
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export function FieldNameValidator(tableService: S_TableService, tableId: number, originalFieldName: string | null): ValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const name = control.value;

    return tableService.S_getFieldsByTable(tableId).pipe(
      map((fields: any[]) => {
        const isDuplicate = fields.some(field =>
          field.name.toLowerCase() === name.toLowerCase()
        );

        if (isDuplicate && (!originalFieldName || originalFieldName.toLowerCase() !== name.toLowerCase())) {
          return { fieldNameExists: true };
        } else {
          return null;
        }
      }),
      catchError(() => {
        return of(null); // Handle errors if necessary
      })
    );
  };
}
