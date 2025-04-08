import { Component, OnInit, ViewChild, ElementRef,Output, EventEmitter,ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CdkDragDrop, CdkDragEnd, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { GraphsService } from 'src/app/services/Graphs/graphs.service'; // Update the path as necessary
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';  // Import ActivatedRoute
import { SidebarItem } from 'src/app/models/sidebar-item-graph.model';
import { PopupService } from 'src/app/services/popup/popup.service';
import { GraphService } from 'src/app/services/graph/graph.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { PythonCompilerComponent } from './python-compiler/python-compiler.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FilterParams } from 'src/app/services/graph/interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';


interface Segment {
  id?:number;
  column: string;
  uniqueValues: any[];
 selectedFileId:any;
  type: 'date' | 'number' | 'string'; // Type of the values
  unique_values_selected:any;
  selectedSidebarItem:any

}
@Component({
  selector: 'app-data-analysis',
  templateUrl: './data-analysis.component.html',
  styleUrls: ['./data-analysis.component.css'],
})
export class DataAnalysisComponent implements OnInit {
  @ViewChild('navTabs', { read: ElementRef }) navTabs!: ElementRef;
  @ViewChild('frameContainer', { read: ViewContainerRef }) frameContainer!: ViewContainerRef;
  @ViewChild(PythonCompilerComponent) pythonCompiler!: PythonCompilerComponent;
  @ViewChild(PythonCompilerComponent) pythonCompilerComponent!: PythonCompilerComponent;

  selectedSegments: Segment[] = []; // Interface Segment doit être importée ou créée
  width = 300; // Largeur par défaut des panneaux
  height = 200; // Hauteur par défaut des panneaux
  filtersVisible = false;
  selectedFile: File | null = null;
  sortedUniqueValues: { [key: number]: any[] } = {}; // Pour stocker les valeurs triées
  sortOrder: 'asc' | 'desc' = 'asc'; // Ordre de tri par défaut
  private resizingElement: HTMLElement | null = null;

  websiteId: number = 1; // Set a default value
  selectedSidebarItem!: any ; // Add this to store the selected item
/*cahngemeeeeeent*/
  selected = new FormControl(0);
  lotsOfTabs: any[] = [];
  showCodeIsOpen: boolean = false;
  addCodeFormIsOpen: boolean = false;
  responseSelected: any = 0;
  codeGraph: any = {};
  graphs: any[] = [];
  canAdd: boolean = false;
  addingGraph: boolean = false;
  editingGraph: boolean = false;
  graphName: string = 'Default Graph Name';
  graphImgUrl: string = '';
  currentGraph: any = null;
  selectedIndex: number | null = null; // Track the selected tab index
  isDragging: boolean = false; // Add this flag
  File_Name: string = ''; // Initialize it as an empty string
  isResizing: boolean = false; // Track if resizing is active
  selectedFileId:any;
  resizingIndex: number | null = null; // Track which graph is being resized
  startWidth: number = 0;
  startHeight: number = 0;
  startX: number = 0;
  startY: number = 0;
  constructor(private router: Router,  private graphService: GraphService,private popupService: PopupService,private GraphService:GraphService, private graphsService: GraphsService, private cdr: ChangeDetectorRef, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.websiteId = isNaN(id) ? 1 : id; // Fallback to 1 if NaN
    });
 this.filterGraphsByCriteria();
    this.popupService.uniqueValues$.subscribe(data => {
      console.log('Incoming Data:', data);

      if (data) {
        const segmentType: 'date' | 'number' | 'string' = (data as any).type || 'string';
        const existingSegment = this.selectedSegments.find(segment => segment.column === data.column);

        console.log('this.selectedSegments1', this.selectedSegments);

        // Check if this.selectedSegments is not empty
        if (this.selectedSegments.length > 0) {
          this.selectedFileId = this.selectedSegments[0]?.selectedFileId || null;
          console.log('Selected File ID:', this.selectedFileId);
        } else if (data.selectedFileId) {
          this.selectedFileId = data.selectedFileId; // Fallback to data.selectedFileId
          console.log('Fallback Selected File ID:', this.selectedFileId);
        } else {
          console.warn('selectedFileId is missing in both segments and data');
        }

        if (existingSegment) {
          existingSegment.uniqueValues = data.uniqueValues;
          console.log('Updated existingSegment:', existingSegment);
        } else {
          console.log('Adding new segment:', data);

          // Ajouter la création d'un segment et l'envoi à l'API
          const newSegment = {
            column: data.column,
            uniqueValues: data.uniqueValues,
            selectedFileId: data.selectedFileId, // Ensure `selectedFileId` is passed from data
            type: segmentType,
            selectedSidebarItem: this.selectedSidebarItem.id // Ajouter l'ID de la barre latérale
          };

          this.graphsService.addSelectedSegment(this.selectedSidebarItem.id, newSegment).subscribe(
            (response) => {
              console.log('Segment created successfully:', response);
              this.selectedSegments.push(response); // Ajouter la réponse au tableau local
              console.log('Updated this.selectedSegments:', this.selectedSegments);
            },
            (error) => {
              console.error('Error creating segment:', error);
            }
          );
        }
      }

    });




    // Subscribe to popup service for chronology filter updates
    // this.popupService.chronologyFilter$.subscribe(data => {
    //   if (data) {
    //     this.selectedYear = data.year;
    //     this.selectedMonthRange = data.monthRange;
    //     this.applyChronologyFilter();
    //   }
    // });



  }
  // In DataAnalysisComponent
  // In DataAnalysisComponent
  ngAfterViewInit(): void {
    this.pythonCompiler.onCompilationSuccess.subscribe(itemId => {
      this.handleCompilationSuccess(itemId);
    });
  }
  onSidebarItemSelect(item: any): void {
  this.selectedSidebarItem = item; // Store the selected sidebar item
  if (item) {
    this.selectedSidebarItem = item;
    console.log("item+++++++")
    this.loadGraphsForItem(item.id); // Load graphs associated with the selected item
    this.graphsService.getSelectedSegmentsBySidebarItemId(item.id).subscribe(
      (segments) => {
        console.log('Selected Segments fetched:', segments);
        this.selectedSegments = segments; // Mettez à jour selectedSegments avec les données récupérées

        if (this.selectedSegments.length > 0) {
          this.selectedFileId = this.selectedSegments[0]?.selectedFileId || null;
          console.log('Selected File ID:', this.selectedFileId);
        } else {
          console.warn('selectedFileId is missing in both segments and data');
        }
      },
      (error) => {
        this.selectedSegments =[];
        console.error('Error fetching selected segments:', error);
      }
    );
  }
}
handleCompilationSuccess(itemId: number): void {
  console.log("itemId**********",itemId)
  this.loadGraphsForItem(itemId);
}


loadGraphsForItem(itemId: number): void {

  // Vider les anciens graphiques avant de charger les nouveaux
  this.graphs = [];

  this.graphsService.getGraphsByItem(itemId).subscribe(
    (data: any[]) => {

      // Créer un tableau d'observables pour récupérer toutes les URL d'images
      const imageRequests = data.map(graph =>
        this.getImgUrl(graph).pipe(
          map(imgUrl => ({
            ...graph,
            img_url: imgUrl, // Ajouter l'URL de l'image au graphique
            Code_Python_Id: graph.Code_Python,
            Code_Id: graph.Code_Python,
            Causes: graph.Causes || [],
            Consequences: graph.Consequences || [],
            x_position: graph.x_position || 0,
            y_position: graph.y_position || 0
          }))
        )
      );

      // Attendre que toutes les URL d'images soient résolues
      forkJoin(imageRequests).subscribe(
        (updatedGraphs) => {
          // Mettre à jour les graphiques avec les nouvelles données
          this.graphs = updatedGraphs;

          console.log('Positions des graphiques chargées :', this.graphs.map(g => ({
            id: g.Code_Python_Id,
            x: g.x_position,
            y: g.y_position
          })));
          console.log("this.graphs**",this.graphs)
          // Appliquer les positions stockées à chaque élément graphique
          setTimeout(() => {
            this.graphs.forEach((graph, index) => {
              const graphElement = document.getElementById(`graph-${index}`);
              if (graphElement) {
                console.log("****************graphElement****************",graphElement)
                graphElement.style.transform = `translate(${graph.x_position}px, ${graph.y_position}px)`;
              }
            });
          }, 0); // Délai pour garantir que le DOM est prêt
        },
        (error) => {
          console.error('Erreur lors de la récupération des URLs d\'image :', error);
        }
      );
    },
    (error) => {
      console.error('Erreur lors de la récupération des graphiques :', error);
    }
  );

}

loadGraphsForItemb(itemId: number): void {
  this.graphsService.getGraphsByItem(itemId).subscribe(
    (data: any[]) => {
      // Create an array of observables for fetching all image URLs
      const imageRequests = data.map(graph =>
        this.getImgUrl(graph).pipe(
          map(imgUrl => ({
            ...graph,
            img_url: imgUrl, // Include the fetched img_url in the graph object
            Code_Python_Id: graph.Code_Python,
            Code_Id: graph.Code_Python,
            Causes: graph.Causes || [],
            Consequences: graph.Consequences || [],
            x_position: graph.x_position || 0,
            y_position: graph.y_position || 0
          }))
        )
      );

      // Wait for all image URLs to be resolved
      forkJoin(imageRequests).subscribe(
        (updatedGraphs) => {
          this.graphs = updatedGraphs; // Set the resolved graphs with img_urls
          console.log('Loaded graph positions:', this.graphs.map(g => ({
            id: g.Code_Python_Id,
            x: g.x_position,
            y: g.y_position
          })));

          // Apply the stored positions to each graph element
          setTimeout(() => {
            this.graphs.forEach((graph, index) => {
              const graphElement = document.getElementById(`graph-${index}`);
              if (graphElement) {
                graphElement.style.transform = `translate(${graph.x_position}px, ${graph.y_position}px)`;
              }
            });
          }, 0); // Delay to ensure DOM is ready
        },
        (error) => {
          console.error('Error fetching image URLs:', error);
        }
      );
    },
    (error) => {
      console.error('Error fetching graphs:', error);
    }
  );
}
loadGraphsForItemn(itemId: number): void {
  this.graphsService.getGraphsByItem(itemId).subscribe(
    (data: any[]) => {

      this.graphs = data.map(graph => {
        this.getImgUrl(graph).subscribe(
          (imgUrl: string) => {
            console.log("graph.img_url",graph.img_url)
            graph.img_url = imgUrl;
            console.log("graph.img_url*****",graph.img_url)
          },
          (error) => {
            console.error('Error setting image URL:', error);
          }
        );
console.log("cccc",{
  ...graph,
  img_url:graph.img_url,
  Code_Python_Id: graph.Code_Python,
  Code_Id: graph.Code_Python,
  Causes: graph.Causes || [],
  Consequences: graph.Consequences || [],
  x_position: graph.x_position || 0,
  y_position: graph.y_position || 0
});
        return {
          ...graph,
          img_url:graph.img_url,
          Code_Python_Id: graph.Code_Python,
          Code_Id: graph.Code_Python,
          Causes: graph.Causes || [],
          Consequences: graph.Consequences || [],
          x_position: graph.x_position || 0,
          y_position: graph.y_position || 0
        };
      });

      console.log('Loaded graph positions:', this.graphs.map(g => ({ id: g.Code_Python_Id, x: g.x_position, y: g.y_position })));

      // Apply the stored positions to each graph element
      setTimeout(() => {
        this.graphs.forEach((graph, index) => {
          const graphElement = document.getElementById(`graph-${index}`);
          if (graphElement) {
            graphElement.style.transform = 'translate(0, 0)';
            graphElement.style.transform = `translate(${graph.x_position}px, ${graph.y_position}px)`;
          }
        });
      }, 0); // Delay to ensure DOM is ready
    },
    error => {
      console.error('Error fetching graphs:', error);
    }
  );
}
/*ggg*/

  onResizeStart(event: MouseEvent, index: number): void {
    this.isResizing = true;
    this.resizingIndex = index;
    this.startWidth = this.graphs[index].width || 340; // Default width
    this.startHeight = this.graphs[index].height || 230; // Default height
    this.startX = event.clientX;
    this.startY = event.clientY;

    // Listen to mouse move and mouse up events
    document.addEventListener('mousemove', this.onResizing);
    document.addEventListener('mouseup', this.onResizeEnd);
}

onResizing = (event: MouseEvent): void => {
    if (this.resizingIndex === null) return;

    const graph = this.graphs[this.resizingIndex];
    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;

    // Ensure resizing only changes dimensions, not the position
    graph.width = Math.max(this.startWidth + dx, 200); // Minimum width of 200px
    graph.height = Math.max(this.startHeight + dy, 150); // Minimum height of 150px

    // Apply the new width and height to the graph element
    const graphElement = document.getElementById(`graph-${this.resizingIndex}`);
    if (graphElement) {
        graphElement.style.width = `${graph.width}px`;
        graphElement.style.height = `${graph.height}px`;
    }
};

onResizeEnd = (): void => {
    if (this.resizingIndex !== null) {
        const graph = this.graphs[this.resizingIndex];

        // Save only the width and height, not the position
        this.graphsService.updateGraphSize(graph.Code_Python_Id, { width: graph.width, height: graph.height })
            .subscribe(
                response => {
                    console.log('Graph size updated successfully:', response);
                },
                error => {
                    console.error('Error updating graph size:', error);
                }
            );

        this.isResizing = false;
        this.resizingIndex = null;
    }

    // Clean up event listeners
    document.removeEventListener('mousemove', this.onResizing);
    document.removeEventListener('mouseup', this.onResizeEnd);
};
// ISClicked=false;
onDataClick(): void {
  this.popupService.openChoosePopup(false);
  // this.ISClicked=true;

}
onFiltersClick(): void {
  this.popupService.openFiltersSelectionPopup();

}
  loadGraphs(): void {
    this.graphsService.fetchGraphs().subscribe(
      (data: any[]) => {
        this.graphs = data.map(graph => {
          this.getImgUrl(graph); // Fetch image for each graph

          return {
            ...graph,
            Code_Python_Id: graph.Code_Python,
            Code_Id: graph.Code_Python,
            Causes: graph.Causes || [],
            Consequences: graph.Consequences || [],
            x_position: graph.x_position || 0,
            y_position: graph.y_position || 0
          };
        });

        console.log('Loaded graph positions:', this.graphs.map(g => ({ id: g.Code_Python_Id, x: g.x_position, y: g.y_position })));

        // Apply the stored positions to each graph element
        setTimeout(() => {
          this.graphs.forEach((graph, index) => {
            const graphElement = document.getElementById(`graph-${index}`);
            if (graphElement) {
              // Reset any existing transform before applying the new one
              graphElement.style.transform = 'translate(0, 0)';
              console.log(`Applying position for graph index ${index}: x = ${graph.x_position}, y = ${graph.y_position}`);
              graphElement.style.transform = `translate(${graph.x_position}px, ${graph.y_position}px)`;
            }
          });
        }, 0); // Delay to ensure DOM is ready
      },
      error => {
        console.error('Error fetching graphs:', error);
      }
    );
  }



handleClosePopUp(): void {
  this.showCodeIsOpen = false; // Simply close the pop-up without affecting other data
}







  // Method to remove unwanted graphs
  removeUnwantedGraphs(): void {
    this.graphs = this.graphs.filter(graph => graph.Img_Id !== undefined); // Adjust the condition based on your criteria
  }

//   openCode(event: any) {
//     this.codeGraph = {};
//     this.graphs = this.graphs.filter(graph => graph.Code_Python_Id === this.responseSelected);
//     if (this.showCodeIsOpen) {
//         const index = this.lotsOfTabs.findIndex((e: any) => e.Code_Python_Id == event.Code_Python_Id);
//         if (index != -1) this.lotsOfTabs.splice(index, 1);
//         if (this.lotsOfTabs.length == 0) this.showCodeIsOpen = false;
//     } else {
//         this.showCodeIsOpen = true;
//     }
// }

openGraphTab(graph: any) {
  const codePythonId = graph.Code_Python_Id || graph.Code_Id;

  if (!codePythonId) {
    console.error('Cannot open a tab with an undefined Code_Python_Id.');
    return; // Exit early if the ID is undefined
  }

  console.log('Opening graph tab with Code_Python_Id:', codePythonId);

  // const codeGraphExists = this.lotsOfTabs.some(tab => tab === this.codeGraph);

  // if (codeGraphExists) {
  //   const existingIndex = this.lotsOfTabs.findIndex(tab => tab === this.codeGraph);
  //   this.selectedIndex = existingIndex;
  //   this.selected.setValue(this.selectedIndex);
  // } else {
  //   this.lotsOfTabs.push(this.codeGraph);
  //   this.selectedIndex = this.lotsOfTabs.length - 1;
  //   this.selected.setValue(this.selectedIndex);
  // }


  // Check if the tab with the given Code_Python_Id is already open
  const existingIndex = this.lotsOfTabs.findIndex(tab => tab === codePythonId);

  if (existingIndex ) {
    // If the tab is not already open, open it

    this.codeGraph = graph;
    this.codeGraph.Code_Id = codePythonId;

    this.lotsOfTabs.push(graph);
    this.selectedIndex = existingIndex;
    this.selected.setValue(this.selectedIndex);
  } else {
    // If the tab is already open, navigate to it
    this.lotsOfTabs.push(codePythonId);

    this.selectedIndex = this.lotsOfTabs.length - 1;
    this.selected.setValue(this.selectedIndex);
  }
}





  openAddCode() {
    this.graphs = this.graphs;
    this.addCodeFormIsOpen = !this.addCodeFormIsOpen;
    this.lotsOfTabs = [];
  }

  addCode() {
    this.lotsOfTabs.push({
      File_Name: 'new code',
    });
    this.addCodeFormIsOpen = !this.addCodeFormIsOpen;
  }

  /*getcode(index: any) {
    this.codeGraph = this.graphs[index];
    this.showCodeIsOpen = true;
    this.lotsOfTabs.push(this.codeGraph);
    this.selectedIndex = this.lotsOfTabs.length - 1;
    this.selected.setValue(this.selectedIndex);
  }*/

  closeTab(index: number) {
    this.lotsOfTabs.splice(index, 1);
    if (this.lotsOfTabs.length === 0) {
      this.showCodeIsOpen = false;
      this.selectedIndex = null;
    } else {
      this.selectedIndex = Math.min(this.selectedIndex || 0, this.lotsOfTabs.length - 1);
      this.selected.setValue(this.selectedIndex);
    }
  }

  openAddGraphInterface() {
    if (!this.selectedSidebarItem) {
      alert('Please select an item before adding a graph.');
      return;
    }

    const uniqueImgName = 'graph_' + Math.random().toString(36).substring(7);

    this.currentGraph = {
      Code: 'print("Hello, World!")',
      Img_Name: uniqueImgName,
      Reponse_Id: null,
      Related_Code: null,
      newCodeIsPrincipal: true,
      Datasets: [],
      Causes: [],
      Consequences: [],
      Reports: [],
      Item_Id: this.selectedSidebarItem.id  // Include the selected item's ID
    };

    this.graphsService.createGraph(this.currentGraph).subscribe(
      (data: any) => {
        // After successfully creating the graph, reload the list of graphs
        this.loadGraphsForItem(this.selectedSidebarItem!.id);  // Reloads all graphs for the selected item

        // Optionally, directly set the current graph based on the response data
        this.currentGraph = data;
        this.currentGraph.Code_Id = data.Code_Python_Id;


        // Open the tab for the newly created graph
        this.lotsOfTabs.push(this.currentGraph);
        this.showCodeIsOpen = true;
        this.selectedIndex = this.lotsOfTabs.length - 1;
        this.selected.setValue(this.selectedIndex);
      },
      (error: any) => {
        console.error('Error creating graph:', error);
      }
    );
  }





editGraph(graph: any) {
  this.addingGraph = true;
  this.editingGraph = true;
  this.graphName = graph.File_Name;
  this.graphImgUrl = graph.img_url;
  this.currentGraph = graph;
  this.showCodeIsOpen = true;
  this.codeGraph = graph;
  const index = this.lotsOfTabs.findIndex((e: any) => e.Code_Id == graph.Code_Id);
  if (index == -1) {
    this.lotsOfTabs.push(graph);
    this.selectedIndex = this.lotsOfTabs.length - 1;
    this.selected.setValue(this.selectedIndex);
  } else {
    this.selectedIndex = index;
    this.selected.setValue(this.selectedIndex);
  }
}
saveGraph() {
  try {
      if (this.editingGraph && this.currentGraph) {
          console.log('Saving graph:', this.currentGraph);
          this.currentGraph.File_Name = this.graphName;
          this.currentGraph.img_url = this.graphImgUrl;

          const updateData = {
              File_Name: this.graphName,
              Img_Name: this.graphName,
              Causes: this.currentGraph.Causes.map((cause: any) => cause.Code_Id),
              Consequences: this.currentGraph.Consequences.map((consequence: any) => consequence.Code_Id)
          };

          // Ensure you are passing the correct Code_Python_Id
          this.graphsService.updateGraph(this.currentGraph.Code_Python_Id, updateData).subscribe(
              () => {
                  console.log('Graph updated successfully');
                  this.loadGraphs(); // Reload graphs to reflect changes
              },
              error => {
                  console.error('Error updating graph:', error);
              }
          );
      }
      this.addingGraph = false;
      this.editingGraph = false;
      this.showCodeIsOpen = false;
  } catch (error) {
      console.error('Unexpected error:', error);
  }
}










enableEdit(tab: any) {
  const nameToUse = tab.File_Name || tab.Img_Name; // Fallback to Img_Name if File_Name is undefined
  if (nameToUse) {
    tab.isEditing = true;
    tab.originalName = nameToUse; // Store the original name
    tab.File_Name = nameToUse; // Always fill the input with the old name
    this.cdr.detectChanges(); // Manually trigger change detection
    console.log('Original Name:', tab.originalName); // Debugging: Check the original name
  } else {
    console.error('No valid name found for editing');
  }
}


saveTabName(tab: any) {
  console.log('Saving graph with Code_Python_Id:', tab.Code_Python_Id);

  if (!tab.Code_Python_Id) {
    console.error('Code_Python_Id is undefined for this tab.');
    return;
  }

  // Prepare the data to be updated
  const updatedData = {
    File_Name: tab.File_Name,
    Img_Name: tab.File_Name, // Ensure Img_Name is updated as well
    Causes: tab.Causes.map((cause: any) => cause.Code_Id),
    Consequences: tab.Consequences.map((consequence: any) => consequence.Code_Id),
  };

  // Update the graph
  this.graphsService.updateGraph(tab.Code_Python_Id, updatedData).subscribe(
    (response) => {
      console.log('Success:', response);

      // Update the `lotsOfTabs` and `graphs` arrays
      const tabIndex = this.lotsOfTabs.findIndex((t: any) => t.Code_Python_Id === tab.Code_Python_Id);
      if (tabIndex !== -1) {
        this.lotsOfTabs[tabIndex].File_Name = tab.File_Name;
        this.lotsOfTabs[tabIndex].Img_Name = tab.File_Name; // Also update Img_Name
      }

      const graphIndex = this.graphs.findIndex((g: any) => g.Code_Python_Id === tab.Code_Python_Id);
      if (graphIndex !== -1) {
        this.graphs[graphIndex].File_Name = tab.File_Name;
        this.graphs[graphIndex].Img_Name = tab.File_Name;
      }

      tab.isEditing = false; // Close the edit mode for the tab
    },
    (error) => {
      console.error('Error:', error);
    }
  );
}

cancelEdit(tab: any) {
  console.log('Reverting to original name:', tab.originalName);
  tab.File_Name = tab.originalName; // Revert to original name
  tab.isEditing = false;
  this.cdr.detectChanges(); // Manually trigger change detection
}





  scrollTabs(direction: string) {
    const navTabsEl = this.navTabs.nativeElement;
    const scrollAmount = 200;
    if (direction === 'left') {
      navTabsEl.scrollLeft -= scrollAmount;
    } else if (direction === 'right') {
      navTabsEl.scrollLeft += scrollAmount;
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  dropTab(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.lotsOfTabs, event.previousIndex, event.currentIndex);
  }
  dropGraph(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.graphs, event.previousIndex, event.currentIndex);
  }

  onDoubleClickGraph(graph: any) {
    this.openGraphTab(graph); // This will add the tab and set the selected index
  }
  getImgUrl(graph: any): Observable<string> {
    return this.graphService.getLatestGraphByTGraphId(graph.Img_Id).pipe(
      map(response => {
        if (response && response.graph_url) {
          const imgUrl = 'data:image/png;base64,' + response.graph_url;
          console.log("Image URL: ", imgUrl);
          return imgUrl;
        } else {
          console.log("Default image used");
          return '../assets/no-graph.jpg'; // Default image
        }
      }),
      catchError(error => {
        console.error('Error loading the latest graph:', error);
        return of('../assets/no-graph.jpg'); // Return default image on error
      })
    );
  }



  loadLatestGraph(tGraphId: number): void {
    this.graphService.getLatestGraphByTGraphId(tGraphId).subscribe(
      (response) => {
        if (response && response.graph_url) {
          const graphBase64 = response.graph_url ? 'data:image/png;base64,' + response.graph_url : '../assets/no-graph.jpg';

        }
      },
      (error) => {
        console.error('Error loading the latest graph:', error);
      }
    );
  }


  compileCode(graph: any) {
    const codeData = {
        code: graph.code, // Your code logic here
    };
    this.graphsService.compileCode(codeData, graph.Code_Python_Id).subscribe(
        (result: any) => {
            console.log('Compilation result:', result);
            // Handle the compilation result here
        },
        (error: any) => {
            console.error('Compilation error:', error);
        }
    );
}

deleteGraph(graphId: number) {
  console.log('Deleting graph with ID:', graphId);

  if (!graphId) {
    console.error('Graph ID is undefined');
    return;
  }

  this.graphsService.deleteGraph(graphId).subscribe(
    () => {
      if (this.selectedSidebarItem) {
        // Reload graphs for the currently selected sidebar item only
        this.loadGraphsForItem(this.selectedSidebarItem.id);
      } else {
        // If no sidebar item is selected, fall back to fetching all graphs
        this.loadGraphs();
      }
    },
    (error: any) => {
      console.error('Error deleting graph:', error);
    }
  );
}



  onDragMoved(event: CdkDragMove<any>, index: number): void {
    const position = event.pointerPosition;
    this.graphs[index].x_position = position.x;
    this.graphs[index].y_position = position.y;

    // Save this position to the backend
    this.graphsService.updateGraphPosition(this.graphs[index].Code_Python_Id, position).subscribe(
      (response) => {
        console.log('Position saved successfully:', response);
      },
      (error) => {
        console.error('Error saving position:', error);
      }
    );
  }


//   onDragStart(): void {
//     this.isDragging = true;
//     console.log('Drag Start Triggered');
// }

// onDragEnd(event: CdkDragEnd<any>, index: number): void {
//   console.log('Drag End Triggered');

//   const graphElement = event.source.element.nativeElement;
//   const rect = graphElement.getBoundingClientRect();

//   const x_position = rect.left - graphElement.parentElement!.getBoundingClientRect().left;
//   const y_position = rect.top - graphElement.parentElement!.getBoundingClientRect().top;

//   console.log(`Graph index ${index} dropped at position x: ${x_position}, y: ${y_position}`);

//   if (!isNaN(x_position) && !isNaN(y_position)) {
//       this.graphs[index].x_position = x_position;
//       this.graphs[index].y_position = y_position;

//       const graphId = this.graphs[index].Code_Python_Id || this.graphs[index].Code_Id;

//       // ** ADD THIS LOG TO CHECK THE ID **
//       console.log('Updating graph ID:', graphId);  // Log the ID here

//       if (!graphId) {
//         console.error('Graph ID is undefined, cannot update position.');
//         return; // Exit if graphId is not defined
//       }

//       this.graphsService.updateGraphPosition(graphId, { x: x_position, y: y_position }).subscribe(
//           () => {
//               console.log('Graph position updated');
//           },
//           (error) => {
//               console.error('Failed to update graph position', error);
//           }
//       );
//   } else {
//       console.error('Invalid position values:', { x_position, y_position });
//   }

//   setTimeout(() => {
//       this.isDragging = false;
//   }, 0);
// }




onDragStart(index: number): void {
  this.isDragging = true;
  console.log(`Drag started for graph index ${index}`);
}

onDragEnd(event: CdkDragEnd<any>, index: number): void {
  console.log('Drag ended for graph index:', index);

  // Récupérer l'élément et ses nouvelles coordonnées
  const graphElement = event.source.element.nativeElement;
  const rect = graphElement.getBoundingClientRect();

  const parentRect = graphElement.parentElement!.getBoundingClientRect();
  const x_position = rect.left - parentRect.left;
  const y_position = rect.top - parentRect.top;

  console.log(`New position for graph ${index}: x=${x_position}, y=${y_position}`);

  if (!isNaN(x_position) && !isNaN(y_position)) {
      // Mettre à jour les coordonnées dans l'objet graphique
      this.graphs[index].x_position = x_position;
      this.graphs[index].y_position = y_position;

      // Identifier l'ID du graphique pour l'API
      const graphId = this.graphs[index].Code_Python_Id || this.graphs[index].Code_Id;

      if (!graphId) {
          console.error('Graph ID is undefined. Cannot update position.');
          return;
      }

      // Appeler le service pour sauvegarder les nouvelles coordonnées
      this.graphsService.updateGraphPosition(graphId, { x: x_position, y: y_position }).subscribe(
          () => {
              console.log('Graph position updated successfully');
          },
          (error) => {
              console.error('Failed to update graph position:', error);
          }
      );
  } else {
      console.error('Invalid position values:', { x_position, y_position });
  }

  // Réinitialiser l'état du drag-and-drop
  setTimeout(() => {
      this.isDragging = false;
  }, 0);
}








// app-data-analysis.component.ts

getcode(index: any): void {
  if (this.isDragging) {
    return; // If dragging, do nothing
  }

  this.codeGraph = this.graphs[index];
  this.showCodeIsOpen = true;
 console.log("  this.codeGraph",  this.codeGraph)
  // Ensure Datasets is initialized as an array to avoid the iterable error
  this.codeGraph.Datasets = this.codeGraph.Datasets || [];

  const codeGraphExists = this.lotsOfTabs.some(tab => tab.Img_Id === this.codeGraph.Img_Id);

  if (codeGraphExists) {
    const existingIndex = this.lotsOfTabs.findIndex(tab => tab.Img_Id === this.codeGraph.Img_Id);
    console.log("existingIndex",existingIndex)
    this.selectedIndex = existingIndex;
    this.selected.setValue(this.selectedIndex);
  } else {
    this.lotsOfTabs.push(this.codeGraph);
    this.selectedIndex = this.lotsOfTabs.length - 1;
    this.selected.setValue(this.selectedIndex);
  }

  // Fetch the reports associated with the selected graph
  this.graphsService.getReports(this.codeGraph.Code_Id).subscribe(
    (reports: any) => {
      this.codeGraph.Reports = reports; // Assign the reports to the graph

      if (this.showCodeIsOpen) {
        setTimeout(() => {
          if (this.pythonCompilerComponent) {
            // this.pythonCompilerComponent.ngOnInit(); // Initialize the PythonCompilerComponent
            this.waitForFileReady(this.selectedSegments);
          } else {
            console.error("PythonCompilerComponent is not available after opening.");
          }
        }, 0);
      }
    },
    (error: any) => {
      console.error('Error fetching reports:', error);
    }
  );
}

// This method will be called when the file is ready
waitForFileReady(selectedSegments:any): void {
  this.pythonCompilerComponent.fileReady.subscribe((file: File) => {
    // Now execute the logic that needs the file
    console.log('File is ready, proceeding with the logic.');
    this.pythonCompilerComponent.onUniqueValueSelected(this.colomn, this.segment.uniqueValues,this.selectedSegments);
  });
}




























  onDragEndd(event: any): void {
    console.log('Drag End:', event);
  }

  onResizeStartt(event: MouseEvent): void {
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

  toggleSort(panelIndex: number): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
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

  sortValues(values: any[], order: 'asc' | 'desc'): any[] {
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

  onUniqueValueClickedd(column: string, value: any, event: MouseEvent): void {
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
    }
  }
  colomn:any;
  segment:any;
//   onUniqueValueClicked(column: string, value: any, event: MouseEvent): void {
//     const segment = this.selectedSegments.find(seg => seg.column === column);

//     if (segment) {
//       const isCtrlPressed = event.ctrlKey;
//       const isShiftPressed = event.shiftKey;

//       if (!segment.uniqueValues) {
//         segment.uniqueValues = [];
//       }

//       if (isCtrlPressed || isShiftPressed) {
//         if (segment.uniqueValues.includes(value)) {
//           segment.uniqueValues = segment.uniqueValues.filter(v => v !== value);
//         } else {
//           segment.uniqueValues.push(value);
//         }
//       } else {
//         segment.uniqueValues = [value];
//       }

//       console.log(`Segment '${column}' unique values after click:`, segment.uniqueValues);
// this.colomn=column;
// this.segment=segment;


//     }
  // }
  // onSegmentDeselected(column: string): void {
  //   this.selectedSegments = this.selectedSegments.filter(s => s.column !== column);
  // }
  onSegmentDeselected(column: string): void {
    // Trouvez le segment à supprimer
    const segmentToDelete = this.selectedSegments.find(s => s.column === column);
 console.log("segmentToDelete",segmentToDelete)
    if (segmentToDelete && segmentToDelete.id) {  // Vérifiez si un `id` existe pour le segment
      this.graphsService.deleteSelectedSegment(segmentToDelete.id).subscribe({
        next: () => {
          console.log(`Segment with ID ${segmentToDelete.id} deleted successfully.`);
          // Supprimez le segment localement après la suppression côté backend
          this.selectedSegments = this.selectedSegments.filter(s => s.column !== column);
        },
        error: (error) => {
          console.error(`Failed to delete segment with ID ${segmentToDelete.id}:`, error);
        }
      });
    } else {
      console.warn(`Segment to delete not found or missing ID for column: ${column}`);
      // Supprimez localement si aucun ID n'est trouvé
      this.selectedSegments = this.selectedSegments.filter(s => s.column !== column);
    }
  }


  openSegmentsFilterPopup(): void {
    this.popupService.openSegmentsFilter(null);
  }

  openChronologyFilterPopup(file: File | null): void {
    this.popupService.openChronologyFilter(file);
  }
























  noDataMessage: string = '';
  applyFilters(filterParams: FilterParams): void {
    console.log("Starting applyFilters for selected graphs...");

    if (!this.filteredGraphs || this.filteredGraphs.length === 0) {
      console.error('No graphs available to filter.');
      return;
    }

    const fileIds = this.selectedFileId ? [this.selectedFileId] : [];

    this.filteredGraphs.forEach(graph => {
      if (!this.selectedSegments[0]?.selectedFileId || !graph.code) {
        console.error('Missing required parameters for graph:', graph);
        return;
      }

      this.graphService.applyFilters(
        this.selectedSegments[0].selectedFileId,
        graph.code,
        {
          ...filterParams,
          file_ids: fileIds,
        },
        graph.t_graph,
        this.selectedSidebarItem?.id
      ).subscribe(
        response => {
          console.log("Response from applyFilters for graph:", graph, response);

          if (this.selectedSidebarItem) {
            this.loadGraphsForItem(this.selectedSidebarItem.id);
          } else {
            this.loadGraphs();
          }
        },
        error => {
          console.error("Error from applyFilters for graph:", graph, error);
        }
      );
    });
  }


  uniqueValues :any;


onUniqueValueClicked(column: string, value: any, event: MouseEvent): void {
  this.filterGraphsByCriteria();

  const segment = this.selectedSegments.find(seg => seg.column === column);

  if (segment) {
    const isCtrlPressed = event.ctrlKey;
    const isShiftPressed = event.shiftKey;

    if (!segment.uniqueValues) {
      segment.uniqueValues = [];
    }

    if (isCtrlPressed || isShiftPressed) {
      if (segment.uniqueValues.includes(value)) {
        segment.unique_values_selected = segment.uniqueValues.filter(v => v !== value);
        console.log("11111111111111",)
      } else {
        segment.uniqueValues.push(value);
        console.log("2222222222",)
      }
    } else {
      segment.unique_values_selected = [value];
      console.log("3333333333",)


      this.graphsService.updateSelectedSegment(segment.id!, segment).subscribe({
        next: (response) => {
          console.log('Selected segment updated successfully:', response);
        },
        error: (error) => {
          console.error('Error updating segment:', error);
        },
      });
    }

    console.log(`Segment '${column}' unique values after click:`,segment.unique_values_selected);

    this.onUniqueValueSelected(column, segment.unique_values_selected,this.selectedSegments);
  }
}





onUniqueValueSelected(column: string, selectedValues: any[], selectedSegments: any): void {
  console.log("Selected values for column", column, selectedValues);

  if (this.selectedSegments[0].selectedFileId) {
    const filters = selectedSegments.reduce((acc, segment) => {
      if (selectedValues.length > 0) {
        acc[segment.column] = selectedValues;
      }
      return acc;
    }, {} as { [key: string]: any[] });

    const filterParams: FilterParams = {
      file_ids: this.selectedFileId !== null ? [this.selectedFileId] : [],
      column: column,
      filters: filters
    };

    console.log("Filter parameters:", filterParams);

    this.filterGraphsByCriteria().subscribe(() => {
      console.log("Filtered graphs ready, applying filters...");
      this.filteredGraphs.forEach(graph => {
        this.applyFilters(filterParams);
      });
    });
  } else {
    console.error('Missing required parameters.');
    this.noDataMessage = 'Please select a file and enter code to compile.';
  }
}


filteredGraphs: any[] = [];


filterGraphsByCriteria(): Observable<any[]> {
  if (!this.selectedSegments || this.selectedSegments.length === 0) {
    console.error('No segments selected.');
    return of([]); // Return an empty observable if no segments are selected
  }

  const tGraphIds = this.graphs.map(graph => graph.Img_Id); // Retrieve t_graph IDs
  const csvDataId = this.selectedSegments[0]?.selectedFileId; // ID of csv_data

  if (!csvDataId) {
    console.error('No selectedFileId available in selectedSegments.');
    return of([]); // Return an empty observable if no selectedFileId is available
  }

  return this.GraphService.getGraphsByCriteria(tGraphIds, csvDataId).pipe(
    tap(filteredGraphs => {
      this.filteredGraphs = filteredGraphs;
      console.log('Filtered Graphs (Full Array):', this.filteredGraphs);

      if (this.filteredGraphs.length > 0) {
        console.log('First Graph:', this.filteredGraphs[0]);
      } else {
        console.warn('No graphs available to display.');
      }
    })
  );
}














// isScrolling = false; // Si l'utilisateur défile le papier
// paperHeight = 100; // Hauteur initiale du papier
// maxPaperHeight = 600; // Hauteur maximale
// minPaperHeight = 100; // Hauteur minimale
// rollRotation = 0; // Rotation du rouleau

// get rollTransform() {
//   return `rotate(${this.rollRotation}deg)`;
// }

// startScrolling(event: MouseEvent) {
//   this.isScrolling = true;
// }

// onScroll(event: MouseEvent) {
//   if (this.isScrolling) {
//     const movement = event.movementY; // Mouvement vertical de la souris

//     // Ajuste la hauteur du papier
//     const newHeight = Math.min(
//       Math.max(this.paperHeight + movement, this.minPaperHeight),
//       this.maxPaperHeight
//     );

//     // Calcule la rotation du rouleau en fonction de la hauteur
//     const rotationChange = (newHeight - this.paperHeight) * 0.5;
//     this.rollRotation += rotationChange;

//     this.paperHeight = newHeight;
//   }
// }

// stopScrolling() {
//   this.isScrolling = false;
// }



// organs = [
//   { name: 'Tube Digestif', src: 'assets/tube-digestif.png' },
//   { name: 'Oeil', src: 'assets/bola-2026441_1280.png' },
//   { name: 'Cerveau', src: 'assets/brain-145434_1280.png' },
//   { name: 'Rein', src: 'assets/kidney-159117_1280.png' },
//   { name: 'Squelette', src: 'assets/skeleton-30160_1280.png' },
//   { name: 'Main', src: 'assets/hand-41386_1280.png' },
//   { name: 'Poumons', src: 'assets/lungs-6694030_1280.png' },
// ];
// activeIndex = 0;

// nextImage() {
//   this.activeIndex = (this.activeIndex + 1) % this.organs.length;
// }

// prevImage() {
//   this.activeIndex =
//     (this.activeIndex - 1 + this.organs.length) % this.organs.length;
// }


}









// applyFilters(filterParams: FilterParams): void {
//   if (!this.selectedFile || !this.code) {
//       console.error('No file selected or code provided');
//       this.noDataMessage = 'Please select a file and enter code to compile.';
//       return;
//   }

//   const fileIds = this.selectedFileId ? [this.selectedFileId] : [];
//  console.log("this.t_graph_id",this.t_graph_id)
//   this.graphService.applyFilters(this.selectedFile, this.code,{
//       ...filterParams,
//       file_ids: fileIds,
//   },this.t_graph_id,this.sideBarItemid).subscribe(
//       response => {
//         console.log("response*****",response)
//           if (response && response.graph) {
//             console.log('**************')
//               // this.graphs = response.graphs.map((graph: any) =>
//               //     'data:image/png;base64,' + graph.image
//               // );





//               const graphBase64 = 'data:image/png;base64,' + response.graph;
//               this.graphs=graphBase64;
//               this.showGraphSection = true;
//               console.log('Graph data:', response.graph);

//               // Si le résultat est correct, émettre un événement pour notifier le succès de la compilation
//               this.onCompilationSuccess.emit(this.codeGraph.sidebar_item); // ou un autre ID si nécessaire
//               console.log('Graph data:',  this.codeGraph);






//               this.showGraphSection = true;
//               this.noDataMessage = '';
//               console.log("this.graphs",this.graphs)
//           } else {
//               this.graphs =null;
//               this.showGraphSection = false;
//               this.noDataMessage = 'No graph data available for the selected criteria.';
//           }
//       },
//       (error: HttpErrorResponse) => {
//           console.error('Error applying filters:', error);
//           this.graphs = null;
//           this.showGraphSection = false;
//           this.noDataMessage = 'An error occurred while fetching graph data.';
//       }
//   );
// }

// onUniqueValueClicked(column: string, value: any, event: MouseEvent): void {
// const segment = this.selectedSegments.find(seg => seg.column === column);

// if (segment) {
//   const isCtrlPressed = event.ctrlKey;
//   const isShiftPressed = event.shiftKey;

//   if (!segment.uniqueValues) {
//     segment.uniqueValues = [];
//   }

//   if (isCtrlPressed || isShiftPressed) {
//     if (segment.uniqueValues.includes(value)) {
//       segment.uniqueValues = segment.uniqueValues.filter(v => v !== value);
//     } else {
//       segment.uniqueValues.push(value);
//     }
//   } else {
//     segment.uniqueValues = [value];
//   }

//   console.log(`Segment '${column}' unique values after click:`, segment.uniqueValues);

//   this.onUniqueValueSelected(column, segment.uniqueValues,this.selectedSegments);
// }
// }

// selected=false;
// onUniqueValueSelected(column: string, selectedValues: any[],selectedSegments:any): void {
// this.selected = true;
// console.log("selecteedfile", this.selectedFile);
// console.log("Selected values for column", column, selectedValues);

// // Proceed only if both the file and code are available
// if (this.selectedFile && this.code) {
//   const filters = selectedSegments.reduce((acc, segment) => {
//     if (segment.uniqueValues.length > 0) {
//       acc[segment.column] = segment.uniqueValues;
//     }
//     return acc;
//   }, {} as { [key: string]: any[] });

//   const filterParams: FilterParams = {
//     file_ids: this.selectedFileId !== null ? [this.selectedFileId] : [],
//     column: column,
//     filters: filters
//   };
//   console.log("filterParams",filterParams)
//   // Apply the filters using the selected file and code
//   this.applyFilters(filterParams);
// } else {
//   console.error('Missing required parameters.');
//   this.graphs = null;
//   this.showGraphSection = false;
//   this.noDataMessage = 'Please select a file and enter code to compile.';
// }
// }
