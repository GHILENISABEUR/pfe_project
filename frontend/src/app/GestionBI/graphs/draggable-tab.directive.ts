// draggable-tab.directive.ts
import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appDraggableTab]'
})
export class DraggableTabDirective {
  @Input() tabIndex: number = 0;
  @Output() tabDrop: EventEmitter<any> = new EventEmitter();

  constructor(private el: ElementRef) {
    el.nativeElement.draggable = true;
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', String(this.tabIndex));
      event.dataTransfer.dropEffect = 'move';
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      const draggedTabIndex = Number(event.dataTransfer.getData('text/plain'));
      this.tabDrop.emit({ draggedTabIndex, droppedTabIndex: this.tabIndex });
    }
  }
}
