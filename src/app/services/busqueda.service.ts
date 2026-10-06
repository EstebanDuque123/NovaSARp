import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Registro } from '../models/registro.model';

@Injectable({ providedIn: 'root' })
export class BusquedaService {
  private dataFiles = [
    'assets/data/datos-1.json',
    'assets/data/datos-2.json',
    'assets/data/datos-3.json',
    'assets/data/datos-4.json',
  ];

  private readonly _registros = signal<Registro[]>([]);
  private readonly _cargando = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly registros = this._registros.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly fuentes = computed(() => {
    const set = new Set(this._registros().map((r) => r.fuente));
    return Array.from(set).sort();
  });
  readonly total = computed(() => this._registros().length);

  cargado = false;

  constructor(private http: HttpClient) {}

  cargarDatos(): void {
    if (this.cargado) return;
    this._cargando.set(true);
    this._error.set(null);

    const peticiones = this.dataFiles.map((file) =>
      this.http.get<Registro[]>(file).pipe(
        catchError(() => {
          console.error(`Error al cargar ${file}`);
          return of<Registro[]>([]);
        })
      )
    );

    forkJoin(peticiones).subscribe({
      next: (resultados) => {
        const todos = resultados.flat();
        this._registros.set(todos);
        this._cargando.set(false);
        this.cargado = true;
      },
      error: (err) => {
        this._error.set('No se pudieron cargar los datos. Intenta más tarde.');
        this._cargando.set(false);
      },
    });
  }

  buscar(
    termino: string,
    tipo: string,
    fuente: string,
    ordenar: string
  ): Registro[] {
    let resultados = [...this._registros()];

    const t = termino.trim().toLowerCase();
    if (t) {
      resultados = resultados.filter(
        (r) =>
          r.nombre.toLowerCase().includes(t) ||
          r.numeroId.toLowerCase().includes(t) ||
          r.observacion.toLowerCase().includes(t)
      );
    }

    if (tipo) {
      resultados = resultados.filter((r) => r.tipo === tipo);
    }

    if (fuente) {
      resultados = resultados.filter((r) => r.fuente === fuente);
    }

    switch (ordenar) {
      case 'nombre-asc':
        resultados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre-desc':
        resultados.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'fecha-desc':
        resultados.sort((a, b) => b.fechaHecho.localeCompare(a.fechaHecho));
        break;
      case 'fecha-asc':
        resultados.sort((a, b) => a.fechaHecho.localeCompare(b.fechaHecho));
        break;
    }

    return resultados;
  }
}
