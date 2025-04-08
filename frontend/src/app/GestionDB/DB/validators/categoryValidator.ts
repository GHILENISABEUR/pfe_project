import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

    export function CategoryNameValidator(existingCategories: any[], editingCategoryName: string | null): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const name = control.value;
        if(editingCategoryName!=null){
          if (editingCategoryName && name.toLowerCase() === editingCategoryName.toLowerCase()) {
            return null;
          }
        }
        if (existingCategories.some(category => category.name.toLowerCase() === name.toLowerCase())) {
          return { CategoryNameExists: true };
        }
        return null;
      };
    }



