import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ChronologyFilterComponent } from 'src/app/GestionBI/graphs/data-analysis/filter/chronology-filter/chronology-filter.component';
import { SegmentsFilterComponent } from 'src/app/GestionBI/graphs/data-analysis/filter/segments-filter/segments-filter.component';
import { FiltersSelectionComponent } from 'src/app/GestionBI/graphs/data-analysis/filter/filters-selection/filters-selection.component';
import { FileUploadComponent } from 'src/app/GestionBI/graphs/data-analysis/data/file-upload/file-upload.component';
@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupTypeSubject = new BehaviorSubject<'none' | 'upload' | 'import' | 'choose'>('none');
  popupType$ = this.popupTypeSubject.asObservable();
  private popupDataSubject = new BehaviorSubject<any>(null); // New data subject
  popupData$ = this.popupDataSubject.asObservable();
  private uniqueValuesSubject = new BehaviorSubject<{ column: string, uniqueValues: any[] ,selectedFileId:any} | null>(null);
  uniqueValues$ = this.uniqueValuesSubject.asObservable();
  private chronologyFilterSubject = new BehaviorSubject<any>(null);
  chronologyFilter$ = this.chronologyFilterSubject.asObservable();

  constructor(private dialog: MatDialog) {}

  openChoosePopup(data:any): void {
    console.log('Opening choose popup');
    this.popupTypeSubject.next('choose');
    this.popupDataSubject.next(data);
    console.log('Current popup type:', this.popupTypeSubject.value); // Debugging
  }

  openUploadPopup(): void {
    console.log('Opening upload popup');
    this.popupTypeSubject.next('upload');
  }

  openFiltersSelectionPopup(): void {
    console.log('Opening filters selection popup');
    this.dialog.open(FiltersSelectionComponent, {
      width: '400px',
      panelClass: 'filters-selection' // Ajoutez ceci


    });
  }

  openImportPopup(): void {
    console.log('Opening import popup');
    this.popupTypeSubject.next('import');
  }

  openSegmentsFilter(selectedFileId:number| null): void {
    console.log('Opening Segments Filter Modal');
    this.dialog.open(SegmentsFilterComponent, {
      width: '500px',
      height: '600px',
      panelClass: 'dialog-z-index-3000' ,
      data:selectedFileId
    });
  }

  openChronologyFilter(file: File | null): void {
    this.dialog.open(ChronologyFilterComponent, {
      width: '600px',
      data: { file: file }
    });
  }


  closePopup(): void {
    console.log('Closing popup');
    this.popupTypeSubject.next('none');
    // this.dialog.closeAll();
  }

  notifyUniqueValues(column: string, uniqueValues: any[],selectedFileId:any): void {
    console.log("selectedFileId",selectedFileId)
    this.uniqueValuesSubject.next({ column, uniqueValues,selectedFileId });
  }
  notifyChronologyFilter(data: any) {
    this.chronologyFilterSubject.next(data);
  }

}
