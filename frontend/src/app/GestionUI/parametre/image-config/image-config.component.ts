import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Image } from 'src/app/models/Image.Model';

@Component({
  selector: 'app-image-config',
  templateUrl: './image-config.component.html',
  styleUrls: ['./image-config.component.css']
})
export class ImageConfigComponent {
  @Input() image: Image | null = null;
  @Input() isUserMode: boolean = false;
  @Output() imageUpdated: EventEmitter<Image> = new EventEmitter<Image>();
  @Output() imageDeleted: EventEmitter<number> = new EventEmitter<number>();
  @Output() closeConfigimg: EventEmitter<void> = new EventEmitter<void>();

  selectedWidth: string = '';
  selectedHeight: string = '';
  predefinedSizes: string[] = ['100px', '200px', '300px', '400px'];

  updateImageStyle() {
    // Update the image style directly from the input fields
    if (this.image && this.image.style) {
      this.image.style['width'] = this.selectedWidth;
      this.image.style['height'] = this.selectedHeight;
      this.imageUpdated.emit(this.image);
    }
  }

  updateImageStyleFromSelect() {
    // Update the image style when a predefined size is selected
    if (this.image && this.image.style) {
      this.image.style['width'] = this.selectedWidth;
      this.image.style['height'] = this.selectedHeight;
      this.imageUpdated.emit(this.image);
    }
  }

  deleteImage() {
    if (this.image && this.image.id) {
      this.imageDeleted.emit(this.image.id);
      console.log('Image deleted');
    }
  }
  closeConfigContainer() {
    this.closeConfigimg.emit();
  }
}
