/*import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function TableNameValidator(existingTables: any[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const name = control.value;
      if (existingTables.some(table => table.name.toLowerCase() === name.toLowerCase())) {
        return { tableNameExists: true };
      }
      return null;
    };
  
  }*/
    import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

    export function TableNameValidator(existingTables: any[], editingTableName: string | null): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const name = control.value;
        if(editingTableName!=null){
          if (editingTableName && name.toLowerCase() === editingTableName.toLowerCase()) {
            return null;
          }
        }
        if (existingTables.some(table => table.name.toLowerCase() === name.toLowerCase())) {
          return { tableNameExists: true };
        }
        return null;
      };
    }