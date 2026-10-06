import { Routes } from '@angular/router';
import { ShellComponent } from './components/shell/shell.component';
import { BusquedaComponent } from './pages/busqueda/busqueda.component';
import { PrivacidadComponent } from './pages/privacidad/privacidad.component';
import { TerminosComponent } from './pages/terminos/terminos.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: BusquedaComponent, title: 'NovaSAR - Búsqueda de Datos Abiertos' },
      { path: 'privacidad', component: PrivacidadComponent, title: 'NovaSAR - Política de Privacidad' },
      { path: 'terminos', component: TerminosComponent, title: 'NovaSAR - Términos y Condiciones' },
    ],
  },
  { path: '**', redirectTo: '' },
];
