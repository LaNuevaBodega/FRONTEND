import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';






@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(
    private http: HttpClient  ) { }

login(credentials: any): Observable<{ token: string }> { 
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe( 
      tap((response) => {        
        localStorage.setItem('jwt_token', response.token); 
      })
    );
}

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }
  
  isLoggedIn(): boolean {
    const token = this.getToken();
  
    return !!token;
  }
  
  logout(): void {
    localStorage.removeItem('jwt_token');
  }
  
}
