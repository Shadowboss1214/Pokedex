import { Pokemon } from '../../shared/models';

export interface PokemonListState {
  pokemon: Pokemon | null;
  loading: boolean;
  error: string | null;
}

export const INITIAL_POKEMON_LIST_STATE: PokemonListState = {
  pokemon: null,
  loading: false,
  error: null
};