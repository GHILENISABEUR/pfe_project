import { Component, EventEmitter, Output,Input, OnInit, OnDestroy,SimpleChanges, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { GraphService } from 'src/app/services/graph/graph.service';
import { PopupService } from 'src/app/services/popup/popup.service';
import Swal from 'sweetalert2';

export interface ApiFile {
  name: string;
  size: string;
  uploaded_at: string;
}
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})

export class FileUploadComponent implements OnInit, OnDestroy, OnChanges {
  selectedFiles: any[] = [];
  databaseFiles: { id: number, name: string, size: string }[] = [];
  showPopup: boolean = false;
  showFileUpload: boolean = false;
  showDatabaseFilesSection: boolean = false;
  popupSubscription!: Subscription;
  popupData: any;
  @Input() sidebarItemId!: number|null;  // Recevoir l'ID du SidebarItem

  @Output() filesSelected = new EventEmitter<File[]>();

  constructor(private popupService: PopupService, private graphService: GraphService) {}

  ngOnInit(): void {
    console.log(",g on init marcge ")
    this.loadExistingFiles();

    this.popupSubscription = this.popupService.popupType$.subscribe(type => {
      this.showPopup = type !== 'none';
    });
    this.popupSubscription = this.popupService.popupData$.subscribe(data => {
      this.popupData = data;
      console.log("Received data:", this.popupData); // Debugging to confirm data receipt
    });
    // Charger les fichiers existants dès l'initialisation
  }
  ngOnChanges(changes: SimpleChanges): void {
    // Vérifier si l'ID du sidebarItem a changé
    if (changes['sidebarItemId'] && changes['sidebarItemId'].currentValue) {
      console.log("changes", changes['sidebarItemId'].currentValue); // Log pour déboguer
      this.loadExistingFiles(); // Recharger les fichiers associés au nouveau sidebarItem
    }
  }
  ngOnDestroy(): void {
    if (this.popupSubscription) {
      this.popupSubscription.unsubscribe();
    }
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      const filesArray = Array.from(input.files);
      console.log("filesArray",filesArray);
      this.selectedFiles.push(...filesArray); // Ajouter les fichiers immédiatement
      this.uploadFilesImmediately(filesArray); // Téléverser les fichiers immédiatement
    }
  }

  removeFilec(index: number): void {
    this.selectedFiles.splice(index, 1); // Supprimer le fichier du tableau
  }
  // removeFilex(index: number): void {
  //   const fileToRemove = this.selectedFiles[index];  // Récupérer le fichier à supprimer
  //   const fileId = fileToRemove.id;  // Assure-toi que l'ID du fichier est présent

  //   this.graphService.deleteFile(fileId).subscribe(
  //     response => {
  //       console.log('File deleted successfully:', response);
  //       // Supprimer le fichier du tableau localement
  //       this.selectedFiles.splice(index, 1);
  //     },
  //     error => {
  //       console.error('Error deleting file:', error);
  //     }
  //   );
  // }
  removeFile(index: number): void {
    const fileToRemove = this.selectedFiles[index]; // Obtenir les détails du fichier à supprimer

    // Fonction pour appliquer le z-index personnalisé
    const applySwalZIndex = () => {
      setTimeout(() => {
        const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
        if (swalContainer) {
          swalContainer.style.zIndex = '9999';
        }
      }, 0);
    };

    // Utilisation de SweetAlert pour demander confirmation
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous ne pourrez pas annuler cette action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler',
      customClass: {
        popup: 'swal2-custom-z-index' // Classe personnalisée pour le z-index
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Supprimer le fichier du tableau côté frontend
        this.selectedFiles.splice(index, 1);

        // Supprimer le fichier du backend
        this.graphService.deleteFileById(fileToRemove.id).subscribe(
          response => {
            Swal.fire(
              'Supprimé!',
              'Le fichier a bien été supprimé.',
              'success'
            );
            applySwalZIndex(); // Appliquer le z-index après l'alerte de succès
            // Recharger la liste des fichiers après suppression (si nécessaire)
            this.loadExistingFiles();
          },
          error => {
            Swal.fire(
              'Erreur!',
              'Une erreur est survenue lors de la suppression du fichier.',
              'error'
            );
            applySwalZIndex(); // Appliquer le z-index après l'alerte d'erreur
            console.error('Error deleting file:', error);
          }
        );
      }
    });

    applySwalZIndex(); // Appliquer le z-index initial
  }


  openSegmentsFilterPopup(fileId: number): void {
    if(this.popupData){
    console.log('Opening Segments Filter Popup with file ID:', fileId);
    this.popupService.openSegmentsFilter(fileId);
  }
  }

  // Fonction pour téléverser les fichiers immédiatement
  uploadFilesImmediately(files: File[]): void {
    console.log("***files**",files)
    const formData = new FormData();

    // Ajouter les fichiers
    files.forEach(file => {
      formData.append('files', file);
    });

    // Ajouter l'ID du sidebarItem
    formData.append('sidebarItemId', this.sidebarItemId!.toString());
    console.log("***sidebarItemId**",formData)
    this.graphService.uploadFiles(formData).subscribe(
      response => {
        console.log('Files uploaded successfully', response);
        this.loadExistingFiles(); // Recharger les fichiers après téléversement
      },
      error => {
        console.error('Error uploading files', error);
      }
    );
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput.click(); // Déclencher la sélection des fichiers
  }
  loadExistingFiles(): void {
    console.log("sidebarItemId", this.sidebarItemId);

    if (this.sidebarItemId) {
      this.graphService.getFilesBySidebarItem(this.sidebarItemId).subscribe(
        response => {
          console.log("Response from API:", response); // Vérifier la structure de la réponse

          // Vérifier que la réponse est bien un tableau et qu'elle contient des objets fichiers
          if (response && Array.isArray(response)) {
            this.selectedFiles = response.map(file => {
              const fileName = file.file.split('/').pop(); // Extraire le nom du fichier
              return {
                id: file.id,
                name: fileName,  // Nom sans le chemin
                size: file.file_size ? parseFloat((file.file_size / 1024).toFixed(2)) : 'Unknown size'
              };
            });
          } else {
            console.error('Files data is missing or not in the expected format.');
          }
        },
        error => {
          console.error('Error loading existing files', error);
        }
      );
    }
  }



  // Charger les fichiers existants lors de l'initialisation
  loadExistingFilesc(): void {
    this.graphService.getAvailableFiles().subscribe(
      response => {
        console.log("Response from API SIIZE:", response); // Vérifier la structure de la réponse

        // Ajouter les fichiers existants au tableau
        this.selectedFiles = response.files.map(file => {
          return {
            name: file.name,
            size: file.file_size ? parseFloat((file.file_size / 1024).toFixed(2)) : 'Unknown size'
          } as File;
        });
      },
      error => {
        console.error('Error loading existing files', error);
      }
    );
  }

  // Show file upload section (Excel)
  showExcelFiles(): void {
    this.showFileUpload = true; // Afficher la section d'import Excel
    this.showDatabaseFilesSection = false; // Ne pas afficher la section "Database"
  }

  // Show database files section (does nothing for now)
  showDatabaseFiles(): void {
    // Just a placeholder for "From Database" button, no action needed
    this.showFileUpload = false;
    this.showDatabaseFilesSection = false;
  }

  closePopup(): void {
    this.showFileUpload = false; // Afficher la section d'import Excel
    this.showDatabaseFilesSection = false;
    this.popupService.closePopup(); // Fermer la popup
  }
}
