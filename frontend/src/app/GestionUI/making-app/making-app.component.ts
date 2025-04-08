import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { TextService } from 'src/app/services/text.service';
import { Text } from 'src/app/models/Text.Model';
import { SharedService } from 'src/app/services/shared-services.service';
import { FrameService } from '../../services/frame.service';
import { WebsiteService } from '../../services/website.service';
import { FrameElemntService } from '../../services/frame-elemnt.service';
import { TableService } from 'src/app/services/table.service';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { InputFieldService } from 'src/app/services/input-field.service';
import { InputField } from 'src/app/models/InputField.Model';
import { ImageService } from 'src/app/services/image.service';
import { Image } from 'src/app/models/Image.Model';
import { ButtonService } from 'src/app/services/button.service';
import { ButtonValue } from 'src/app/models/ButtonValue';
import { Button } from 'src/app/models/Button.Model';
import { MatDialog } from '@angular/material/dialog';
import { FromDBService } from 'src/app/services/from-db.service';
import { DataBDComponent } from '../component/data-bd/data-bd.component';
@Component({
  selector: 'app-making-app',
  templateUrl: './making-app.component.html',
  styleUrls: ['./making-app.component.css']
})
export class MakingAppComponent implements OnInit {
  inputFields: InputField[] = [];
  selectedInputField: InputField | null = null;
  tables: number[] = [];
  Tables: any[] = [];
  websiteId: any;
  texts: Text[] = [];
  selectedText: Text | null = null;
  images: Image[] = [];
  selectedImage: Image | null = null;
  buttons: Button[] = [];
  selectedButton: Button | null = null;
  fields: any[] = [];
  selectedTable: any;
  constructor(
    public FromDBService:FromDBService,
    private textService: TextService,
    private sharedService: SharedService,
    private frameservice: FrameService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private websiteservice: WebsiteService,
    private elementservice: FrameElemntService,
    public TableService: TableService,
    private inputFieldService: InputFieldService,
    private imageService: ImageService,
    private buttonService: ButtonService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.websiteId = +params.get('id')!;
      console.log("this.websiteId ", this.websiteId)
      this.getTables();
      this.getTexts();
      this.loadInputFields();
      this.loadImages();
      this.loadButtons();
    });
  }
  getTexts(): void {
    this.textService.getTextsByWebsite(this.websiteId).subscribe((data: Text[]) => {
      this.texts = data;
    });
  }
   isUserMode: boolean = false;
   @ViewChild('fileInput') fileInput!: ElementRef;
  toggleMode(): void {
    this.isUserMode = !this.isUserMode;
  }

  getTables() {
    this.TableService.getAllTables(this.websiteId!).subscribe((data: any[]) => {
      this.TableService.tables = data;
      console.log(" this.Tables", this.Tables)
    });
  }
  loadInputFields() {
    this.inputFieldService.getInputFieldsByWebsite(this.websiteId).subscribe((data: InputField[]) => {
      this.inputFields = data;
    });
  }
  loadImages(): void {
    this.imageService.getImagesByWebsite(this.websiteId).subscribe(images => {
      this.images = images;
    });
  }
  loadButtons(): void {
    this.buttonService.getButtonsByWebsite(this.websiteId).subscribe((buttons) => {
      this.buttons = buttons;
    });
  }
  TS_AddTable() {

    this.TableService.addTable(this.websiteId!);
  }
  loadTablePositions() {
    const savedPositions = localStorage.getItem('tablePositions');
    if (savedPositions) {
      const tablePositions = JSON.parse(savedPositions);
      this.TableService.tables.forEach(table => {
        const savedTable = tablePositions.find((t: any) => t.id === table.id);
        if (savedTable) {
          table.position = savedTable.position;
        }
      });
    }
  }

  TS_AddText() {
    console.log("website:"+this.websiteId)
    const textData: Text = {
      id: 0,
      text: "newText",
      style: {
        color: 'black',
        fontSize: '20px',
        left:'30px',
        top:'150px'
      },
      frame: 1,
      website:this.websiteId,
    };
    console.log("textData",textData)
    this.textService.addText(textData).subscribe(response => {
      console.log('Text added successfully', response);
      this.texts.push(response);
    });
  }
  onDragEnded(event: any, item: any) {
    const newPosition = event.source.getFreeDragPosition();
    const position = { top: `${newPosition.y}px`, left: `${newPosition.x}px` };

    console.log('New Position:', position);
    if (item.src !== undefined) {
      this.imageService.updateImage(item.id, { ...item, style: { ...item.style, ...position } }).subscribe(updatedImage => {
        item.style = updatedImage.style;
      });
    }
    if (item.text !== undefined) {
        this.textService.updateTextPosition(item.id, position).subscribe(
            updatedText => {
                console.log('Updated Text:', updatedText);
                item.style['top'] = updatedText.style['top'];
                item.style['left'] = updatedText.style['left'];
            },
            error => {
                console.error('Error updating text position:', error);
            }
        );
    } else if (item.label !== undefined) {
        this.inputFieldService.updateInputFieldPosition(item.id, position).subscribe(
            updatedInputField => {
                item.style['top'] = updatedInputField.style['top'];
                item.style['left'] = updatedInputField.style['left'];
            },
            error => {
                console.error('Error updating input field position:', error);
            }
        );
    }
}

  onTextClick(text: Text): void {
    this.selectedText = text;
  }
  onTextUpdated(updatedText: Text): void {
    const index = this.texts.findIndex(t => t.id === updatedText.id);
    if (index !== -1) {
      this.texts[index] = updatedText;
    }
    this.selectedText = null;
  }

  onTextDeleted(id: number): void {
    this.textService.deleteText(id).subscribe(() => {
      this.texts = this.texts.filter(text => text.id !== id);
      this.selectedText = null;
    });
  }
  TS_AddInputField() {
    const inputFieldData: InputField = {
      id: 0,
      label: "New Input",
      style: {
        color: 'black',
        fontSize: '14px',
        position: 'absolute',
        top: '50px',
        left: '50px'
      },
      frame: 1,
      website:this.websiteId
    };
    this.inputFieldService.addInputField(inputFieldData).subscribe(response => {
      this.inputFields.push(response);
    });
  }
  onInputFieldClick(inputField: InputField) {
    this.selectedInputField = inputField;
  }
  onInputFieldDeleted(inputFieldId: number): void {
    this.inputFields = this.inputFields.filter(inputField => inputField.id !== inputFieldId);
    console.log(`InputField with ID ${inputFieldId} deleted from the list`);
  }
  onImageClick(image: Image): void {
    if (!this.isUserMode) {
      this.selectedImage = image;
    }
  }
  triggerFileInputClick(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const newImage: Image = {
          id: 0,
          src: e.target.result,
          style: {
            top: '0px',
            left: '0px',
            color: '',
            backgroundColor: '',
            fontSize: '',
            fontFamily: ''
          },
          frame: 1,
          website:this.websiteId
        };

        this.imageService.addImage(newImage).subscribe(image => {
          this.images.push(image);
        });
      };
      reader.readAsDataURL(file);
    }
  }
  onImageUpdated(updatedImage: Image): void {
    const index = this.images.findIndex(image => image.id === updatedImage.id);
    if (index !== -1) {
      this.images[index] = updatedImage;
    }
  }

  onImageDeleted(imageId: number): void {
    this.imageService.deleteImage(imageId).subscribe(() => {
      this.images = this.images.filter(image => image.id !== imageId);
      this.selectedImage = null;
    });
  }
  TS_AddButton(): void {
    const newButton: Button = {
      id: 0,
      value: ButtonValue.ADD,
      style: {
        top: '300px',
        left: '50px',
        width: '100px',
        height: '50px',
        color: 'white',
        backgroundColor:'#0000ff00',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderradius: '50%'
      },
      frame: 1,
      website:this.websiteId

    };
    this.buttonService.createButton(newButton).subscribe((button) => {
      this.buttons.push(button);
    });
  }

  onButtonClick(button: Button): void {
    this.selectedButton = button;
  }

  onButtonUpdated(button: Button): void {
    this.buttonService.updateButton(button).subscribe((updatedButton) => {
      const index = this.buttons.findIndex(b => b.id === updatedButton.id);
      if (index !== -1) {
        this.buttons[index] = updatedButton;
      }
    });
  }

  onButtonDeleted(buttonId: number): void {
    this.buttonService.deleteButton(buttonId).subscribe(() => {
      this.buttons = this.buttons.filter(button => button.id !== buttonId);
      this.selectedButton = null;
    });
  }
  closeConfigInp(): void {
    this.selectedInputField = null;
  }
  closeConfigBtn(): void {
    this.selectedButton = null;
  }
  closeConfigImg(): void {
    this.selectedImage = null;
  }
  closeConfigTxt(): void {
    this.selectedText = null;
  }
  TS_fromDB(): void {
    const dialogRef = this.dialog.open(DataBDComponent, {
      width: '400px',
      data: { websiteId: this.websiteId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        // Si result contient selectedTable et fields
        if (result.selectedTable && result.fields) {
          this.selectedTable = result.selectedTable;
          this.fields = result.fields;
          console.log("Selected Table:", this.selectedTable);
          console.log("Fields:", this.fields);
          const newCompnent = {
            type: 'data-table',
            data: { fields: this.fields, selectedTable: this.selectedTable }
          }
          this.FromDBService.TS_fromDB(newCompnent);

        } else {
          this.visualToShow = result;
          console.log("Visual to show:", this.visualToShow);
          const newComponent = {
            type: 'visual-popup',
            data: { visual: this.visualToShow, websiteId: this.websiteId }

          };           this.FromDBService.TS_fromDB(newComponent);

      }
   } });
  }
  visualToShow: any;

}
