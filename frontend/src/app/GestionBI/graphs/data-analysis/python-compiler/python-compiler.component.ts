import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef,HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormulaireService } from 'src/app/services/formulaire/formulaire.service';
import { GraphsService } from '../../../../services/Graphs/graphs.service';
import { FilterParams } from 'src/app/services/graph/interfaces';
import { PopupService } from 'src/app/services/popup/popup.service';
import { GraphService } from 'src/app/services/graph/graph.service';
import { GraphDataService } from 'src/app/services/graph-data/graph-data.service';
import { MatDialog ,MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSelectChange } from '@angular/material/select';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';


export type ResizeAnchorType =
  | 'top'
  | 'left'
  | 'bottom'
  | 'right'

export type ResizeDirectionType =
  | 'x'
  | 'y'
  | 'xy';


interface Segment {
  column: string;
  uniqueValues: any[];
  type: 'date' | 'number' | 'string'; // Type of the values
}
interface GraphResponse {
  results: {
    [fileId: string]: {
      graphs: { image: string }[];
      filtered_data: any[];
    };
  };
}
@Component({
  selector: 'app-python-compiler',
  templateUrl: './python-compiler.component.html',
  styleUrls: ['./python-compiler.component.css']
})
export class PythonCompilerComponent implements OnInit {
  @Output() onCompilationSuccess = new EventEmitter<number>();

  constructor(
    private FormulaireService: FormulaireService,
    private route: ActivatedRoute,
    private GraphsService: GraphsService,
   private graphService: GraphService, private popupService: PopupService,private dialog: MatDialog,    private graphDataService: GraphDataService,

  ) { }
  @Output() fileReady: EventEmitter<File> = new EventEmitter<File>();

  @Output() closePopUp = new EventEmitter<any>();
  @Output() GraphTab = new EventEmitter<any>();
  @Input() editable: boolean = false;
  @Input() codeGraph: any = {}; // codeGraph is updated here
  @Input() reponse_id: Number = 0;
  @Input() sideBarItemid!:number;
  @Input() reports: any[] = []; // Add the 'reports' property here
  selectedFileId: number | null = null;
  selectedFile: File | null = null;
  code: string = '';
  graphs!:any;

  tGraphId: number = this.codeGraph.Img_Id;


  availableYears: number[] = [];  // Add this to your class
  sidebarVisible = false;
  isAscending = true; // Track sorting order
  sortedUniqueValues: { [key: number]: any[] } = {}; // Store sorted values for each panel
  private isResizing = false;
  private startX: number = 0;
  private startY: number = 0;
  private startWidth: number = 0;
  private startHeight: number = 0;
  width = 300;
  height = 200;

  filterParams: FilterParams = {
    code: this.code,
    filters: {},    // Initialize with an empty object
    sort_by: '',    // Default empty string or appropriate default value
    sort_order: 'asc' ,// Default sort order
    file_ids: this.selectedFileId !== null ? [this.selectedFileId] : [],
    column: '', // Default to an empty string
    years: [], // Initialize with an empty array
    months: [], // Initialize with an empty array
    start_month: 1, // Default to January
    end_month:  12,

  };
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  private resizingElement: HTMLElement | null = null;

  selectedSegments: Segment[] = []; // Use the Segment interface
  showCodeSection: boolean = false;
  showGraphSection: boolean = false;
  fileOptions: any;
  filtersVisible: boolean = false;
  showSidebar = false;
  sortOrder: 'asc' | 'desc' = 'asc'; // Default sort order

  noDataMessage: string = '';

  @ViewChild('uniqueValuesPanel') uniqueValuesPanel!: ElementRef;
  @ViewChild('chronologyFilterPanel') chronologyFilterPanel!: ElementRef;
  selectedYear: number | null = null;
  selectedMonthRange: { start: number; end: number } | null = null;
  Output: any = '';
  Error: any = '';
  imgURL: any = '';
  FileName: any = '';
  itWorks: boolean = false;
  codeIsNew: boolean = true;
  isPrincipal: boolean = true;
  codesToChooseFrom: any[] = [];
  newCodeRef: any = '';
  refrencedCode: any = {};
  dataManagement: any[] = [
    { name: 'Code', isOpen: true },
    { name: 'Causes', isOpen: false },
    { name: 'Consequences', isOpen: false },
    { name: 'management', isOpen: false }
  ];
  newDatasetFormIsOpen: boolean = false;
  selectionResponse: any = 0;
  dataSets: any[] = [];

  ngOnInit(): void {
    if(this.selected==false)
   {
    console.log("na3ml fl load last graph");
    this.loadLatestGraph(this.codeGraph.Img_Id); }// Load the latest graph on component initialization

    this.fetchFileOptions();

    // Subscribe to popup service for unique values updates
    this.popupService.uniqueValues$.subscribe(data => {
      if (data) {
        const segmentType: 'date' | 'number' | 'string' = (data as any).type || 'string';

        const existingSegment = this.selectedSegments.find(segment => segment.column === data.column);
        if (existingSegment) {
          existingSegment.uniqueValues = data.uniqueValues;
        } else {
          this.selectedSegments.push({ column: data.column, uniqueValues: data.uniqueValues, type: segmentType });
        }
      }
    });

    // Subscribe to popup service for chronology filter updates
    this.popupService.chronologyFilter$.subscribe(data => {
      if (data) {
        this.selectedYear = data.year;
        this.selectedMonthRange = data.monthRange;
        this.applyChronologyFilter();
      }
    });

    // Subscribe to GraphDataService for graph updates
    // this.graphDataService.currentGraphs.subscribe(graphs => {
    //   if (graphs.length > 0) {
    //     this.graphs = graphs;
    //     this.showGraphSection = true;
    //     this.noDataMessage = '';
    //   } else {
    //     this.graphs = [];
    //     this.showGraphSection = false;
    //     this.noDataMessage = 'No graphs data available.';
    //   }
    // });
    this.getData();
    this.updateImageUrl();
    this.FileName = this.codeGraph.File_Name; // Update the FileName


    if (this.codeGraph && this.codeGraph.Code_Id) {
      this.GraphsService.getReports(this.codeGraph.Code_Id).subscribe(
        (reports: any) => {
          this.reports = reports;
        },
        (error: any) => {
          console.error('Error fetching reports:', error);
        }
      );
    }

  }


// app-python-compiler.component.ts

t_graph_id:any;

loadLatestGraph(tGraphId: number): void {
  if (!this.selectedFileId) {
    this.graphService.getLatestGraphByTGraphId(tGraphId).pipe(
      switchMap(response => {
        console.log("response",response)
        if (response && response.code && response.graph_url && response.csv_data_id) {
          console.log("Response received:", response);

          this.selectedFileId = response.csv_data_id;
          this.code = response.code; // Set the code
          this.t_graph_id=response.t_graph_id;
          const graphBase64 = 'data:image/png;base64,' + response.graph_url;
          this.graphs=graphBase64;
          this.showGraphSection = true;

          return this.graphService.getFileById(this.selectedFileId!).pipe(
            map(fileBlob => {
              this.selectedFile = new File([fileBlob], "selected-file.csv", { type: fileBlob.type });
              console.log('File selected:', this.selectedFile);

              // Emit the event to notify that the file is ready
              this.fileReady.emit(this.selectedFile);
              return this.selectedFile;
            }),
            catchError(error => {
              console.error('Error fetching file by ID:', error);
              return EMPTY;
            })
          );
        } else {
          console.error('Invalid response:', response);
          return EMPTY;
        }
      })
    ).subscribe(
      (file) => {
        console.log('File is ready:', file);
      },
      error => {
        console.error('Error loading the latest graph:', error);
      }
    );
  } else {
    console.log('File already selected, skipping re-fetch.');
  }
}




  loadReports(): void {
    // Ensure reports are loaded if not already fetched
    if (this.codeGraph.Reports.length > 0) {
        this.reports = this.codeGraph.Reports; // Use existing reports if already fetched
    } else {
        // Fetch reports if not already available
        this.GraphsService.getReports(this.codeGraph.Reports).subscribe(
            (reports: any) => {
                this.reports = reports;
            },
            (error: any) => {
                console.error('Error fetching reports:', error);
            }
        );
    }
}


  updateImageUrl(): void {
    if (this.codeGraph.img_url) {
      this.imgURL = `${this.FormulaireService.PhotoUrl + this.codeGraph.img_url}.png`;
    } else {
      this.imgURL = "../assets/404Img.jpg"; // Fallback if no image is set
    }
  }

  ngOnChanges(): void {
    this.updateImageUrl();
  }

  openGraphTab(event: any) {
    this.GraphTab.emit(event);
  }

  close() {
    this.closePopUp.emit(true);
  }
  verifiesIsOpen(tag: any) {
    const index = this.dataManagement.findIndex((e: any) => e.name === tag);
    return index !== -1 && this.dataManagement[index].isOpen;
  }

  openManagementDataTab(index: any) {
    this.dataManagement.forEach((data, i) => {
      data.isOpen = i === index;
    });
  }

  getResponseWithGraphs(event: any) {
    if (event != 0) {
      this.GraphsService.getCodes(event).subscribe((codes: any) => {
        this.codesToChooseFrom = codes;
      });
    } else {
      this.codesToChooseFrom = [];
    }
  }

  emptyChooseCode() {
    this.codesToChooseFrom = [];
    this.newCodeRef = '';
  }

  getNewDataSet() {
    this.newDatasetFormIsOpen = !this.newDatasetFormIsOpen;
  }

  changeIfPrincipal() {
    const val = {
      Code_Id: this.codeGraph.Code_Id,
      newCodeIsPrincipal: this.codeIsNew ? this.isPrincipal : !this.isPrincipal
    };
    this.GraphsService.updatePrincipleGraph(val).subscribe((res: any) => {
      this.codeGraph.newCodeIsPrincipal = val.newCodeIsPrincipal;
    });
  }

  createReferenceCode() {
    const codeRef = {
      "Code_Id": this.codeGraph.Code_Id,
      "Related_Code": Number(this.newCodeRef)
    };
    this.GraphsService.updateRelatedGraph(codeRef).subscribe((res: any) => {
      this.emptyChooseCode();
      if (res['Related_Code']) {
        this.getReferencedCode(res['Related_Code']['Code_Id']);
        this.codeGraph.Related_Code = res['Related_Code']['Code_Id'];
      } else {
        this.codeGraph.Related_Code = null;
      }
    });
  }

  deleteReference() {
    const codeRef = {
      "Code_Id": this.codeGraph.Code_Id
    };
    this.GraphsService.updateRelatedGraph(codeRef).subscribe((res: any) => {
      this.emptyChooseCode();
      this.codeGraph.Related_Code = null;
      if (!this.codeIsNew) this.imgURL = "../assets/404Img.jpg";
    });
  }

  getReferencedCode(CodeId: any) {
    this.GraphsService.getCodeById(CodeId).subscribe((code: any) => {
      this.refrencedCode = code;
      if (!this.codeIsNew) {
        this.imgURL = code.img_url ? this.FormulaireService.PhotoUrl + code.img_url + '.png' : "../assets/404Img.jpg";
      }
    });
  }

  getNewDatasetId(event: any) {
    if (this.editable) {
      if (event != 0 && event != this.codeGraph.reponse_id) {
        if (this.codeGraph.Code_Id) {
          this.GraphsService.addNewDataset(this.codeGraph.Code_Id, event).subscribe((res: any) => {
            this.FormulaireService.getReponseById(event).subscribe((reponce: any) => {
              this.dataSets.push(reponce);
              this.getNewDataSet();
            });
          });
        }
      } else {
        this.getNewDataSet();
      }
    } else {
      if (event != 0 && event != this.codeGraph.reponse_id) {
        this.FormulaireService.getReponseById(event).subscribe((reponce: any) => {
          this.dataSets.push(reponce);
          this.getNewDataSet();
        });
      }
    }
  }

  deleteCode() {
    this.GraphsService.deleteCode(this.codeGraph.Code_Id).subscribe((res: any) => {
      this.close();
    });
  }

  handleKeydown(event: any) {
    this.itWorks = false;
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      event.target.value = event.target.value.substring(0, start) + '\t' + event.target.value.substring(end);
      event.target.selectionStart = event.target.selectionEnd = start + 1;
    }
  }

  setCodeIsNew(result: boolean) {
    this.codeIsNew = result;
    this.getIfPrincipal();
    if (result) {
      this.imgURL = this.codeGraph.img_url ? this.FormulaireService.PhotoUrl + this.codeGraph.img_url + '.png' : "../assets/404Img.jpg";
    } else {
      if (!this.codeGraph.Related_Code) {
        this.imgURL = "../assets/404Img.jpg";
      } else {
        this.getReferencedCode(this.codeGraph.Related_Code);
      }
    }
  }

  getImgUrl() {
    return this.imgURL;
  }

  SaveCode() {
    if (this.itWorks) {
      if (this.FileName != '' && this.code != "" && !this.editable) {
        const data = {
          Code: this.code,
          File_Name: this.FileName,
          Reponse_Id: this.reponse_id
        };
        this.GraphsService.saveCode(data).subscribe((result: any) => {
          this.Output = result['output'];
          this.Error = result['error'];
          this.close();
        });
      } else if (this.editable) {
        const data = {
          Code: this.codeGraph.Code,
          Reponse_Id: this.codeGraph.Reponse_Id
        };
        this.GraphsService.correctCode(this.codeGraph.Code_Id, data).subscribe((result: any) => {
          if (result != "error saving img") {
            this.imgURL = result.img_url ? this.FormulaireService.PhotoUrl + result.img_url + '.png' : "../assets/404Img.jpg";
          }
        });
      }
    }
  }

  Compile() {
    if (this.editable) {
      this.code = this.codeGraph.Code;
    }
    const codeVal = { code: this.code };
    this.GraphsService.compileCode(codeVal, this.reponse_id).subscribe((result: any) => {
      this.Output = result['output'];
      this.Error = result['error'];
      this.itWorks = this.Error === '';
    });
  }

  getIfPrincipal() {
    this.isPrincipal = this.codeIsNew ? this.codeGraph.newCodeIsPrincipal : !this.codeGraph.newCodeIsPrincipal;
  }

  getData() {
    // Ensure that codeGraph.Datasets is defined and is an array
    if (this.reponse_id !== 0) {
      // Initialize codeGraph.Datasets as an empty array if it's undefined or null
      this.codeGraph.Datasets = this.codeGraph.Datasets || [];

      // Assuming the codeGraph.Datasets already contains the required data
      this.dataSets = [...this.codeGraph.Datasets]; // Directly use the datasets available in codeGraph

      // Set fixed flag to true for the current response
      const currentResponse = this.dataSets.find(ds => ds.id === this.reponse_id);
      if (currentResponse) {
        currentResponse.fixed = true;
      }

      this.getIfPrincipal();
      this.setCodeIsNew(this.codeGraph.newCodeIsPrincipal);
    }
  }

  applyChronologyFilter(): void {
    console.log('Applying chronology filter...');

    if (!this.selectedYear || !this.selectedMonthRange) {
      console.warn('Missing data for filtering.');
      this.noDataMessage = 'Please select year and month range.';
      return;
    }

    // Prepare the filter parameters
    const filterParams: FilterParams = {
      years: [this.selectedYear],
      months: [this.selectedMonthRange.start, this.selectedMonthRange.end],
      start_month: this.selectedMonthRange.start,
      end_month: this.selectedMonthRange.end
    };

    // Call the backend service to apply the chronology filter
    this.graphService.filterGraphByChronology(filterParams).subscribe(
      (response: GraphResponse) => {
        console.log('Filter response:', response);
        if (response && response.results) {
          // this.graphs = Object.values(response.results).flatMap(result =>
          //   result.graphs.map(graph => 'data:image/png;base64,' + graph.image)
          // );
          this.graphs = 'data:image/png;base64,' + Object.values(response.results)
  .flatMap(result => result.graphs.map(graph => graph.image))[0];

          this.showGraphSection = true;
          this.noDataMessage = '';
          console.log('Filtered graph data:', response.results);
        } else {
          console.warn('No graph data available after filtering.');
          this.graphs = null;
          this.showGraphSection = false;
          this.noDataMessage = 'No graph data available for the selected criteria.';
        }
      },
      (error) => {
        console.error('Error filtering graph by chronology:', error);
        this.graphs = null;
        this.showGraphSection = false;
        this.noDataMessage = 'An error occurred while fetching graph data.';
      }
    );
  }
  graphFiltered(filteredData: any): void {
    console.log('Applying filtered data to the graph:', filteredData);
    // Update the graph with filtered data
  }


  ngAfterViewInit(): void {
    if (this.uniqueValuesPanel) {
      this.makePanelDraggable(this.uniqueValuesPanel.nativeElement);
      this.makePanelResizable(this.uniqueValuesPanel.nativeElement);
    }
  }

  toggleSort(panelIndex: number): void {
    // Toggle sort order
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    // Sort values for the specified panel
    this.sortPanelValues(panelIndex);
  }
  sortPanelValues(panelIndex: number): void {
    const segment = this.selectedSegments[panelIndex];
    if (!segment) return;

    const sortedValues = this.sortValues(segment.uniqueValues, this.sortOrder);
    this.sortedUniqueValues[panelIndex] = sortedValues;
  }
  getSortedUniqueValues(segment: any, panelIndex: number): any[] {
    return this.sortedUniqueValues[panelIndex] || segment.uniqueValues || [];
  }
  private sortValues(values: any[], order: 'asc' | 'desc'): any[] {
    return values.slice().sort((a: any, b: any) => {
      if (typeof a === 'string' && typeof b === 'string') {
        return order === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      } else if (typeof a === 'number' && typeof b === 'number') {
        return order === 'asc' ? a - b : b - a;
      } else {
        return 0;
      }
    });
  }


  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    const target = event.target as HTMLElement;
    this.resizingElement = target.closest('.unique-values-panel') as HTMLElement;
    if (this.resizingElement) {
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.startWidth = this.resizingElement.clientWidth;
      this.startHeight = this.resizingElement.clientHeight;
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isResizing && this.resizingElement) {
      const width = this.startWidth + (event.clientX - this.startX);
      const height = this.startHeight + (event.clientY - this.startY);
      this.resizingElement.style.width = `${width}px`;
      this.resizingElement.style.height = `${height}px`;
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isResizing = false;
    this.resizingElement = null;
  }
onDragEnd(event: any): void {
  this.isDragging = false;
  // Optionally update any state or UI after dragging is complete
}


  // onDataClick(): void {
  //   this.popupService.openChoosePopup();
  // }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  onGraphClick(): void {
    this.showCodeSection = true;
    this.popupService.closePopup();
  }

  onFiltersClick(): void {
    this.popupService.openFiltersSelectionPopup();
  }

  onCompile(): void {
    if (!this.selectedFileId || !this.code) {
        alert('Please select a file and enter code to compile.');
        return;
    }

    console.log("this.codeGraph:", this.codeGraph);

    // Création du formulaire de données
    const formData = new FormData();
    formData.append('file_id', this.selectedFileId.toString());
    formData.append('code', this.code);
    formData.append('t_graph_id', this.codeGraph.Img_Id);

    // Appel de la fonction du service pour exécuter le code
    this.graphService.executeCode(formData).subscribe(
        (response) => {
            if (response && response.graph) {
                const graphBase64 = 'data:image/png;base64,' + response.graph;
                this.graphs=graphBase64;
                this.showGraphSection = true;
                console.log('Graph data:', response.graph);

                // Si le résultat est correct, émettre un événement pour notifier le succès de la compilation
                this.onCompilationSuccess.emit(this.codeGraph.sidebar_item); // ou un autre ID si nécessaire
                console.log('Graph data:',  this.codeGraph);

            }
        },
        (error) => {
            console.error('Error executing code:', error);
        }
    );
}

  onValidate(): void {
    this.showCodeSection = false;
    this.showGraphSection = true;
    this.popupService.closePopup();
  }

  fetchFileOptions(): void {




      this.graphService.getFilesBySidebarItem(this.sideBarItemid).subscribe(
        response => {
          console.log("Response from API:", response); // Vérifier la structure de la réponse

          // Vérifier que la réponse est bien un tableau et qu'elle contient des objets fichiers
          if (response && Array.isArray(response)) {
            this.fileOptions = response.map(file => {
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




    console.log('Fetching file options...');
    // this.graphService.getFilesBySidebarItem(this.sideBarItemid).subscribe(
    //   response => {
    //     console.log('File options response:', response);
    //     this.fileOptions = response || [];
    //   },
    //   error => {
    //     console.error('Error fetching file options:', error);
    //   }
    // );
  }


  openSegmentsFilterPopup(): void {
    this.popupService.openSegmentsFilter(this.selectedFileId);
  }

  openChronologyFilterPopup(file: File | null): void {
    this.popupService.openChronologyFilter(file); // Pass the file to the service
  }
  onSegmentSelected(segment: any): void {
    if (this.selectedFileId) {
      this.graphService.getUniqueValues(this.selectedFileId, segment).subscribe(
        response => {
          const uniqueValues = response.unique_values || [];
          this.popupService.notifyUniqueValues(segment, uniqueValues,this.selectedFileId);
        },
        error => {
          console.error('Error fetching unique values:', error);
        }
      );
    }
  }

  onSegmentDeselected(segment: any): void {
    this.selectedSegments = this.selectedSegments.filter(s => s.column !== segment);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedFileId = Number(target.value);

    // Check if selectedFileId is a valid number and greater than 0
    if (selectedFileId > 0) {
      this.selectedFileId = selectedFileId;

      this.graphService.getFileById(selectedFileId).subscribe(
        (fileBlob: Blob) => {
          // Assuming the file is a CSV, but adjust as necessary for other file types
          this.selectedFile = new File([fileBlob], "selected-file.csv", { type: fileBlob.type });

          // Optional: Handle any post-file selection logic here
          console.log('File selected:', this.selectedFile);
        },
        (error) => {
          console.error('Error fetching file by ID:', error);
          // Optionally, you can provide feedback to the user about the error
        }
      );
    } else {
      console.warn('Invalid file ID selected:', selectedFileId);
      // Optionally, reset selectedFileId or notify the user
    }
  }




  private makePanelDraggable(panel: HTMLElement): void {
    const header = panel.querySelector('.draggable-header') as HTMLElement;
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true;
      offsetX = e.clientX - panel.getBoundingClientRect().left;
      offsetY = e.clientY - panel.getBoundingClientRect().top;

      const onMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          panel.style.left = `${e.clientX - offsetX}px`;
          panel.style.top = `${e.clientY - offsetY}px`;
        }
      };

      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }
  private makePanelResizable(panel: HTMLElement): void {
    const resizeHandle = panel.querySelector('.resize-handle') as HTMLElement;

    resizeHandle.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      this.isResizing = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startWidth = panel.offsetWidth;
      this.startHeight = panel.offsetHeight;

      const onMouseMove = (e: MouseEvent) => {
        if (this.isResizing) {
          const width = this.startWidth + (e.clientX - this.startX);
          const height = this.startHeight + (e.clientY - this.startY);
          panel.style.width = `${width}px`;
          panel.style.height = `${height}px`;
        }
      };

      const onMouseUp = () => {
        this.isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  applyFilters(filterParams: FilterParams): void {
    if (!this.selectedFile || !this.code) {
        console.error('No file selected or code provided');
        this.noDataMessage = 'Please select a file and enter code to compile.';
        return;
    }

    const fileIds = this.selectedFileId ? [this.selectedFileId] : [];
   console.log("this.t_graph_id",this.t_graph_id)
    this.graphService.applyFilters(this.selectedFile, this.code,{
        ...filterParams,
        file_ids: fileIds,
    },this.t_graph_id,this.sideBarItemid).subscribe(
        response => {
          console.log("response*****",response)
            if (response && response.graph) {
              console.log('**************')
                // this.graphs = response.graphs.map((graph: any) =>
                //     'data:image/png;base64,' + graph.image
                // );





                const graphBase64 = 'data:image/png;base64,' + response.graph;
                this.graphs=graphBase64;
                this.showGraphSection = true;
                console.log('Graph data:', response.graph);

                // Si le résultat est correct, émettre un événement pour notifier le succès de la compilation
                this.onCompilationSuccess.emit(this.codeGraph.sidebar_item); // ou un autre ID si nécessaire
                console.log('Graph data:',  this.codeGraph);






                this.showGraphSection = true;
                this.noDataMessage = '';
                console.log("this.graphs",this.graphs)
            } else {
                this.graphs =null;
                this.showGraphSection = false;
                this.noDataMessage = 'No graph data available for the selected criteria.';
            }
        },
        (error: HttpErrorResponse) => {
            console.error('Error applying filters:', error);
            this.graphs = null;
            this.showGraphSection = false;
            this.noDataMessage = 'An error occurred while fetching graph data.';
        }
    );
}

onUniqueValueClicked(column: string, value: any, event: MouseEvent): void {
  const segment = this.selectedSegments.find(seg => seg.column === column);

  if (segment) {
    const isCtrlPressed = event.ctrlKey;
    const isShiftPressed = event.shiftKey;

    if (!segment.uniqueValues) {
      segment.uniqueValues = [];
    }

    if (isCtrlPressed || isShiftPressed) {
      if (segment.uniqueValues.includes(value)) {
        segment.uniqueValues = segment.uniqueValues.filter(v => v !== value);
      } else {
        segment.uniqueValues.push(value);
      }
    } else {
      segment.uniqueValues = [value];
    }

    console.log(`Segment '${column}' unique values after click:`, segment.uniqueValues);

    this.onUniqueValueSelected(column, segment.uniqueValues,this.selectedSegments);
  }
}

selected=false;
onUniqueValueSelected(column: string, selectedValues: any[],selectedSegments:any): void {
  this.selected = true;
  console.log("selecteedfile", this.selectedFile);
  console.log("Selected values for column", column, selectedValues);

  // Proceed only if both the file and code are available
  if (this.selectedFile && this.code) {
    const filters = selectedSegments.reduce((acc, segment) => {
      if (segment.uniqueValues.length > 0) {
        acc[segment.column] = segment.uniqueValues;
      }
      return acc;
    }, {} as { [key: string]: any[] });

    const filterParams: FilterParams = {
      file_ids: this.selectedFileId !== null ? [this.selectedFileId] : [],
      column: column,
      filters: filters
    };
    console.log("filterParams",filterParams)
    // Apply the filters using the selected file and code
    this.applyFilters(filterParams);
  } else {
    console.error('Missing required parameters.');
    this.graphs = null;
    this.showGraphSection = false;
    this.noDataMessage = 'Please select a file and enter code to compile.';
  }
}





  createFormData(): FormData {
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
    formData.append('code', this.code);
    return formData;
  }
}
