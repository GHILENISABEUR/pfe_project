import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { GraphsService } from 'src/app/services/Graphs/graphs.service';

@Component({
  selector: 'app-causes',
  templateUrl: './causes.component.html',
  styleUrls: ['./causes.component.css']
})
export class CausesComponent implements OnInit {
  constructor(private graphsService: GraphsService, private router: Router) { }

  @Input() codeGraph: any = {};
  @Output() openGraphTab = new EventEmitter<any>();
  @Output() doubleClickGraph = new EventEmitter<any>();

  causes: any[] = [];
  availableGraphs: any[] = []; // Use fetched graphs from the database
  showAvailableGraphs: boolean = false;
  selectedGraphs: any[] = []; // List of selected graphs
  codesToChoose: any[] = [];
  selectResponseIsOpen: boolean = false;
  codeToAddId: any = 0;
  canDelete: boolean = false;

  ngOnInit(): void {
    this.causes = [];
    this.selectedGraphs = [];
    this.codeGraph.Causes = this.codeGraph.Causes || [];
    this.getData();
    this.loadAvailableGraphs(); // Fetch the graphs from the database
  }
  

  loadAvailableGraphs() {
    this.graphsService.fetchGraphs().subscribe(
      (data: any[]) => {
        this.availableGraphs = data.map(graph => ({
          ...graph,
          Code_Id: graph.Code_Python || graph.Code_Id, // Make sure Code_Id is properly set
          File_Name: graph.File_Name || graph.Img_Name || 'Unnamed Graph'
        }));
        
        console.log('Available Graphs:', this.availableGraphs);
      },
      error => {
        console.error('Error fetching available graphs:', error);
      }
    );
    
}


openAvailableGraphs() {
  this.showAvailableGraphs = true;
  // Ensure codeGraph.Code_Python_Id is being passed correctly as part of an object
  const payload = { code_id: this.codeGraph.Code_Python_Id };

  this.graphsService.getCausesOrConsequences(payload).subscribe(
    (response: any) => {
      this.causes = response.causes || [];
      console.log('Fetched causes:', this.causes);
    },
    error => {
      console.error('Error fetching causes and consequences:', error);
    }
  );
}

  closeAvailableGraphs() {
    this.showAvailableGraphs = false; // Hide the dialog
  }

  selectGraph(graph: any) {
    if (!graph.Code_Id) {
        // Ensure the Code_Id is derived correctly from Code_Python
        graph.Code_Id = graph.Code_Python;
    }

    this.selectedGraphs.push(graph);
    this.causes.push(graph);
    this.codeGraph.Causes.push(graph.Code_Id);

    this.saveCauses();
}




  isSelected(graph: any): boolean {
    // Optionally, update or remove this method if it's not needed anymore
    return this.selectedGraphs.some(g => g.Code_Id === graph.Code_Id);
  }

  addSelectedGraphs() {
    console.log('Adding selected graphs'); // Debugging statement
    this.selectedGraphs.forEach(graph => {
      this.causes.push(graph); // Add the selected graph to causes
      this.codeGraph.Causes.push(graph.Code_Id); // Update the codeGraph with the new cause
    });
    this.selectedGraphs = []; // Clear the selected graphs list
    this.closeAvailableGraphs(); // Close the dialog
  
    // Persist the changes by calling saveCauses
    this.saveCauses();
  }
  
  saveCauses() {
    const causeIds = this.causes.map(c => c.Code_Id); // Extract IDs of the causes
    console.log('Saving causes for Code_Python_Id:', this.codeGraph.Code_Python_Id);
    console.log('Cause IDs being saved:', causeIds);

    this.graphsService.saveCauses(this.codeGraph.Code_Python_Id, causeIds).subscribe(
        response => {
            console.log('Causes saved:', response);
        },
        error => {
            console.error('Error saving causes:', error);
        }
    );
}


  

openGraphTabAndNavigate(graph: any) {
  if (!graph.Code_Id && !graph.Code_Python_Id) {
    console.error('Graph has an undefined Code_Id and Code_Python_Id. Cannot open tab.');
    return;
  }

  const idToUse = graph.Code_Id || graph.Code_Python_Id;
  graph.Code_Python_Id = idToUse;

  this.openGraphTab.emit(graph); // Emit the selected graph to the parent component
  this.doubleClickGraph.emit(graph); // Handle double-click to navigate or open the tab
}

  

  openDelete() {
    this.canDelete = !this.canDelete;
  }

  deleteCause(causeIndex: number): void {
    const causeId = this.causes[causeIndex].Code_Id;
  
    this.graphsService.deleteCauseFromCode(this.codeGraph.Code_Python_Id, causeId).subscribe(
      () => {
        this.causes.splice(causeIndex, 1); // Remove from the causes array
        this.codeGraph.Causes.splice(causeIndex, 1); // Remove from the codeGraph's Causes
      },
      error => {
        console.error('Error deleting cause:', error);
      }
    );
  }
  

  deleteSelectedGraph(index: number) {
    this.selectedGraphs.splice(index, 1);
  }

  getNewResponseId(event: any) {
    if (event != 0) {
      this.graphsService.getCodes(event).subscribe((codes: any) => {
        this.codesToChoose = codes;
      });
    } else {
      this.codesToChoose = [];
    }
  }

  createCause() {
    if (this.codeToAddId != 0) {
      this.graphsService.addCauseToCode(this.codeGraph.Code_Id, this.codeToAddId).subscribe(() => {
        const code = this.codesToChoose.find((code: any) => code.Code_Id == this.codeToAddId);
        this.causes.push(code);
        this.codeGraph.Causes.push(this.codeToAddId);
        this.selectResponseIsOpen = false;
        this.codeToAddId = 0;
        this.codesToChoose = [];
      });
    }
  }

  getData() {
    const payload = { code_id: this.codeGraph.Code_Python_Id };
  
    this.graphsService.getCausesOrConsequences(payload).subscribe(
      (response: any) => {
        this.causes = response.causes || []; // Correctly handle the causes
        console.log('Fetched causes:', this.causes);
      },
      error => {
        console.error('Error fetching causes or consequences:', error);
      }
    );
  }
  

  




  openGraph(graph: any) {
    this.openGraphTab.emit(graph);
  }
}
