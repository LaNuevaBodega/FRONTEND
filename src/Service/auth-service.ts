import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


const API_URL = 'https://localhost:7268/api/Auth'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient  ) { }

login(credentials: any): Observable<{ token: string }> { 
    return this.http.post<{ token: string }>(`${API_URL}/login`, credentials).pipe( 
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
