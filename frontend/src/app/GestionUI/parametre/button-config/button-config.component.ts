import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button} from 'src/app/models/Button.Model';
import { ButtonValue } from 'src/app/models/ButtonValue'; 
import { ButtonService } from 'src/app/services/button.service'; 

@Component({
  selector: 'app-button-config',
  templateUrl: './button-config.component.html',
  styleUrls: ['./button-config.component.css']
})
export class ButtonConfigComponent {
  @Input() button: Button | null = null;
  @Input() isUserMode: boolean = false;
  @Output() buttonUpdated: EventEmitter<Button> = new EventEmitter<Button>();
  @Output() buttonDeleted: EventEmitter<number> = new EventEmitter<number>();
  @Output() closeConfigbtn: EventEmitter<void> = new EventEmitter<void>();
  buttonValues = ButtonValue;
  constructor(private buttonService: ButtonService) {}
  updateButtonStyle() {
    if (this.button) {
      this.buttonService.updateButton(this.button).subscribe(
        (updatedButton: Button) => {
          this.buttonUpdated.emit(updatedButton);
        },
        (error) => {
          console.error('Error updating button:', error);
        }
      );
    }
  }

  deleteButton() {
    if (this.button) {
      this.buttonDeleted.emit(this.button.id);
    }
  }
  closeConfigContainer() {
    this.closeConfigbtn.emit();
  }
}
