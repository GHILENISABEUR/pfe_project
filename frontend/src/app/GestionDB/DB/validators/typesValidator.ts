import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

// Custom validator for integer validation
export function integerValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value !== '' && isNaN(control.value)) {
      return { 'integer': true }; 
    }
    return null; 
  };
}

export function dateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; 
      }
  
      // Define a regular expression for MM/DD/YYYY format
      const dateFormat = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  
      if (!dateFormat.test(control.value)) {
        return { 'date': true }; // Validation error if format does not match
      }
  
      const parts = control.value.split('/');
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
  
      if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000 || year > 9999) {
        return { 'date': true }; // Validation error if any of these conditions fail
      }
  
      
      if ((month === 4 || month === 6 || month === 9 || month === 11) && day === 31) {
        return { 'date': true }; 
      }
  
      if (month === 2) { // February: check for leap year
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (day > 29 || (day === 29 && !isLeapYear)) {
          return { 'date': true };
        }
      }
  
      return null; 
    };
  }

export function decimalValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const decimalPattern = /^\d+(\.\d{1,2})?$/; 
    const isValid = decimalPattern.test(control.value);
    return isValid ? null : { 'decimal': true }; 
  };
}
