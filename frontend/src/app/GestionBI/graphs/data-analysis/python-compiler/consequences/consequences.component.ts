import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GraphsService } from 'src/app/services/Graphs/graphs.service';

@Component({
  selector: 'app-consequences',
  templateUrl: './consequences.component.html',
  styleUrls: ['./consequences.component.css']
})
export class ConsequencesComponent implements OnInit {
  constructor(private graphsService: GraphsService) { }

  @Input() codeGraph: any = {};
  @Output() openGraphTab = new EventEmitter<any>();
  @Output() doubleClickGraph = new EventEmitter<any>();

  consequences: any[] = [];
  availableGraphs: any[] = [];
  showAvailableGraphs: boolean = false;
  selectedGraphs: any[] = [];
  canDelete: boolean = false;

  ngOnInit(): void {
    this.consequences = [];
    this.selectedGraphs = [];
    this.codeGraph.Consequences = this.codeGraph.Consequences || [];
    this.getData();
    this.loadAvailableGraphs(); 
  }

  loadAvailableGraphs() {
    this.graphsService.fetchGraphs().subscribe(
      (data: any[]) => {
        this.availableGraphs = data.map(graph => ({
          ...graph,
          Code_Id: graph.Code_Python || graph.Code_Id,
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
  }

  closeAvailableGraphs() {
    this.showAvailableGraphs = false;
  }

  selectGraph(graph: any) {
    if (!graph.Code_Id) {
      graph.Code_Id = graph.Code_Python;
    }

    this.selectedGraphs.push(graph);
    this.consequences.push(graph);
    this.codeGraph.Consequences.push(graph.Code_Id);

    this.saveConsequences();
  }

  isSelected(graph: any): boolean {
    return this.selectedGraphs.some(g => g.Code_Id === graph.Code_Id);
  }

  addSelectedGraphs() {
    console.log('Adding selected graphs'); 
    this.selectedGraphs.forEach(graph => {
      this.consequences.push(graph);
      this.codeGraph.Consequences.push(graph.Code_Id);
    });
    this.selectedGraphs = [];
    this.closeAvailableGraphs();
    this.saveConsequences();
  }

  saveConsequences() {
    const consequenceIds = this.consequences.map(c => c.Code_Id); 
    console.log('Saving consequences for Code_Python_Id:', this.codeGraph.Code_Python_Id);
    console.log('Consequence IDs being saved:', consequenceIds);

    this.graphsService.saveConsequences(this.codeGraph.Code_Python_Id, consequenceIds).subscribe(
        response => {
            console.log('Consequences saved:', response);
        },
        error => {
            console.error('Error saving consequences:', error);
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

    this.openGraphTab.emit(graph);
    this.doubleClickGraph.emit(graph);
  }

  openDelete() {
    this.canDelete = !this.canDelete;
  }

  deleteConsequence(consequenceIndex: number): void {
    const consequenceId = this.consequences[consequenceIndex].Code_Id;

    this.graphsService.deleteConsequenceFromCode(this.codeGraph.Code_Python_Id, consequenceId).subscribe(
      () => {
        this.consequences.splice(consequenceIndex, 1); 
        this.codeGraph.Consequences.splice(consequenceIndex, 1); 
      },
      error => {
        console.error('Error deleting consequence:', error);
      }
    );
  }

  deleteSelectedGraph(index: number) {
    this.selectedGraphs.splice(index, 1);
  }

  getData() {
    const payload = { code_id: this.codeGraph.Code_Python_Id }; 
    console.log('Fetching causes and consequences for Code_Python_Id:', this.codeGraph.Code_Python_Id);
  
    this.graphsService.getCausesOrConsequences(payload).subscribe(
      (response: any) => {
        // Assuming the backend now returns an object with 'causes' and 'consequences' keys
        this.consequences = response.consequences || [];
        console.log('Fetched consequences:', this.consequences);
      },
      error => {
        console.error('Error fetching causes and consequences:', error);
      }
    );
  }
  

  openGraph(graph: any) {
    this.openGraphTab.emit(graph);
  }
}
