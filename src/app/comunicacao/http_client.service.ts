import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { catchError, map, tap } from 'rxjs/operators';

import { Hero } from './data-model/hero';
import { in_oauth_auth } from './data-model/in_oauth_auth';

@Injectable({ providedIn: 'root' })

export class HttpClientService {
	private apiUrl = 'https://api.rafacla.com';
	

  constructor(
	private http: HttpClient) { }

		/** POST autentica um usuário e retorna um token */
		Autentica(username: string, password: string): Observable<in_oauth_auth> {
			var json = JSON.stringify({username: username, password: password, client_id: 'web', grant_type: 'password'});
      
			var httpOptions = {
				headers: new HttpHeaders({
					'Content-Type':  'application/json; charset=UTF-8'
				})
			};

			return this.http.post<in_oauth_auth>(this.apiUrl+'/auth', json, httpOptions);
			//.pipe(catchError(this.handleError<in_oauth_auth>('/auth',json)));
		}
	
	/** GET heroes from the server */
	getHeroes (): Observable<Hero[]> {
	  return this.http.get<Hero[]>(this.apiUrl)
		.pipe(catchError(this.handleError('getHeroes', []))
		);
	}

	
	/** GET hero by id. Will 404 if id not found */
	getHero(id: number): Observable<Hero> {
	  return (this.http.get<Hero[]>(this.apiUrl))[1].pipe(
		tap(catchError(this.handleError<Hero>(`getHero id=${id}`))));
	}
	
	/**
	 * Handle Http operation that failed.
	 * Let the app continue.
	 * @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	private handleError<T> (operation = 'operation', result?: T) {
	  return (error: any): Observable<T> => {
	 
		// TODO: send the error to remote logging infrastructure
		console.error(error); // log to console instead
	 
		// Let the app keep running by returning an empty result.
		return of (result);
	  };
	}
}