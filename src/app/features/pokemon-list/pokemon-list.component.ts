import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PokemonDataService } from '../../data/services';
import { Pokemon } from '../../shared/models';
import { 
  convertHeightToMeters, 
  convertWeightToKilograms,
  generateRandomPokemonId,
  formatPokemonName
} from '../../shared/utils';
import { PokemonListState, INITIAL_POKEMON_LIST_STATE } from './pokemon-list.state';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'pokemon-container'
  },
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css'
})

export class PokemonListComponent implements OnInit {
  private readonly pokemonDataService = inject(PokemonDataService);

  public state = signal<PokemonListState>(INITIAL_POKEMON_LIST_STATE);

  ngOnInit(): void {
    //this.onLoadRandomPokemon();
  }

  onLoadRandomPokemon(): void {
    const randomId = generateRandomPokemonId();
    this.loadPokemon(() => this.pokemonDataService.getPokemonById(randomId));
  }

  onSearchPikachu(): void {
    this.loadPokemon(() => this.pokemonDataService.getPokemonByName('pikachu'));
  }

  private loadPokemon(request: () => Observable<Pokemon>): void {
    this.state.update(s => ({
      ...s,
      loading: true,
      error: null
    }));

    request().subscribe({
      next: (pokemon: Pokemon) => {
        this.state.set({
          pokemon,
          loading: false,
          error: null
        });
      },
      error: (err: any) => {
        this.state.update(s => ({
          ...s,
          loading: false,
          error: this.getErrorMessage(err)
        }));
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) return 'Pokémon no encontrado';
    return 'Error al cargar el pokémon. Intenta de nuevo.';
  }

  protected convertHeight(height: number): string {
    return convertHeightToMeters(height).toFixed(2);
  }

  protected convertWeight(weight: number): string {
    return convertWeightToKilograms(weight).toFixed(2);
  }

  protected formatName(name: string): string {
    return formatPokemonName(name);
  }
}