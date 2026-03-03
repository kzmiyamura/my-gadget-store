import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gadget } from './gadget.model';

@Injectable({
  providedIn: 'root'
})
export class GadgetService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/gadgets';

  getGadgets(): Observable<Gadget[]> {
    return this.http.get<Gadget[]>(this.apiUrl);
  }
}
