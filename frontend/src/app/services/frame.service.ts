import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class FrameService {

  baseURL = environment.API + "frame/"
 
  constructor(private http: HttpClient) { }


  create(data: any) {
    return this.http.post(this.baseURL + "create", data)
  }

  getById(id: any) {

    return this.http.get(this.baseURL + "byid/" + id)
  }
  getAll() {

    return this.http.get(this.baseURL)
  }

  update(id:any,data: any) {

    return this.http.put(this.baseURL + "update/"+id, data)
  }
  getByWebSite(id: any) {

    return this.http.get(this.baseURL + "bywebsite/" + id)
  }

  delete(id:any) {

    return this.http.delete(this.baseURL + "delete/"+id)
  }


}
