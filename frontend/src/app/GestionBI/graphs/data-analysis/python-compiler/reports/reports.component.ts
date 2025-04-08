import { Component, OnInit, Input } from '@angular/core';
import { FormulaireService } from 'src/app/services/formulaire/formulaire.service';
import { GraphsService } from '../../../../../services/Graphs/graphs.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  constructor(
    private formulaireService: FormulaireService,
    private graphsService: GraphsService
  ) { }

  @Input() codeGraph: any = {};

  readonly nullAction: any = {
    Action_Id: null,
    Action_Name: "",
    Date_Submission_Estimated: "",
    Date_Submission_Real: "",
    Date_Validation_Estimated: "",
    Date_Validation_Real: "",
    Description: "",
    Documents_Submission: [],
    Documents_Validation: [],
    Responsible_Realisation: null,  // ID for Realisation
    Responsible_Realisation_Name: "",  // Name for Realisation
    Responsible_Validation: null,  // ID for Validation
    Responsible_Validation_Name: "",  // Name for Validation
    selected: false
};


  reports: any[] = [];
  decisions: any[] = [];
  actions: any[] = [];
  users: any[] = [];
  actionsMap: { [key: number]: any[] } = {};  // Map of decision IDs to actions


  reportSelected: any = null;
  decisionSelected: any = null;
  actionSelected: any = { ...this.nullAction };

  titleSelected: any = '';
  descriptionSelected: any = '';

  newFormIsOpen: boolean = false;
  messageOfAdding: any = '';
  messages: any = {
    noAdd: "",
    addAction: "new Action",
    addDecision: "new Decision",
    addReport: "new Report"
  };

  documentPopupIsOpen: boolean = false;
  validationDocumentsIsOpen: boolean = false;
  responsibleNameForDocuments: string = '';  // Add this property


  ngOnInit(): void {
    this.getData();
    if (this.codeGraph && this.codeGraph.Reports) {
      this.reports = this.codeGraph.Reports; // Assign reports passed from the parent component
    } else {
      this.reports = []; // Initialize with an empty array if no reports are found
    }
  }
  ngOnChanges(): void {
    // Triggered whenever the input properties change
    this.refreshData();
  }
  refreshData(): void {
    if (this.codeGraph && this.codeGraph.Reports) {
      this.reports = this.codeGraph.Reports; // Assign reports passed from the parent component
    } else {
      this.reports = []; // Initialize with an empty array if no reports are found
    }
  }
  editModeIsOpen() {
    return (this.reportSelected !== null) || this.newFormIsOpen;
  }

  getResponsibleRealisationName(id: number): void {
    if (!id) return;
    this.graphsService.getResponsibleRealisationById(id).subscribe({
        next: (responsible: any) => {
            this.actionSelected.Responsible_Realisation = responsible.id; // Store the ID
            this.actionSelected.Responsible_Realisation_Name = responsible.user_name; // Store the name for display
        },
        error: (err) => {
            console.error('Error fetching Responsible Realisation name:', err);
            this.actionSelected.Responsible_Realisation_Name = 'Unknown';
        }
    });
}

getResponsibleValidationName(id: number): void {
    if (!id) return;
    this.graphsService.getResponsibleValidationById(id).subscribe({
        next: (responsible: any) => {
            this.actionSelected.Responsible_Validation = responsible.id; // Store the ID
            this.actionSelected.Responsible_Validation_Name = responsible.user_name; // Store the name for display
        },
        error: (err) => {
            console.error('Error fetching Responsible Validation name:', err);
            this.actionSelected.Responsible_Validation_Name = 'Unknown';
        }
    });
}
selectReport(index: any) {
  if (typeof index !== 'number' || !this.reports[index]) {
    console.error('Invalid report index:', index);
    return;
  }

  this.reports.forEach((report) => report.selected = false);
  this.reports[index].selected = !this.reports[index].selected;

  if (this.reports[index].selected) {
    this.newFormIsOpen = false;
    this.reportSelected = this.reports[index];
    this.titleSelected = this.reportSelected.report_Name;
    this.descriptionSelected = this.reportSelected.Content;

    this.graphsService.getDecisions(this.reportSelected.Decisions).subscribe({
      next: (decisions: any) => {
        decisions.forEach((decision: any) => decision.selected = false);
        this.messageOfAdding = this.messages.noAdd;
        this.decisions = decisions;
        this.actions = [];
        this.decisionSelected = null;
        this.actionSelected = { ...this.nullAction };
      },
      error: (err) => {
        console.error('Error fetching decisions:', err);
      }
    });
  } else {
    this.reportSelected = null;
    this.decisions = [];
    this.actions = [];
    this.decisionSelected = null;
    this.actionSelected = { ...this.nullAction };
  }
}


  selectDecision(index: any) {
    this.decisions.forEach((decision, i) => {
      decision.selected = i === index ? !decision.selected : false;
    });

    if (this.decisions[index].selected) {
      this.decisionSelected = this.decisions[index];

      // Update titleSelected and descriptionSelected with the decision's details
      this.titleSelected = this.decisionSelected.Decision_Name;
      this.descriptionSelected = this.decisionSelected.Description;

      if (this.decisionSelected.Actions && this.decisionSelected.Actions.length > 0) {
        // Clear previous actions
        this.actions = [];

        // Fetch the action details by ID
        this.decisionSelected.Actions.forEach((actionId: number) => {
          this.graphsService.getActionById(actionId).subscribe({
            next: (action) => {
              this.actions.push(action); // Push the action with real name into the actions array
            },
            error: (err) => {
              console.error('Error fetching action:', err);
            }
          });
        });
      } else {
        this.actions = [];
      }

      this.actionSelected = { ...this.nullAction };
    } else {
      this.decisionSelected = null;
      this.actions = [];

      // Clear the inputs if no decision is selected
      this.titleSelected = this.reportSelected?.report_Name || '';
      this.descriptionSelected = this.reportSelected?.Content || '';
      this.actionSelected = { ...this.nullAction };
    }
  }













  openDecisionForm() {
    this.newFormIsOpen = true;
    this.messageOfAdding = this.messages.addDecision;
    this.decisionSelected = null;
    this.actionSelected = { ...this.nullAction };
    this.actions = [];
    this.decisions.forEach((decision) => decision.selected = false);
    this.titleSelected = '';
    this.descriptionSelected = '';
  }

  openDocumentPopup(type: string): void {
    this.validationDocumentsIsOpen = type === 'validation';
    this.documentPopupIsOpen = true;

    // Set the responsibleName to be passed to the DocumentsComponent
    this.responsibleNameForDocuments = this.validationDocumentsIsOpen
        ? this.actionSelected.Responsible_Validation
        : this.actionSelected.Responsible_Realisation;

    this.documentPopupIsOpen = true;
  }



  validateDocument(): void {
    this.documentPopupIsOpen = false; // Close the popup after validation
  }


  deleteCurrent() {
    if (!this.actionSelected.Action_Id && !this.decisionSelected && this.reportSelected) {
      this.deleteReport();
    } else if (!this.actionSelected.Action_Id && this.decisionSelected && this.reportSelected) {
      this.deleteDecision();
    } else if (this.actionSelected.Action_Id && this.decisionSelected && this.reportSelected) {
      this.deleteAction();
    }
  }

  deleteAction() {
    this.graphsService.deleteAction(this.actionSelected.Action_Id).subscribe({
      next: () => {
        const index = this.actions.findIndex((e: any) => e.Action_Id === this.actionSelected.Action_Id);
        this.actions.splice(index, 1);
        this.decisionSelected.Actions = this.decisionSelected.Actions.filter((e: any) => e !== this.actionSelected.Action_Id);
        this.newFormIsOpen = false;
        this.titleSelected = this.decisionSelected.Decision_Name;
        this.descriptionSelected = this.decisionSelected.Description;
        this.messageOfAdding = this.messages.noAdd;
        this.actionSelected = { ...this.nullAction };
      },
      error: (err) => {
        console.error('Error deleting action:', err);
      }
    });
  }

  deleteReport() {
    this.graphsService.deleteReport(this.reportSelected.report_Id).subscribe({
      next: () => {
        const index = this.reports.findIndex((e: any) => e.report_Id === this.reportSelected.report_Id);
        this.reports.splice(index, 1);
        this.newFormIsOpen = false;
        this.reportSelected = null;
        this.titleSelected = null;
        this.descriptionSelected = null;
        this.messageOfAdding = this.messages.noAdd;
        this.decisions = [];
        this.actions = [];
        this.decisionSelected = null;
        this.actionSelected = { ...this.nullAction };
      },
      error: (err) => {
        console.error('Error deleting report:', err);
      }
    });
  }

  deleteDecision() {
    this.graphsService.deleteDecision(this.decisionSelected.Decision_Id).subscribe({
      next: () => {
        const index = this.decisions.findIndex((e: any) => e.Decision_Id === this.decisionSelected.Decision_Id);
        this.decisions.splice(index, 1);
        this.reportSelected.Decisions = this.reportSelected.Decisions.filter((e: any) => e !== this.decisionSelected.Decision_Id);
        this.newFormIsOpen = false;
        this.titleSelected = this.reportSelected.report_Name;
        this.descriptionSelected = this.reportSelected.Content;
        this.messageOfAdding = this.messages.noAdd;
        this.actions = [];
        this.decisionSelected = null;
        this.actionSelected = { ...this.nullAction };
      },
      error: (err) => {
        console.error('Error deleting decision:', err);
      }
    });
  }

  openReportForm() {
    this.newFormIsOpen = true;
    this.messageOfAdding = this.messages.addReport;
    this.reportSelected = null;
    this.decisionSelected = null;
    this.actionSelected = { ...this.nullAction };
    this.decisions = [];
    this.actions = [];
    this.reports.forEach((report) => report.selected = false);
    this.titleSelected = '';
    this.descriptionSelected = '';
  }

  updateReportContent(name: any) {
    if (!this.newFormIsOpen && this.reportSelected) {
      const val = name === 'Name' ? { report_Name: this.titleSelected } : { Content: this.descriptionSelected };
      this.graphsService.updateReport(this.reportSelected.report_Id, val).subscribe({
        next: () => {
          const index = this.reports.findIndex((e: any) => e.report_Id === this.reportSelected.report_Id);
          this.reports[index].report_Name = this.titleSelected;
          this.reports[index].Content = this.descriptionSelected;
        },
        error: (err) => {
          console.error('Error updating report:', err);
        }
      });
    }
  }

  updateDecisionContent(name: any) {
    if (!this.newFormIsOpen && this.decisionSelected) {
      const val = name === 'Name' ? { Decision_Name: this.titleSelected } : { Description: this.descriptionSelected };
      this.graphsService.updateDecision(this.decisionSelected.Decision_Id, val).subscribe({
        next: () => {
          const index = this.decisions.findIndex((e: any) => e.Decision_Id === this.decisionSelected.Decision_Id);
          this.decisions[index].Decision_Name = this.titleSelected;
          this.decisions[index].Description = this.descriptionSelected;
        },
        error: (err) => {
          console.error('Error updating decision:', err);
        }
      });
    }
  }

  updateContent(key: any) {
    if (this.actionSelected.Action_Id == null && this.decisionSelected == null && this.reportSelected !== null) {
      this.updateReportContent(key);
    } else if (this.decisionSelected !== null && this.actionSelected.Action_Id == null) {
      this.updateDecisionContent(key);
    } else if (this.decisionSelected !== null && this.actionSelected.Action_Id !== null) {
      this.updateActionContent(key);
    }
  }

  getData() {
    if (this.codeGraph && this.codeGraph.Reports) {
      this.graphsService.getReports(this.codeGraph.Reports).subscribe({
        next: (reports: any) => {
          this.reports = reports.map(report => ({ ...report, selected: false })); // Ensure each report is an object with a selected property
        },
        error: (err) => {
          console.error('Error fetching reports:', err);
        }
      });
    } else {
      console.error('No reports available to fetch.');
    }
  }


  createReport() {
    if (this.titleSelected) {
        const newReport = {
            report_Name: this.titleSelected,
            Content: this.descriptionSelected || '',  // Allow empty description
            Decisions: []
        };

        if (!this.codeGraph || !this.codeGraph.Code_Id) {
            console.error('Code_Id is undefined, cannot create report');
            alert('An error occurred: Unable to create report because Code_Id is undefined.');
            return;
        }

        this.graphsService.addNewReport(this.codeGraph.Code_Id, newReport).subscribe({
            next: (report: any) => {
                report.selected = true;
                this.newFormIsOpen = false;
                this.messageOfAdding = this.messages.noAdd;
                this.reportSelected = report;
                this.titleSelected = report.report_Name;
                this.descriptionSelected = report.Content;

                // Ensure `Reports` is initialized before pushing
                if (!this.codeGraph.Reports) {
                    this.codeGraph.Reports = [];
                }

                // Deselect other reports and add the new report
                this.reports.forEach((r: any) => r.selected = false);
                this.reports.push(report);
                this.codeGraph.Reports.push(report.report_Id);
            },
            error: (err) => {
                console.error('Error creating report:', err);
            }
        });
    } else {
        alert('Title is required to create a report');
    }
}







createNewDecision() {
  if (this.titleSelected) {
      const newDecision = {
          Decision_Name: this.titleSelected,
          Description: this.descriptionSelected,
          Actions: []
      };

      if (!this.reportSelected || !this.reportSelected.report_Id) {
          console.error('Report_Id is undefined, cannot create decision');
          alert('An error occurred: Unable to create decision because Report_Id is undefined.');
          return;
      }

      this.graphsService.addNewDecision(this.reportSelected.report_Id, newDecision).subscribe({
          next: (decision: any) => {
              decision.selected = true;
              this.newFormIsOpen = false;
              this.messageOfAdding = this.messages.noAdd;
              this.decisionSelected = decision;
              this.actions = [];

              // Deselect other decisions and add the new decision
              this.decisions.forEach((d: any) => d.selected = false);
              this.decisions.push(decision);
              this.reportSelected.Decisions.push(decision.Decision_Id);
          },
          error: (err) => {
              console.error('Error creating decision:', err);
          }
      });
  } else {
      alert('Title is required to create a decision');
  }
}


  createNewInstance() {
    if (!this.reportSelected && !this.decisionSelected && !this.actionSelected.Action_Id) {
      this.createReport();
    } else if (this.reportSelected && !this.decisionSelected && !this.actionSelected.Action_Id) {
      this.createNewDecision();
    } else if (this.reportSelected && this.decisionSelected && !this.actionSelected.Action_Id) {
      this.createAction();
    }
  }
  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return [year, month, day].join('-');
}
createAction() {
  if (this.titleSelected) {
      const newAction = {
          Action_Name: this.titleSelected,
          Description: this.descriptionSelected,
           Responsible_Realisation: this.actionSelected.Responsible_Realisation || null,
    Responsible_Validation: this.actionSelected.Responsible_Validation || null,
          Date_Submission_Real: this.formatDate(this.actionSelected.Date_Submission_Real) || null,
          Date_Submission_Estimated: this.formatDate(this.actionSelected.Date_Submission_Estimated) || null,
          Date_Validation_Real: this.formatDate(this.actionSelected.Date_Validation_Real) || null,
          Date_Validation_Estimated: this.formatDate(this.actionSelected.Date_Validation_Estimated) || null,
          Documents_Submission: this.actionSelected.Documents_Submission || [],
          Documents_Validation: this.actionSelected.Documents_Validation || [],
          Decision_Id: this.decisionSelected?.Decision_Id // Ensure the Decision_Id is passed
      };

      /*if (!newAction.Responsible_Realisation || !newAction.Responsible_Validation) {
          alert('Responsible fields cannot be null');
          return;
      }*/

      this.graphsService.addNewAction(this.decisionSelected.Decision_Id, newAction).subscribe({
          next: (action: any) => {
              if (action && action.Action_Id) {
                  this.actions.push(action);
                  this.actionSelected = action; // Select the newly created action
                  this.newFormIsOpen = false; // Close the form
                  this.selectAction(this.actions.length - 1); // Ensure the action is selected
              }
          },
          error: (err) => {
              console.error('Error creating action:', err);
          }
      });
  } else {
      alert('Title is required to create an action');
  }
}










  fetchActionsForDecision() {
    this.graphsService.getActions(this.decisionSelected.Actions).subscribe({
      next: (actions: any) => {
        this.actions = actions;
      },
      error: (err) => {
        console.error('Error fetching actions:', err);
      }
    });
  }

  selectAction(index: any) {
    this.actions.forEach((action, i) => {
        action.selected = i === index ? !action.selected : false;
    });

    if (this.actions[index].selected) {
        this.actionSelected = this.actions[index];
        this.titleSelected = this.actionSelected.Action_Name || '';
        this.descriptionSelected = this.actionSelected.Description || '';

        // Fetch the names using IDs and store them separately for display
        if (this.actionSelected.Responsible_Realisation) {
            this.getResponsibleRealisationName(this.actionSelected.Responsible_Realisation);
        }
        if (this.actionSelected.Responsible_Validation) {
            this.getResponsibleValidationName(this.actionSelected.Responsible_Validation);
        }
    } else {
        this.actionSelected = { ...this.nullAction };
    }
}




changeValueActionParm(key: string) {
  if (this.actionSelected.Action_Id) {
      const update: any = {};
      update[key] = this.actionSelected[key];

      this.graphsService.updateAction(this.actionSelected.Action_Id, update).subscribe({
          next: () => {
              console.log(`${key} updated successfully`);
          },
          error: (err) => {
              console.error(`Error updating ${key}:`, err);
          }
      });
  }
}

changeResponsiblePerson(role: string, event: Event) {
  const inputElement = event.target as HTMLInputElement;
  const name = inputElement.value.trim();

  if (!this.actionSelected.Action_Id) {
      return; // Exit if actionSelected is null or does not have an Action_Id
  }

  if (role === 'Realisation') {
      this.graphsService.createOrUpdateResponsibleRealisation(this.actionSelected.Action_Id, name).subscribe({
          next: (res: any) => {
              this.actionSelected.Responsible_Realisation = res.id; // Store the ID
              this.actionSelected.Responsible_Realisation_Name = res.user_name; // Store the name for display
              this.updateActionWithResponsible('Responsible_Realisation', res.id);
          },
          error: (err: any) => {
              console.error('Error updating Responsible Realisation:', err);
          }
      });
  } else if (role === 'Validation') {
      this.graphsService.createOrUpdateResponsibleValidation(this.actionSelected.Action_Id, name).subscribe({
          next: (res: any) => {
              this.actionSelected.Responsible_Validation = res.id; // Store the ID
              this.actionSelected.Responsible_Validation_Name = res.user_name; // Store the name for display
              this.updateActionWithResponsible('Responsible_Validation', res.id);
          },
          error: (err: any) => {
              console.error('Error updating Responsible Validation:', err);
          }
      });
  }
}



updateActionWithResponsible(key: string, id: number) {
  if (!this.actionSelected?.Action_Id) {
    return; // Exit if actionSelected is null or does not have an Action_Id
  }

  const update: any = {};
  update[key] = id;

  this.graphsService.updateAction(this.actionSelected.Action_Id, update).subscribe({
    next: () => {
      console.log(`${key} updated successfully with ID ${id}`);
    },
    error: (err: any) => {
      console.error(`Error updating ${key} with ID ${id}:`, err);
    }
  });
}





updateActionContent(key: string) {
  if (this.actionSelected.Action_Id) {
      const update: any = {};

      // Update the appropriate fields based on the key
      if (key === 'Responsible_Realisation') {
          update[key] = this.actionSelected.Responsible_Realisation_Name;
      } else if (key === 'Responsible_Validation') {
          update[key] = this.actionSelected.Responsible_Validation_Name;
      } else {
          update[key] = this.actionSelected[key];
      }

      this.graphsService.updateAction(this.actionSelected.Action_Id, update).subscribe({
          next: () => {
              console.log(`${key} updated successfully`);
          },
          error: (err) => {
              console.error(`Error updating ${key}:`, err);
          }
      });
  }
}


  openActionForm() {
    this.newFormIsOpen = true;
    this.messageOfAdding = this.messages.addAction;
    this.actionSelected = { ...this.nullAction };  // Reset the selected action
    this.actions.forEach((action) => action.selected = false);
    this.titleSelected = '';
    this.descriptionSelected = '';
  }

}
