import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import { Router } from "@angular/router";
import {environment} from "../../environments/environment";

interface AuthResponse {
  token: string;
  username: string;
  admin: boolean;
  employeeId: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.authUrl}/login`;

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Sends login request to the backend.
   * @param username The username.
   * @param password The password.
   * @returns Observable containing JWT token and user details.
   */
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, { username, password }).pipe(
        tap(response => {
          this.storeSessionData(response); // Store session data in one place
        })
    );
  }

  private storeSessionData(response: AuthResponse): void {
    sessionStorage.setItem('token', response.token);
    sessionStorage.setItem('username', response.username);
    sessionStorage.setItem('isAdmin', response.admin.toString());
    sessionStorage.setItem('employeeId', response.employeeId.toString());
  }

  /**
   * Checks if the user is logged in.
   * @returns `true` if a token exists, otherwise `false`.
   */
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }

  /**
   * Checks if the user is an admin.
   * @returns `true` if the user is an admin, otherwise `false`.
   */
  isAdmin(): boolean {
    return sessionStorage.getItem('isAdmin') === 'true';
  }

  /**
   * Retrieves the logged in username
   *
   * @returns `username` if exists, otherwise `Guest`.
   * */
  getUserName(): string {
    return sessionStorage.getItem('username') || ('Guest');
  }

  getEmployeeId(): number | null {
    const id = sessionStorage.getItem('employeeId');
    return id ? Number(id) : null;
  }

  /**
   * Logs out the user by clearing session storage.
   */
  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}