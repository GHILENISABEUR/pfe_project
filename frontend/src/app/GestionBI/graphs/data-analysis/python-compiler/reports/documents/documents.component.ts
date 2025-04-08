  import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
  import { GraphsService } from 'src/app/services/Graphs/graphs.service';

  @Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.css']
  })
  export class DocumentsComponent implements OnInit {


    selectedFile: File | null = null;
    constructor(
    private GraphsService:GraphsService,
    ) { }
    @Input() responsibleName: string = '';  
    @Input() isValidation:boolean=false;
    @Input() action:any=null
    @Output() close=new EventEmitter<boolean>();
    documents:any[]=[];

    ngOnInit(): void {
      this.getDocuments();
    }

    onFileSelected(event: any): void {
      this.selectedFile = event.target.files[0];
    }

    onUpload(): void {
      if (this.selectedFile) {
          const formData = new FormData();
          formData.append('Document', this.selectedFile);
          formData.append('Document_Name', this.selectedFile.name);
    
          // Add the responsible person as the User_Submitter
          formData.append('User_Submitter', this.responsibleName);
    
          if (this.isValidation) {
              this.GraphsService.createDocumentValidatedByAction(this.action.Action_Id, formData).subscribe({
                  next: (res: any) => {
                      this.documents.push(res);
                  },
                  error: (err) => {
                      console.error('Error uploading validated document:', err);
                  }
              });
          } else {
              this.GraphsService.createDocumentSubmittedByAction(this.action.Action_Id, formData).subscribe({
                  next: (res: any) => {
                      this.documents.push(res);
                  },
                  error: (err) => {
                      console.error('Error uploading submitted document:', err);
                  }
              });
          }
      }
    }
    
    
    


    getURlDocument(document: any): string {
      return this.GraphsService.APIUrl + document.Document;
    }


    deleteDocument(document: any): void {
      console.log(`Attempting to delete document with ID: ${document.Document_Id}`);
      this.GraphsService.deleteDocument(document.Document_Id).subscribe({
        next: () => {
          console.log(`Document with ID ${document.Document_Id} deleted successfully`);
          this.getDocuments(); // Refresh the document list
        },
        error: (err) => {
          if (err.status === 404) {
            console.error('Document not found:', err);
            alert('Document not found. It might have already been deleted.');
            this.getDocuments(); // Refresh the document list
          } else {
            console.error('Error deleting document:', err);
            alert('An error occurred while deleting the document.');
          }
        }
      });
    }
    
    
    validate(): void {
      this.close.emit(true);
    }
  
    getDocuments(): void {
      if (this.isValidation) {
        this.GraphsService.getDocumentsValidatedByAction(this.action.Action_Id).subscribe({
          next: (documents: any) => {
            this.documents = documents;
          },
          error: (err) => {
            console.error('Error fetching validated documents:', err);
          }
        });
      } else {
        this.GraphsService.getDocumentsSubmittedByAction(this.action.Action_Id).subscribe({
          next: (documents: any) => {
            this.documents = documents;
          },
          error: (err) => {
            console.error('Error fetching submitted documents:', err);
          }
        });
      }
    }

  }
