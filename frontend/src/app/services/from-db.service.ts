import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FromDBService {

  constructor() { }
  componentsFromDB: { type: string; data: any }[] = []; // Array to store the added components
  TS_fromDB(newCompnent:any) {
    this.componentsFromDB.push(newCompnent);    // Logic to add a new component dynamically
  
  }
}
