import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pokemon, PokemonList, PokeAPIResponse } from '../../shared/models';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PokemonDataService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://pokeapi.co/api/v2';

  getPokemonList(limit: number = 20, offset: number = 0): Observable<PokemonList> {
    return this.http.get<PokemonList>(
      `${this.API_URL}/pokemon?limit=${limit}&offset=${offset}`
    );
  }

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.API_URL}/pokemon/${id}`);
  }

  getPokemonByName(name: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.API_URL}/pokemon/${name.toLowerCase()}`);
  }

  getTotalPokemonCount(): Observable<number> {
  return this.http.get<PokeAPIResponse>(`${this.API_URL}/pokemon?limit=1&offset=1024`).pipe(
    map((response: PokeAPIResponse) => response.count)
  );
  }
}