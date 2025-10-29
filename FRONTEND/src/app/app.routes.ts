import { Routes } from '@angular/router';
import { Menu } from './componentes/menu/menu';
import { Carrito } from './componentes/carrito/carrito';
import { Pedidos } from './componentes/pedidos/pedidos';
import { Login } from './componentes/login/login';
import { Registro } from './componentes/registro/registro'; 
import { RecuperarContrasena } from './componentes/recuperar-contrasena/recuperar-contrasena';
import { RestablecerContrasena } from './componentes/restablecer-contrasena/restablecer-contrasena';
import { TerminosYCondiciones } from './componentes/terminos-y-condiciones/terminos-y-condiciones';
import { PoliticaDePrivacidad } from './componentes/politica-de-privacidad/politica-de-privacidad';
import { PerfilUsuario } from './componentes/perfil-usuario/perfil-usuario';
import { EditarPerfil } from './componentes/editar-perfil/editar-perfil';
import { CambiarContrasena } from './componentes/cambiar-contrasena/cambiar-contrasena';
import { Cupones } from './componentes/cupones/cupones';
import { AdminDashboard } from './componentes/admin-dashboard/admin-dashboard';
import { AdminProductos } from './componentes/admin-productos/admin-productos';
import { AdminPedidos } from './componentes/admin-pedidos/admin-pedidos';
import { RepartidorDashboard } from './componentes/repartidor-dashboard/repartidor-dashboard';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { RepartidorGuard } from './guards/repartidor.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },

  // Rutas públicas
  { path: 'menu', component: Menu, title: 'Menú' },
  { path: 'login', component: Login, title: 'Ingresar' },
  { path: 'registro', component: Registro, title: 'Registro de Usuario' },
  { path: 'recuperar-contrasena', component: RecuperarContrasena, title: 'Recuperar Contraseña' },
  { path: 'restablecer-contrasena', component: RestablecerContrasena, title: 'Restablecer Contraseña' },
  { path: 'terminos-y-condiciones', component: TerminosYCondiciones, title: 'Términos y Condiciones' },
  { path: 'politica-de-privacidad', component: PoliticaDePrivacidad, title: 'Política de Privacidad' },
  
  // Rutas protegidas del cliente (requieren autenticación)
  { path: 'carrito', component: Carrito, title: 'Carrito', canActivate: [AuthGuard] },
  { path: 'mis-pedidos', component: Pedidos, title: 'Mis Pedidos', canActivate: [AuthGuard] },
  { path: 'mis-cupones', component: Cupones, title: 'Mis Cupones', canActivate: [AuthGuard] },
  { path: 'mi-perfil/:username', component: PerfilUsuario, title: 'Mi Perfil', canActivate: [AuthGuard] },
  { path: 'editar-perfil', component: EditarPerfil, title: 'Editar Perfil', canActivate: [AuthGuard] },
  { path: 'cambiar-contrasena', component: CambiarContrasena, title: 'Cambiar Contraseña', canActivate: [AuthGuard] },
  
  // Rutas del administrador (requieren rol de administrador)
  { path: 'admin/dashboard', component: AdminDashboard, title: 'Dashboard Admin', canActivate: [AdminGuard] },
  { path: 'admin/productos', component: AdminProductos, title: 'Gestión de Productos', canActivate: [AdminGuard] },
  { path: 'admin/pedidos', component: AdminPedidos, title: 'Gestión de Pedidos', canActivate: [AdminGuard] },
  
  // Rutas del repartidor (requieren rol de repartidor)
  { path: 'repartidor/dashboard', component: RepartidorDashboard, title: 'Dashboard Repartidor', canActivate: [RepartidorGuard] },
  
  // Rutas alternativas para compatibilidad
  { path: 'admin-dashboard', redirectTo: 'admin/dashboard' },
  { path: 'repartidor-dashboard', redirectTo: 'repartidor/dashboard' },
  
  { path: '**', redirectTo: 'menu' } 
];
