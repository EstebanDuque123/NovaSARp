export interface Registro {
  fuente: string;
  nombre: string;
  tipo: 'Natural' | 'Jurídica';
  numeroId: string;
  fechaHecho: string;
  observacion: string;
  link: string;
  citaFuente: string;
}

export interface FiltrosBusqueda {
  termino: string;
  tipo: string;
  fuente: string;
  ordenar: string;
}
