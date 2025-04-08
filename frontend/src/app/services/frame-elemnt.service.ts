import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FrameElemntService {

  baseURL = environment.API + "element/"
 
  constructor(private http: HttpClient) { }


  create(data: any) {
    return this.http.post(this.baseURL + "create", data)
  }

  getAll() {

    return this.http.get(this.baseURL)
  }

  update(id:any,data: any) {

    return this.http.put(this.baseURL + "update/"+id, data)
  }
  getByFrame(id: any) {

    return this.http.get(this.baseURL + "byframe/" + id)
  }

  delete(id:any) {

    return this.http.delete(this.baseURL + "delete/"+id)
  }


}
