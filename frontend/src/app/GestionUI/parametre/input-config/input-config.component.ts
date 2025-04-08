import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputField } from 'src/app/models/InputField.Model'; 
import { InputFieldService } from 'src/app/services/input-field.service';

@Component({
  selector: 'app-input-config',
  templateUrl: './input-config.component.html',
  styleUrls: ['./input-config.component.css']
})
export class InputConfigComponent {
  @Input() inputField!: InputField;
  @Output() inputFieldDeleted = new EventEmitter<number>();
  @Input() isUserMode : boolean=false;
  @Output() closeConfig: EventEmitter<void> = new EventEmitter<void>();
  constructor(private inputFieldService: InputFieldService) { }

  deleteInputField(): void {
    if (this.inputField && this.inputField.id) {
      this.inputFieldService.deleteInputField(this.inputField.id).subscribe(() => {
        console.log('InputField deleted successfully');
        this.inputFieldDeleted.emit(this.inputField.id);  
      });
    }
  }
  closeConfigContainer() {
    this.closeConfig.emit();
  }
}
