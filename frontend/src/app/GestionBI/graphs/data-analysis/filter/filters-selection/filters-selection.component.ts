import { Component, OnInit,Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupService } from 'src/app/services/popup/popup.service';
import { ChronologyFilterComponent } from '../chronology-filter/chronology-filter.component';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-filters-selection',
  templateUrl: './filters-selection.component.html',
  styleUrls: ['./filters-selection.component.css']
})
export class FiltersSelectionComponent   implements OnInit{

  @Input() selectedFile: File | null = null;
  noDataMessage: string = '';


  constructor(private popupService: PopupService, private dialog: MatDialog, private overlayContainer: OverlayContainer,) {}
  ngOnInit(): void {
    const containerElement = this.overlayContainer.getContainerElement();
  containerElement.style.zIndex = '1000'; // Force high z-index inline
  }
  openSegmentFilter(): void {
    // this.popupService.openSegmentsFilter(null);
    this.popupService.openChoosePopup(true);
  }
  openChronologyFilter(): void {
    this.dialog.open(ChronologyFilterComponent, {
      width: '600px'
    }).afterClosed().subscribe(result => {
      console.log('Chronology filter dialog closed with result:', result);
    });
  }
}
