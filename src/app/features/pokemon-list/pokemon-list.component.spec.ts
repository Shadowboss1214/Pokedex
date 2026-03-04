import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokemonListComponent } from './pokemon-list.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PokemonListComponent', () => {
  let component: PokemonListComponent;
  let fixture: ComponentFixture<PokemonListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonListComponent);
    component = fixture.componentInstance;
    
    // Detectamos cambios iniciales para que el Signal se inicialice
    fixture.detectChanges(); 
  });

  it('debería crear el componente correctamente (Smoke Test)', () => {
    expect(component).toBeTruthy();
  });

  it('debería cambiar showDetails a TRUE al llamar a detailsPokemon()', () => {
    expect(component.state().showDetails).toBe(false);

    component.detailsPokemon();

    expect(component.state().showDetails).toBe(true);
  });

  it('debería alternar showDetails de TRUE a FALSE si se llama dos veces', () => {
    component.detailsPokemon();
    expect(component.state().showDetails).toBe(true);

    component.detailsPokemon();
    expect(component.state().showDetails).toBe(false);
  });

  it('debería iniciar con pokemon en NULL y loading en FALSE', () => {
    const estadoActual = component.state();
    expect(estadoActual.pokemon).toBeNull();
    expect(estadoActual.loading).toBe(false);
  });
});
