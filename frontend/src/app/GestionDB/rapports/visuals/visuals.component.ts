import { Component, OnInit } from '@angular/core';
import { S_SharedDataService } from '../../services/sharedData/shared-data.service';
import { S_VisualService } from '../../services/visualService/visual.service';
import { MatDialog } from '@angular/material/dialog';
import { VisualPopupComponent } from '../../rapports/visual-popup/visual-popup.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-visuals',
  templateUrl: './visuals.component.html',
  styleUrls: ['./visuals.component.css']
})
export class VisualsComponent implements OnInit {
  visuals: any[] = [];
  newVisualName: string = ''; // For holding the new visual name
  showCreateVisualForm: boolean = false; // For showing/hiding the create visual form
  editingVisual: any = null; // For holding the visual being edited
  noData: string = ''; // For showing a message when no data is available
  websiteId:any;
  constructor(private V_sharedDataService: S_SharedDataService,private route:ActivatedRoute, private V_visualService: S_VisualService, private dialog: MatDialog ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      console.log("this.websiteId ",this.websiteId )
          });
    this.TS_loadVisuals();
  }

  TS_loadVisuals() {
    this.V_visualService.S_getVisualsByWebsiteId(this.websiteId).subscribe(visuals => {
      this.visuals = visuals;
    });
  }

  TS_createVisual(Name: string): void {
    if (this.V_sharedDataService.getDataTableFieldsData().length > 0) {
      const dataTable = this.V_sharedDataService.getDataTableFieldsData();
      const visualData = {
        name: Name,
        data: dataTable,
        type:this.V_sharedDataService.getType(),
        selectedFields:this.V_sharedDataService.getSelectedFieldsByTableId(),
        website:this.websiteId
      };
      this.V_visualService.S_createVisual(visualData).subscribe(visual => {
        console.log("Visual created:", visual);
        this.visuals.push(visual); // Optionally update the local visuals list
        this.showCreateVisualForm = false; // Hide the form
        this.newVisualName = ''; // Clear the input field
        this.V_sharedDataService.clearSelectedFieldsByTableId(); // Clear the shared data
      });
    } else {
      console.warn("No data available to create visual.");
      this.noData="No data available";
    }
  }
  TS_openVisualPopup(visual: any): void {
    // Open the popup dialog with the selected visual data
    const dialogRef = this.dialog.open(VisualPopupComponent, {
      width: 'auto', // Adjust width as needed
      data: { visualData: visual, websiteId:this.websiteId} // Pass the visual data to the popup component

    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Handle any actions after the dialog is closed
    });
  }
  TS_deleteVisual(visual: any): void {
    this.V_visualService.S_deleteVisual(visual.id).subscribe(response => {
      console.log("Visual deleted:", response);
      // Optionally update the local visuals list
      this.visuals = this.visuals.filter(v => v.id !== visual.id);
    });
  }

  TS_editVisual(visual: any): void {
    this.editingVisual = { ...visual }; // Create a copy of the visual being edited
    this.showCreateVisualForm = true;
    this.newVisualName = this.editingVisual.name;
  }

  TS_saveEditedVisual(): void {
    if (this.editingVisual) {
      this.editingVisual.name = this.newVisualName;
      this.V_visualService.S_updateVisual(this.editingVisual.id, this.editingVisual).subscribe(updatedVisual => {
        console.log("Visual updated:", updatedVisual);
        // Update the local visuals list with the updated visual
        const index = this.visuals.findIndex(v => v.id === updatedVisual.id);
        if (index !== -1) {
          this.visuals[index] = updatedVisual;
        }
        this.showCreateVisualForm = false; // Hide the form
        this.newVisualName = ''; // Clear the input field
        this.editingVisual = null;
      });
    }


  }}
