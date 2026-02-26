// Saacado del POF
export interface PokemonType {
  name: string; // [cite: 49]
}

export interface PokemonTypeWrapper {
  type: PokemonType; // [cite: 52]
}

export interface PokemonSprites {
  front_default: string; // [cite: 55]
}

export interface Pokemon {
  id: number; // [cite: 58]
  name: string; // [cite: 59]
  sprites: PokemonSprites; // [cite: 60]
  types: PokemonTypeWrapper[]; // [cite: 61]
  height: number; // [cite: 62]
  weight: number; // [cite: 63]
}

export interface PokemonListItem {
  name: string; // [cite: 66]
  url: string; // [cite: 67]
}

export interface PokemonList {
  count: number; // [cite: 70]
  next: string | null; // [cite: 71]
  previous: string | null; // [cite: 72]
  results: PokemonListItem[]; // [cite: 73]
}