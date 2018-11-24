import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse, HttpEvent } from '@angular/common/http';

import { catchError, map, tap } from 'rxjs/operators';
import { Oauth2Service } from './../oauth2/oauth2.service'
import { in_oauth_auth } from '../../data-model/in_oauth_auth';
import { UserDetail } from '../../data-model/user-detail';
import { DiarioList } from '../../data-model/diario-list';
import { ContaList } from '../../data-model/conta-list';
import { DiarioPost } from '../../data-model/diario-post';
import { DiarioPut } from '../../data-model/diario-put';
import { CategoriasTabularList } from '../../data-model/categoria-tabular-list';
import { CategoriaMove } from '../../data-model/categoria-move';

@Injectable({ providedIn: 'root' })

export class HttpClientService {
	private apiUrl = 'https://api.rafacla.com';


    constructor(private http: HttpClient, private oauth2: Oauth2Service) { }

	/** POST autentica um usuário e retorna um token */
	authPost(username: string, password: string): Observable<in_oauth_auth> {
		var json = JSON.stringify({username: username, password: password, client_id: 'web', grant_type: 'password'});

		var httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json; charset=UTF-8'
			})
		};

		return this.http.post<in_oauth_auth>(this.apiUrl+'/auth', json, httpOptions);
	}

	/** POST recupera um novo token usando um refreshtoken */
	authRefreshTokenPost(refreshToken: string): Observable<in_oauth_auth> {
		var json = JSON.stringify({refresh_token: refreshToken, grant_type: 'refresh_token', client_id: 'web'});

		var httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json; charset=UTF-8'
			})
		};

		return this.http.post<in_oauth_auth>(this.apiUrl+'/auth', json, httpOptions);
	}

	/** GET User details by id. Will 500 if id not found */
	userGet(): Observable<UserDetail> {
		return this.http.get<UserDetail>(this.apiUrl+'/users/logged');
	}

	/** GET Lista de Diários dado o ID do Usuário */
	diarioGet(userID: number): Observable<DiarioList[]> {
		var httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json; charset=UTF-8',
				'userid': userID.toString()
			})
		};
		return this.http.get<DiarioList[]>(this.apiUrl+'/diario',httpOptions);
	}

	/** GET Informações de um diário específico */
	diarioGetByUID(diarioUID: string): Observable<DiarioList> {
		var httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json; charset=UTF-8'
			})
		};
		return this.http.get<DiarioList>(this.apiUrl+'/diario/'+diarioUID,httpOptions);
	}

	/** POST Cria um Novo diário */
	diarioPost(diarioNome: string, diarioDescription: string, userID: number): Observable<object> {
		let json = new DiarioPost();
		json.userid = userID;
		json.nome = diarioNome;
		json.description = diarioDescription;

		//var json = JSON.stringify({nome: diarioNome, diarioDescription: diarioDescription, userid: userID});
		var httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json; charset=UTF-8'
			})
		};

		return this.http.post<object>(this.apiUrl+'/diario', json, httpOptions);
	}

	/** PUT Altera um Diário existente */
	diarioPut(diarioUID: string, diarioNome: string, diarioDescription: string): Observable<object> {
		let json = new DiarioPut();
		json.uniqueid = diarioUID;
		json.nome = diarioNome;
		json.description = diarioDescription;

		return this.http.post<object>(this.apiUrl+'/diario/put', json);
	}

	/** DELETE Deleta um diároi existente */
	diarioDelete(diarioUID: string): Observable<object> {
		let json = new DiarioPut()
		json.uniqueid = diarioUID;

		return this.http.post<object>(this.apiUrl+'/diario/delete', json);
	}

	/** GET Lista de Contas dado um DiarioUID */
	contasGet(diarioUID: string): Observable<ContaList[]> {
		var httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json; charset=UTF-8'
			})
		};
		return this.http.get<ContaList[]>(this.apiUrl+'/contas/'+diarioUID,httpOptions);
	}


	/** POST Cria ou Altera uma Conta */
	contaPost(conta: ContaList): Observable<object> {
		return this.http.post<object>(this.apiUrl + '/conta', conta);
	}

	/** POST Deleta uma Conta */
	contaDelete(conta_id: string): Observable<object> {
		let contaDeletar = new ContaList();
		contaDeletar.conta_id = +conta_id;
		return this.http.post<object>(this.apiUrl + '/conta/delete', contaDeletar);
	}

	/** GET Lista todas as Categorias e Subcategorias de forma tabular */
	categoriasTabularGet(diarioUID: string): Observable<CategoriasTabularList[]> {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json; charset=UTF-8'
			})
		};
		return this.http.get<CategoriasTabularList[]>(this.apiUrl + '/categoriatabular/' + diarioUID, httpOptions);
	}

	/** POST Cria ou Altera uma Categoria */
	categoriaPost(categoria: CategoriasTabularList): Observable<any> {
		return this.http.post<any>(this.apiUrl + '/categoria', categoria);
	}
	
	/** POST Cria ou Altera uma Subcategoria */
	subcategoriaPost(subcategoria: CategoriasTabularList): Observable<any> {
		return this.http.post<any>(this.apiUrl + '/subcategoria', subcategoria);
	}

	/** POST Deleta uma Categoria */
	categoriaDelete(categoria_id: string): Observable<any> {
		const categoriaDeletar = new CategoriasTabularList();
		categoriaDeletar.categoria_id = +categoria_id;
		return this.http.post<any>(this.apiUrl + '/categoria/delete', categoriaDeletar);
	}

	/** POST Deleta uma Subcategoria */
	subcategoriaDelete(subcategoria_id: string): Observable<any> {
		const subcategoriaDeletar = new CategoriasTabularList();
		subcategoriaDeletar.subcategoria_id = +subcategoria_id;
		return this.http.post<any>(this.apiUrl + '/subcategoria/delete', subcategoriaDeletar);
	}

	/** POST Move uma Categoria */
	categoriaMove(categoria_move: CategoriaMove): Observable<any> {
		return this.http.post<any>(this.apiUrl + '/categoria/move', categoria_move);
	}

	/** POST Move uma Subcategoria */
	subcategoriaMove(subcategoria_move: CategoriaMove): Observable<any> {
		return this.http.post<any>(this.apiUrl + '/subcategoria/move', subcategoria_move);
	}
}