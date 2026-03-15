import { Component, inject, OnInit, DestroyRef, signal, computed, effect, OnDestroy } from 
'@angular/core'; 
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, 
FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
 
import { Observable, EMPTY, BehaviorSubject } from 'rxjs';
import { PokemonDataService } from '../../data/services';
import { Pokemon, PokeAPIResponse } from '../../shared/models';
import { Router } from '@angular/router';
import { 
  convertHeightToMeters, 
  convertWeightToKilograms,
  generateRandomPokemonId,
  formatPokemonName
} from '../../shared/utils';
import { PokemonListState, INITIAL_POKEMON_LIST_STATE } from './pokemon-list.state';
import { Subject, OperatorFunction } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  host: {
    class: 'pokemon-container'
  },
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css'
})

export class PokemonListComponent implements OnInit, OnDestroy {
  private readonly pokemonDataService = inject(PokemonDataService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  
  private readonly destroy$ = new Subject<void>();
  protected searchPokemonName: string = '';
  protected advancedSearchForm!: FormGroup;

  // Señales para el estado del formulario 
  protected signalSearchType = signal<'name' | 'id'>('name'); 
  protected signalPokemonName = signal(''); 
  protected signalPokemonId = signal<number | null>(null);

  // Señales computadas para validaciones y errores 
  protected isSignalFormValid = computed(() => { 
  const searchType = this.signalSearchType(); 
  const name = this.signalPokemonName(); 
  const id = this.signalPokemonId();
  if (searchType === 'name') { 
      return name.trim().length > 0; 
    } else { 
      return id !== null && id >= 1 && id <= 1025; 
    } 
  });

  protected signalFormErrors = computed(() => { 
  const searchType = this.signalSearchType(); 
  const name = this.signalPokemonName(); 
  const id = this.signalPokemonId(); 
  const errors: string[] = []; 
 
    if (searchType === 'name' && name.trim().length === 0) { 
      errors.push('El nombre del Pokémon es requerido'); 
    }
    if (searchType === 'id') { 
      if (id === null) { 
        errors.push('El ID del Pokémon es requerido'); 
      } else if (id < 1) { 
        errors.push('El ID debe ser mayor a 0'); 
      } else if (id > 1025) { 
        errors.push('El ID debe ser menor o igual a 1025'); 
      } 
    } 
  
    return errors; 
  }); 

  public state = signal<PokemonListState>(INITIAL_POKEMON_LIST_STATE);

  ngOnInit(): void {
    this.initializeAdvancedSearchForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeAdvancedSearchForm(): void { 
    this.advancedSearchForm = this.formBuilder.group({ 
    searchType: ['name', Validators.required], 
    pokemonName: ['', Validators.minLength(1)], 
    pokemonId: ['', [Validators.min(1), Validators.max(1025)]] 
    });
      this.advancedSearchForm.get('searchType')?.valueChanges 
      .pipe(takeUntil(this.destroy$)) 
      .subscribe((searchType => { 
        const pokemonNameControl = this.advancedSearchForm.get('pokemonName'); 
        const pokemonIdControl = this.advancedSearchForm.get('pokemonId'); 
        const type = searchType as string;
  
        if (type === 'name') { 
          pokemonNameControl?.setValidators([Validators.required, Validators.minLength(1)]); 
          pokemonIdControl?.setValidators([]); 
        } else if (type === 'id') { 
          pokemonNameControl?.setValidators([]); 
          pokemonIdControl?.setValidators([Validators.required, Validators.min(1), 
  Validators.max(1025)]); 
        } 
  
        pokemonNameControl?.updateValueAndValidity(); 
        pokemonIdControl?.updateValueAndValidity(); 
      })); 
  } 

  onLoadRandomPokemon(): void {
    const randomId = generateRandomPokemonId();
    this.loadPokemon(() => this.pokemonDataService.getPokemonById(randomId));
  }

  onLoadPokemonInOrderAfter(): void {
    const currentId = this.state().pokemon?.id ?? 1;
    const maxOfficialId = 1025;
    const nextId = (currentId + 1) % maxOfficialId || 1;
    this.loadPokemon(() => this.pokemonDataService.getPokemonById(nextId));
  }

  onLoadPokemonInOrderBefore(): void {
    const currentId = this.state().pokemon?.id ?? 1;
    const maxOfficialId = 1025;
    const previousId = (currentId - 1) % maxOfficialId || maxOfficialId;
    this.loadPokemon(() => this.pokemonDataService.getPokemonById(previousId));
  }

  firstPokemon(): void {
    this.loadPokemon(() => this.pokemonDataService.getPokemonById(1));
  }

  endPokemon(): void {
    this.loadPokemon(() => this.pokemonDataService.getPokemonById(1025));
  }

  onSearchPikachu(): void {
    this.loadPokemon(() => this.pokemonDataService.getPokemonByName('pikachu'));
  }

  onSearchPokemon(): void { 
    if (this.searchPokemonName.trim()) { 
      this.loadPokemon( () => this.pokemonDataService.getPokemonByName(this.searchPokemonName.trim().toLowerCase())
        ); 
      } 
    }

  onSubmitAdvancedSearch(): void { 
  if (this.advancedSearchForm.invalid) { 
    return; 
    } 
  
    const { searchType, pokemonName, pokemonId } = this.advancedSearchForm.value; 
  if (searchType === 'name' && pokemonName.trim()) { 
      this.loadPokemon( 
        () => this.pokemonDataService.getPokemonByName(pokemonName.trim().toLowerCase()) 
      ); 
    } else if (searchType === 'id' && pokemonId) { 
      this.loadPokemon( 
        () => this.pokemonDataService.getPokemonById(Number(pokemonId)) 
      ); 
    } 
  }

  onSubmitSignalSearch(): void { 
  if (!this.isSignalFormValid()) { 
    return; 
  } 
 
  const searchType = this.signalSearchType(); 
  const name = this.signalPokemonName(); 
  const id = this.signalPokemonId(); 
 
  if (searchType === 'name' && name.trim()) { 
    this.loadPokemon( 
      () => this.pokemonDataService.getPokemonByName(name.trim().toLowerCase()) 
    ); 
  } else if (searchType === 'id' && id) { 
    this.loadPokemon( 
      () => this.pokemonDataService.getPokemonById(id) 
    ); 
  } 
}
// SIGNAL FORMS - MÉTODOS PARA ACTUALIZAR SIGNALS 
updateSignalSearchType(type: 'name' | 'id'): void { 
  this.signalSearchType.set(type);
}

updateSignalPokemonName(name: string): void { 
  this.signalPokemonName.set(name); 
} 
 
updateSignalPokemonId(id: string): void { 
  const numId = id ? parseInt(id, 10) : null; 
  this.signalPokemonId.set(numId); 
}

  detailsPokemon(): void {
    this.state.update(s => ({
      ...s,
      showDetails: !s.showDetails
    }));
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
          error: null,
          showDetails: false
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
// Removed unused takeUntilDestroyed helper functions
