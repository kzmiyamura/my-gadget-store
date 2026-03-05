import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Gadget } from './gadget.model';

@Injectable({
  providedIn: 'root'
})
export class GadgetService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/gadgets';

  /** resource() API 向け：Promise を返す 1 件取得 */
  getGadget(id: string): Promise<Gadget> {
    return firstValueFrom(this.http.get<Gadget>(`${this.apiUrl}/${id}`));
  }

  getGadgets(): Observable<Gadget[]> {
    return this.http.get<Gadget[]>(this.apiUrl);
  }

  searchGadgets(query: string): Observable<Gadget[]> {
    return this.http.get<Gadget[]>(this.apiUrl, {
      params: query ? { q: query } : {},
    });
  }

  createGadget(data: { name: string; price: number; description: string }): Observable<Gadget> {
    return this.http.post<Gadget>(this.apiUrl, data);
  }

  updateGadget(
    id: number,
    data: { name: string; price: number; description: string },
  ): Observable<Gadget> {
    return this.http.patch<Gadget>(`${this.apiUrl}/${id}`, data);
  }

  deleteGadget(id: number): Observable<Gadget> {
    return this.http.delete<Gadget>(`${this.apiUrl}/${id}`);
  }
}
