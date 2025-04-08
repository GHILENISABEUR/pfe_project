import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormulaireService {
  static deleteUpdate(id: any) {
    throw new Error('Method not implemented.');
  }
  
  readonly APIUrl = 'http://127.0.0.1:8000';
  readonly PhotoUrl = 'http://127.0.0.1:8000/media/';
  constructor(private http: HttpClient) {}
  getAllFormulaire(){
    return this.http.get(this.APIUrl+'/formulaire/')
  }
  addNewFormulaire(val:any){
    return this.http.post(this.APIUrl+'/formulaire/',val)
  }
  getReponsesByFormulaire(id:any,idUser:any){
    return this.http.get(this.APIUrl+'/reponses/'+id+"/"+idUser) 
  }
  getServices(id:any){
    return this.http.get(this.APIUrl+'/services/'+id)
  }
  getFormulaireById(id:any){
    return this.http.get(this.APIUrl+'/formulaire/'+id).toPromise()
  }
  creatNewTable(val:any){
    return this.http.post(this.APIUrl+'/creatTable/',val)
  }
  deleteTable(id:any){
    return this.http.post(this.APIUrl+'/deleteTable/'+id,{})
  }
  addNewfields(val:any){
    return this.http.post(this.APIUrl+'/addFields/',val)
  }
  addForeignKey(val:any){
    return this.http.post(this.APIUrl+'/addForeignKey/',val)
  }
  getServicesByformulaire(id:any){
    return this.http.get(this.APIUrl+'/servicesByFormulaire/'+id).toPromise();
  }
  creatNewService(val:any){
    return this.http.post(this.APIUrl+'/services/',val)
  }
  updateService(val:any){
    return this.http.put(this.APIUrl+'/services/',val)
  }
  creatNewReponce(val:any){
    return this.http.post(this.APIUrl+'/reponses/',val)
  }
  getReponseById(id:any){
   return this.http.get(this.APIUrl+'/reponseById/'+id)
  }
  getServicesByReponse(id:any,val:any){
    return this.http.post(this.APIUrl+'/servicesByReponse/'+id,val)
  }
  updateReponse(val:any){
    return this.http.put(this.APIUrl+'/reponses/',val)
  }
  getFields(id:any){
    return this.http.get(this.APIUrl+'/fields/'+id).toPromise()
  }
  postField(val:any){
    return this.http.post(this.APIUrl+'/fields/',val)
  }
  getTables(id:any){
    return this.http.get(this.APIUrl+'/table/'+id).toPromise()
  }
  getAllTables(){
    return this.http.get(this.APIUrl+'/table/')
  }
  getAllInformation(val:any):Observable<any[]> {
    return this.http.post<any[]>(this.APIUrl+'/getAll/',val)
  }
  getInfoSup(val:any):Observable<any[]> {
    return this.http.post<any[]>(this.APIUrl+'/getBySup/',val)
  }
  getAllFields(id:any){
    return this.http.get(this.APIUrl+'/getAllFields/'+id).toPromise()
  }
  getFieldsInArchive(id:any){
    return this.http.get(this.APIUrl+'/getFieldsInArchive/'+id).toPromise()
  }
  updateField(val:any){
    return this.http.put(this.APIUrl+'/fields/',val)
  }
  creatFieldToServ(val:any){
    return this.http.post(this.APIUrl+'/fields/',val)   
  }
  workingServices(id:any){
    return this.http.get(this.APIUrl+'/workingServices/'+id).toPromise()
  }
  getServsExamples(){
    return this.http.get(this.APIUrl+'/servsExamples/')
  }
  deleteFormulaire(id:any){
    return this.http.delete(this.APIUrl+'/formulaire/'+id)
  }
  updateFieldPlace(id:any,val:any){
    return this.http.put(this.APIUrl+'/updateFieldPlace/'+id,val)
  }
  creatRelationUserServ(val:any){
    return this.http.post(this.APIUrl+'/relationUserServ/',val)
  }
  getUsersofServ(id:any){
    return this.http.get(this.APIUrl+'/getUsersofServ/'+id)
  }
  upDateFieldVal(val:any){
    return this.http.post(this.APIUrl+'/updateRow/',val)
  }
  addNewRow(val:any){
    return this.http.post(this.APIUrl+'/addRow/',val)
  }
  updateReponseEtap(id:any,val:any){
    return this.http.put(this.APIUrl+'/updateReponseEtap/'+id,val)
  }
  putServInArchive(id:any){
    return this.http.delete(this.APIUrl+'/putServInArchive/'+id)
  }
  putFieldInArchive(val:any){
    return this.http.put(this.APIUrl+'/putFieldInArchive/',val)
  }
  deleteServUserRelation(val:any){
    return this.http.post(this.APIUrl+'/deleteServUser/',val)
  }
  sendMail(id:any){
    return this.http.post(this.APIUrl+'/sendMail/'+id,{})
  }
  updateServName(val:any){
    return this.http.put(this.APIUrl+'/updateServName/',val)
  }
  putReponseInArchive(id:any){
    return this.http.get(this.APIUrl+'/putReponseInArchive/'+id)
  }
  verifierUserWork(id:any){
    return this.http.get(this.APIUrl+'/verifierUserWork/'+id)
  }

  getLastUpdate(id:any){
    return this.http.get(this.APIUrl+'/refresh/'+id)
  }
  deleteUpdate(id:any): Observable<any[]>{
    return this.http.delete<any[]>(this.APIUrl+'/notifEdit/'+id)
  }
  addNewUpdate(val:any){
    return this.http.post(this.APIUrl+'/notifEdit/',val)
  }
  sendOneMail(id:any,val:any){
    return this.http.post(this.APIUrl+'/sendOneMail/'+id,val)
  }
  deleteRowInTable(val:any){
    return this.http.post(this.APIUrl+'/deleteRowInTable/',val);
  }
  getServExampleByName(val:any){
  return this.http.post(this.APIUrl+'/getServExampleByName/',val);
  }
  getFieldOutOfArchive(val:any){
    return this.http.post(this.APIUrl+'/getFieldOutOfArchive/',val);
  }
  getDataList(val:any){
    return this.http.post(this.APIUrl+'/getDataList/',val);
  }
  creatChoice(val:any){
    return this.http.post(this.APIUrl+'/crud_choices/',val).toPromise();
  }
  correctChoice(val:any){
    return this.http.put(this.APIUrl+'/crud_choices/',val);
  }
  getChoicesFromField(id:any){
    return this.http.get(this.APIUrl+'/crud_choices/'+id).toPromise();
  }
  deleteChoice(id:any){
    return this.http.delete(this.APIUrl+'/crud_choices/'+id);
  }
  getChoices(id:any){
    return this.http.get(this.APIUrl+'/getChoices/'+id).toPromise()
  }
  giveInformationOnChoice(val:any){
    return this.http.post(this.APIUrl+'/giveInformationOnChoice/',val)
  }


  createFileExcelRef(val:any){
    return this.http.post(this.APIUrl+'/crud_excelFile/',val)
  }


  getFilesFrom(id:any){
    return this.http.get(this.APIUrl+'/crud_excelFile/'+id)
  }


  deleteAllRows(id:any){
    return this.http.get(this.APIUrl+'/deleteAllRows/'+id)
  }
  deleteUploadRows(val:any){
    return this.http.post(this.APIUrl+'/deleteUploadRows/',val)
  }

  filesUploaded(id:any){
    return this.http.get(this.APIUrl+'/filesUploaded/'+id)
  }


  uploadFile(val:any){
    return this.http.post(this.APIUrl+'/uploadFile/',val)
  }
  ColumnNames(id:any){
    return this.http.get(this.APIUrl+'/ColumnNames/'+id)
  }
  uploadData(id:any,val:any){
    return this.http.post(this.APIUrl+'/uploadData/'+id,val)
  }
  getCount(idR:any,val:any){
    return this.http.post(this.APIUrl+'/getCount/'+idR,val)
  }
  deleteFile(){
    return this.http.delete(this.APIUrl+'/crud_excelFile/')
  }
  exportData(id:any){
    return this.http.get(this.APIUrl+'/export_excelFile/'+id,{ responseType: 'blob' })
  }




  addFirstRow(id:any){
    return this.http.get(this.APIUrl+'/add_first_row/'+id)
  }


  getGroups():Observable<any[]>{
    return this.http.get<any[]>(this.APIUrl+'/crud_group/');
  }
  getInferGroup(id:any){
    return this.http.get(this.APIUrl+'/crud_group/'+id).toPromise();
  }
  getFormsByGroups(val:any){
    return this.http.post(this.APIUrl+'/get_forms_by_group/',val)
  }

  creatGroup(val:any){
    return this.http.post(this.APIUrl+"/crud_group/",val)
  }
  createRelationFormGroup(val:any){
    return this.http.post(this.APIUrl+'/create_relation_form_group/',val).toPromise()
  }
  getOneField(id:any){
    return this.http.get(this.APIUrl+'/get_one_field/'+id)
  }
  deleteGroup(id:any){
    return this.http.delete(this.APIUrl+"/crud_group/"+id)
  }
  getRestForms(val:any){
    return this.http.post(this.APIUrl+'/get_rest_of_forms/',val)
  }
  checkFormGroups(id:any){
    return this.http.get(this.APIUrl+'/check_form_groups/'+id)
  }
  deleteGroupFormRelation(idG:any,idF:any){
    return this.http.delete(this.APIUrl+"/delete_group_form_relation/"+idG+"/"+idF)
  }

  addFieldToView(idChoice:any,idField:any){
    return this.http.get(this.APIUrl+"/add_remove_field/"+idChoice+"/"+idField);
  }
  removeFieldToView(idChoice:any,idField:any){
    return this.http.delete(this.APIUrl+"/add_remove_field/"+idChoice+"/"+idField)
  }
  verifiesFieldView(idChoice:any,idField:any){
    return this.http.get(this.APIUrl+"/verifies_field_view/"+idChoice+"/"+idField).toPromise()
  }
  getFieldsInReference(id:any){
    return this.http.get(this.APIUrl+'/get_fields_in_reference/'+id).toPromise()
  }
  getFieldReference(id:any){
    return this.http.get(this.APIUrl+'/get_field_Reference/'+id).toPromise()
  }
  getFieldsInRelation(idChoice:any,idField:any){
    return this.http.get(this.APIUrl+"/get_fields_in_relation/"+idChoice+"/"+idField).toPromise()
  }
  getFunctions(idService:any){
    return this.http.get(this.APIUrl+"/crud_functions/"+idService)
  }
  postFunctions(val:any){
    return this.http.post(this.APIUrl+"/crud_functions/",val).toPromise()
  }
  correctFunction(idFunction:any,val:any){
    return this.http.put(this.APIUrl+"/crud_functions/"+idFunction,val)
  }


  updateGroupName(id:any,val:any){
    return this.http.put(this.APIUrl+'/crud_group/'+id,val)
  }


  getFirstOrderGroups(){
    return this.http.get(this.APIUrl+'/get_first_order_groups/').toPromise()
  }

  depthGroupsTree(){
    return this.http.get(this.APIUrl+'/depth_groups_tree/')
  }

  getGroupRelated(id:any){
    return this.http.get(this.APIUrl+'/get_group_related/'+id)
  }
  getFormsByGroupId(id:any){
    return this.http.get(this.APIUrl+'/get_forms_by_groupId/'+id)
  }
  getInformationOnForm(id:any){
    return this.http.get(this.APIUrl+'/get_information_on_form/'+id)
  }
  alterFieldStringList(val:any){
    return this.http.put(this.APIUrl+'/alter_field_string_list/',val)
  }

  getDataByIdReponse(id:any,sup:any,inf:any){
    return this.http.get(this.APIUrl+'/get_data/'+id+'?sup='+sup+'&inf='+inf)
  }
}
