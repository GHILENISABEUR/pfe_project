
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { Sidebar, SidebarItem } from 'src/app/models/sidebar-item-graph.model';

@Injectable({
  providedIn: 'root'
})
export class GraphsService {

  static deleteUpdate(id: any) {
    throw new Error('Method not implemented.');
  }

  readonly APIUrl = 'http://127.0.0.1:8000/GestionBI';
  readonly PhotoUrl = 'http://127.0.0.1:8000/media/';
  constructor(private http: HttpClient) {}



  updateGraphSize(graphId: number, sizeData: { width: number, height: number }): Observable<any> {
    return this.http.put(`http://127.0.0.1:8000/GestionBI/update_graph_size/${graphId}/`, sizeData);
}




  saveCauses(codeId: number, causeIds: number[]): Observable<any> {
    console.log('Saving causes for Code_Python_Id:', codeId);
    console.log('Cause IDs being saved:', causeIds);  // Log the IDs of the causes being saved
    return this.http.post(`${this.APIUrl}/save_causes/${codeId}/`, { causes: causeIds });
}



saveConsequences(codeId: number, consequenceIds: number[]): Observable<any> {
  return this.http.post(`${this.APIUrl}/save_consequences/${codeId}/`, { consequences: consequenceIds });
}
  compileCode(val:any,id:any){
    return this.http.post(this.APIUrl+'/compile_code/'+id,val)
  }
  saveCode(val:any){
    return this.http.post(this.APIUrl+'/save_code/',val)
  }
  getCodes(id:any){
    return this.http.get(this.APIUrl+'/crud_code/'+id)
  }
  correctCode(id:any,val:any){
    return this.http.post(this.APIUrl+'/correct_code/'+id,val)
  }
  deleteCode(id:any){
    return this.http.delete(this.APIUrl+'/crud_code/'+id)

  }
  addNewDataset(code_id:any,reponse_id:any){
    return this.http.put(this.APIUrl+'/add_new_data_set/'+code_id+'/'+reponse_id,{})
  }
  updatePrincipleGraph(val:any){
    return this.http.put(this.APIUrl+'/update_principle_graph/',val)
  }
  updateRelatedGraph(val:any){
    return this.http.put(this.APIUrl+'/update_related_graph/',val)
  }
  getCodeById(id:any){
    return this.http.get(this.APIUrl+'/get_code_by_id/'+id)
  }
  getReports(code_python_id: number): Observable<any> {
    return this.http.post<any>(`${this.APIUrl}/get_reports/`, { code_python_id });
  }


  getDecisions(val:any){
    return this.http.post(this.APIUrl+'/get_decisions/',val)
  }

  updateReport(id:any,val:any){
    return this.http.put(this.APIUrl+'/update_report/'+id,val)
  }
  updateDecision(id:any,val:any){
    return this.http.put(this.APIUrl+'/update_decision/'+id,val)
  }
  addNewReport(idCode:any,val:any){
    return this.http.post(this.APIUrl+'/add_new_Report/'+idCode,val)
  }
  deleteReport(id:any){
    return this.http.delete(this.APIUrl+"/delete_report/"+id)
  }
  deleteDecision(id:any){
    return this.http.delete(this.APIUrl+'/delete_decision/'+id)
  }

  addNewDecision(idReport:any,val:any){
    return this.http.post(this.APIUrl+'/add_new_Decision/'+idReport,val)
  }

  getCausesOrConsequences(val:any){
    return this.http.post(this.APIUrl+'/get_causes_consequences/',val)
  }
  addCauseToCode(idCode:any,idCause:any){
    return this.http.post(this.APIUrl+'/add_cause_to_code/'+idCode+'/'+idCause,{})
  }
  addConsequenceToCode(idCode:any,idConsequence:any){
    return this.http.post(this.APIUrl+'/add_consequence_to_code/'+idCode+'/'+idConsequence,{})
  }

  deleteCauseFromCode(idCode:any,idCause:any){
    return this.http.delete(this.APIUrl+'/delete_cause_from_code/'+idCode+'/'+idCause)
  }
  deleteConsequenceFromCode(idCode:any,idConsequence:any){
    return this.http.delete(this.APIUrl+'/delete_consequence_from_code/'+idCode+'/'+idConsequence)
  }
  getCodesByDashboardId(id:any){
    return this.http.get(this.APIUrl+'/codes_by_dashboard_Id/'+id)
  }
  /*getAllGraphs(){
    return this.http.get(this.APIUrl+'/get_all_graphs/')
  }*/
    getDocumentsSubmittedByAction(id: any): Observable<any> {
      return this.http.get(`${this.APIUrl}/get_documents_submitted/${id}/`);
  }

  getDocumentsValidatedByAction(id: number): Observable<any> {
  return this.http.get(`${this.APIUrl}/get_documents_validated/${id}/`);
}

  createDocumentSubmittedByAction(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.APIUrl}/create_document_submitted/${id}/`, formData);
  }




  createDocumentValidatedByAction(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.APIUrl}/create_document_validated/${id}/`, formData);
  }

  deleteDocument(id: any): Observable<any> {
    return this.http.delete(`${this.APIUrl}/delete_document/${id}/`);
  }


  createResponse(responseData: any): Observable<any> {
    return this.http.post<any>(this.APIUrl + '/create_response', responseData);
  }
  getAllGraphs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.APIUrl}/graphs`);
  }



  createGraphWithItem(graph: any, itemId: number): Observable<any> {
    const data = {
      ...graph,
      itemId: itemId
    };
    return this.http.post<any>(`${this.APIUrl}/create_graph_with_item/`, data).pipe(
      catchError((error) => {
        console.error('Error creating graph with item:', error);
        return throwError(error);
      })
    );
  }


  createGraph(graph: any): Observable<any> {
    return this.http.post<any>(`${this.APIUrl}/create_graph/`, graph);
  }

  fetchGraphs(): Observable<any[]> {
    const url = `${this.APIUrl}/graphs?nocache=${new Date().getTime()}`;
    return this.http.get<any[]>(url);
}

  deleteGraph(id: number): Observable<any> {
    return this.http.delete(`${this.APIUrl}/delete_graph/${id}/`);
  }

  updateGraph(codePythonId: number, data: any): Observable<any> {
    const url = `${this.APIUrl}/update_graph/${codePythonId}/`;
    console.log('PUT request URL:', url); // Log the URL
    return this.http.put(url, data);
}

addNewAction(idDecision: number, action: any): Observable<any> {
  return this.http.post(`${this.APIUrl}/add_action/${idDecision}`, action);
}
getActionsByIds(actionIds: number[]) {
  return this.http.post(`${this.APIUrl}/get_actions_by_ids/`, { actionIds });
}

updateAction(id: number, data: any): Observable<any> {
  return this.http.put(`${this.APIUrl}/update_action/${id}`, data);
}

deleteAction(id: number): Observable<any> {
  return this.http.delete(`${this.APIUrl}/delete_action/${id}`);
}

getActions(decisionIds: number[]): Observable<any> {
  return this.http.post<any>(`${this.APIUrl}/get_actions/`, decisionIds);
}
getActionById(actionId: number): Observable<any> {
  return this.http.get<any>(`${this.APIUrl}/get_action_by_id/${actionId}/`);
}

updateGraphPosition(graphId: number, position: { x: number, y: number }): Observable<any> {
  if (position.x == null || position.y == null) {
      console.error("Invalid position values", position);
      return of({ error: "Invalid position values" }); // Or handle the error as needed
  }
  const url = `http://localhost:8000/GestionBI/graphs/${graphId}/position/`;
  console.log('Updating position for graphId:', graphId);  // Log the graph ID being updated
  return this.http.put(url, position);
}


uploadDocument(actionId: number, file: File): Observable<any> {
  const formData = new FormData();
  formData.append('Document', file);

  // Add a trailing slash at the end of the URL
  return this.http.post(`${this.APIUrl}/create_document_submitted/${actionId}/`, formData);
}

createOrUpdateResponsibleRealisation(actionId: number, name: string): Observable<any> {
  return this.http.post<any>(`${this.APIUrl}/create_or_update_responsible_Realisation/${actionId}/`, { name });
}

createOrUpdateResponsibleValidation(actionId: number, name: string): Observable<any> {
  return this.http.post<any>(`${this.APIUrl}/create_or_update_responsible_validation/${actionId}/`, { name });
}



// graphs.service.ts

getResponsibleRealisationById(id: number) {
  return this.http.get(`${this.APIUrl}/responsible_realisation/${id}/`);
}

getResponsibleValidationById(id: number) {
  return this.http.get(`${this.APIUrl}/responsible_validation/${id}/`);
}
getGraphsByItem(itemId: number): Observable<any> {
  return this.http.get(`${this.APIUrl}/graphs/item/${itemId}/`);
}



  /*sidebar*/
  private apiUrl = 'http://localhost:8000/GestionBI/sidebars/';
  private sidebarItemsUrl = 'http://localhost:8000/GestionBI/sidebar-items/';



  getSidebars(): Observable<Sidebar[]> {
    return this.http.get<Sidebar[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /*getSidebarItems(sidebarId: number): Observable<SidebarItem[]> {
    return this.http.get<SidebarItem[]>(`${this.apiUrl}${sidebarId}/items/`).pipe(
      catchError(this.handleError)
    );
  }*/

  addSidebar(sidebar: Sidebar): Observable<Sidebar> {
    return this.http.post<Sidebar>(this.apiUrl, sidebar).pipe(
      catchError(this.handleError)
    );
  }

  deleteSidebar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  /*addSidebarItem(item: SidebarItem): Observable<SidebarItem> {
    return this.http.post<SidebarItem>(`${this.apiUrl}${item.sidebar}/items/`, item).pipe(
      catchError(this.handleError)
    );
  }*/

 /* updateSidebarItem(id: number, item: SidebarItem): Observable<void> {
    return this.http.put<void>(`${this.sidebarItemsUrl}${id}/`, item).pipe(
      catchError(this.handleError)
    );
  }*/

  deleteSidebarItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sidebarItemsUrl}${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error);
  }

  updateSidebar(id: number, sidebar: Sidebar): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${id}/`, sidebar).pipe(
      catchError(this.handleError)
    );
  }

  updateSidebarStyle(id: number, style: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}${id}/`, { style }).pipe(
      catchError(this.handleError)
    );
  }

  getGraphsForItem(itemId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.APIUrl}/get_graphs_for_item/${itemId}/`);
  }
  getSidebarItems(sidebarId: number, websiteId: number): Observable<SidebarItem[]> {
    return this.http.get<SidebarItem[]>(`${this.apiUrl}${sidebarId}/items/?website_id=${websiteId}`).pipe(
      catchError(this.handleError)
    );
  }





  // Update item with websiteId
  updateSidebarItem(id: number, item: SidebarItem): Observable<void> {
    console.log('Updating SidebarItem with ID:', id);  // Log the item ID being updated
    console.log('Data being sent for update:', item);  // Log the item data being sent

    return this.http.put<void>(`${this.sidebarItemsUrl}${id}/`, item).pipe(
      catchError((error) => {
        console.error('Error updating item:', error);
        if (error.status === 404) {
          console.error('SidebarItem not found:', id);
        }
        return throwError(error);
      })
    );
  }



  // Add item with websiteId
  // Ensure that when you make an API call to add or update a SidebarItem, include websiteId
  addSidebarItem(newItem: SidebarItem): Observable<any> {
    return this.http.post(`${this.apiUrl}${newItem.sidebar}/items/`, {
      ...newItem,
      website: newItem.websiteId  // Ensure website ID is included in the request
    }).pipe(
      catchError(this.handleError)
    );
  }




  // Ajouter un nouveau selectedSegment lié à un sidebarItemId
  addSelectedSegment(sidebarItemId: number, segment: any): Observable<any> {
    const data = { ...segment, sidebar_item_id: sidebarItemId };
    console.log("Données envoyées :", data); // Log des données envoyées
    return this.http.post(`${this.APIUrl}/selected-segments/`, data).pipe(
      catchError((error) => {
        console.error("Erreur lors de l'ajout du segment :", error);
        return throwError(error);
      })
    );
  }


// Récupérer tous les selectedSegments liés à un sidebarItemId
getSelectedSegmentsBySidebarItemId(sidebarItemId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.APIUrl}/selected-segments/?sidebar_item_id=${sidebarItemId}`).pipe(
    catchError((error) => {
      console.error('Error fetching selected segments:', error);
      return throwError(error);
    })
  );
}

// Supprimer un selectedSegment par ID
deleteSelectedSegment(segmentId: number): Observable<void> {
  const url = `${this.APIUrl}/selected-segment/${segmentId}/`; // Assurez-vous que l'ID est correctement transmis
  return this.http.delete<void>(url);
}

updateSelectedSegment(segmentId: number, updatedData: any): Observable<any> {
  const url = `${this.APIUrl}/selected-segments/${segmentId}/`;
  console.log('Updating selected segment:', updatedData);
  return this.http.put(url, updatedData).pipe(
    catchError((error) => {
      console.error('Error updating selected segment:', error);
      return throwError(error);
    })
  );
}


}
