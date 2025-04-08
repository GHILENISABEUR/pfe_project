import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Text } from 'src/app/models/Text.Model';

@Component({
  selector: 'app-text-config',
  templateUrl: './text-config.component.html',
  styleUrls: ['./text-config.component.css']
})
export class TextConfigComponent implements OnInit {
  @Input() text: Text = { id: 0, text: '', style: {}, frame: 0,website:0 };
  @Output() textUpdated = new EventEmitter<Text>();
  @Output() textDeleted = new EventEmitter<number>();
  @Input() isUserMode : boolean=false;
  @Output() closeConfigtxt: EventEmitter<void> = new EventEmitter<void>();

  textForm: FormGroup;
  fontSizes: string[] = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
  fontFamilies: string[] = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana'];

  constructor(private fb: FormBuilder) {
    this.textForm = this.fb.group({
      text: [''],
      style: this.fb.group({
        color: [''],
        backgroundColor: [''],
        fontSize: [''],
        fontFamily: ['']
      })
    });
  }

  ngOnInit(): void {
    this.textForm.patchValue(this.text);
  }

  onSubmit(): void {
    const updatedText = {
      ...this.text,
      ...this.textForm.value,
      style: {
        ...this.text.style,
        ...this.textForm.value.style,
       
      }
    };
    this.textUpdated.emit(updatedText);
  }
  onDelete(): void {
    this.textDeleted.emit(this.text.id);
  }
  closeConfigContainer() {
    this.closeConfigtxt.emit();
  }
}
