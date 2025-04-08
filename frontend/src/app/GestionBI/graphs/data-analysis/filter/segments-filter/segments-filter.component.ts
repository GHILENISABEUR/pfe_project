import { Component, OnInit,Inject } from '@angular/core';
import { GraphService } from 'src/app/services/graph/graph.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { PopupService } from 'src/app/services/popup/popup.service';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';


@Component({
  selector: 'app-segments-filter',
  templateUrl: './segments-filter.component.html',
  styleUrls: ['./segments-filter.component.css']
})
export class SegmentsFilterComponent implements OnInit {
  fileOptions: { id: number; name: string }[] = [];
  availableSegmentColumns: string[] = [];
  selectedFileId: number | null = null;
  selectedColumns: string[] = []; // Array to store selected columns


  constructor(private graphService: GraphService,   private overlayContainer: OverlayContainer,private popupService: PopupService,@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<SegmentsFilterComponent>, ) {}

  ngOnInit(): void {
    const containerElement = this.overlayContainer.getContainerElement();
  containerElement.style.zIndex = '3000'; // Force high z-index inline

    console.log("his.data",this.data);
    this.fetchFileOptions();

    if (this.data !== null) {
      this.selectedFileId=this.data;
      this.graphService.getAvailableSegmentColumns(this.selectedFileId!).subscribe(
        response => {
          this.availableSegmentColumns = response.columns || [];
        },
        error => {
          console.error('Error fetching segment columns:', error);
        }
      );
    }
  }

  fetchFileOptions(): void {
    this.graphService.getAvailableFiles().subscribe(
      response => {
        this.fileOptions = response.files || [];
      },
      error => {
        console.error('Error fetching file options:', error);
      }
    );
  }

  fetchSegmentColumns(): void {
    if (this.selectedFileId !== null) {
      this.graphService.getAvailableSegmentColumns(this.selectedFileId).subscribe(
        response => {
          this.availableSegmentColumns = response.columns || [];
        },
        error => {
          console.error('Error fetching segment columns:', error);
        }
      );
    }
  }

  onFileSelectionChange(fileId: number): void {
    this.selectedFileId = fileId;
    this.fetchSegmentColumns();
  }
  onCheckboxChange(event: MatCheckboxChange): void {
    const column = event.source.value;
    if (event.checked) {
      this.selectedColumns.push(column); // Add to selected columns
    } else {
      this.selectedColumns = this.selectedColumns.filter(item => item !== column); // Remove if unchecked
    }
  }

  // Validate selection: Call onColumnSelectionChange for each selected column
  validateSelection(): void {
    if (this.selectedColumns.length === 0) {
      console.error('No columns selected.');
      return;
    }

    for (const column of this.selectedColumns) {
      this.onColumnSelectionChange(column);
    }
    this.dialogRef.close();  }

  // Updated onColumnSelectionChange to accept column as parameter
  onColumnSelectionChange(column: string): void {
    if (this.selectedFileId === null) {
      console.error('No file selected to fetch unique values.');
      return;
    }

    this.graphService.getUniqueValues(this.selectedFileId, column).subscribe(
      response => {
        this.popupService.notifyUniqueValues(column, response.unique_values, this.selectedFileId || []);
      },
      error => {
        console.error('Error fetching unique values:', error);
      }
    );
  }

  // onColumnSelectionChange(event: MatCheckboxChange): void {
  //   if (this.selectedFileId === null) {
  //     console.error('No file selected to fetch unique values.');
  //     return;
  //   }

  //   const column = event.source.value;
  //   if (!column) {
  //     console.error('Column value missing.');
  //     return;
  //   }

  //   this.graphService.getUniqueValues(this.selectedFileId, column).subscribe(
  //     response => {
  //       this.popupService.notifyUniqueValues(column, response.unique_values ,this.selectedFileId|| []);
  //     },
  //     error => {
  //       console.error('Error fetching unique values:', error);
  //     }
  //   );
  // }
}
