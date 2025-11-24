import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { CuponesService } from '../../servicios/cupones.service';
import { Usuario } from '../../modelos/usuario.model';

interface Cupon {
  id: number;
  codigo: string;
  descripcion: string;
  tipoDescuento: 'porcentaje' | 'monto_fijo';
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  montoMinimo: number;
  activo: boolean;
  usado: boolean;
  fechaUso?: string;
}

@Component({
  selector: 'app-cupones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cupones.html',
  styleUrls: ['./cupones.css']
})
export class Cupones implements OnInit {
  usuario: Usuario | null = null;
  cupones: Cupon[] = [];
  cuponesDisponibles: Cupon[] = [];
  cuponesUsados: Cupon[] = [];
  cuponesExpirados: Cupon[] = [];
  
  tabActivo: 'disponibles' | 'usados' | 'expirados' = 'disponibles';
  
  // Estadísticas
  estadisticas = {
    cuponesDisponibles: 0,
    ahorradoEsteMes: 0,
    cuponesUsados: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private cuponesService: CuponesService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuarioActual();
    
    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarCupones();
  }

  cargarCupones() {
    if (!this.usuario?.idUsuario) {
      return;
    }

    this.cuponesService.obtenerCuponesDisponibles(this.usuario.idUsuario).subscribe({
      next: (cupones) => {
        this.cuponesDisponibles = cupones;
        this.actualizarEstadisticas();
      },
      error: (err) => {
        console.error('Error al cargar cupones disponibles:', err);
        this.cuponesDisponibles = [];
      }
    });

    this.cuponesService.obtenerCuponesUsados(this.usuario.idUsuario).subscribe({
      next: (cupones) => {
        this.cuponesUsados = cupones;
        this.actualizarEstadisticas();
      },
      error: (err) => {
        console.error('Error al cargar cupones usados:', err);
        this.cuponesUsados = [];
      }
    });

    this.cuponesService.obtenerCuponesExpirados(this.usuario.idUsuario).subscribe({
      next: (cupones) => {
        this.cuponesExpirados = cupones;
        this.actualizarEstadisticas();
      },
      error: (err) => {
        console.error('Error al cargar cupones expirados:', err);
        this.cuponesExpirados = [];
      }
    });
  }

  actualizarEstadisticas() {
    this.estadisticas.cuponesDisponibles = this.cuponesDisponibles.length;
    this.estadisticas.cuponesUsados = this.cuponesUsados.length;
    
    this.estadisticas.ahorradoEsteMes = this.cuponesUsados.reduce((total, cupon) => {
      // Aproximación: usar el valor del descuento como ahorro
      return total + (cupon.tipoDescuento === 'porcentaje' ? 
        (cupon.valorDescuento * 0.15) : cupon.valorDescuento);
    }, 0);
  }


  cambiarTab(tab: 'disponibles' | 'usados' | 'expirados') {
    this.tabActivo = tab;
  }

  copiarCodigo(codigo: string) {
    navigator.clipboard.writeText(codigo).then(() => {
    });
  }

  aplicarCupon(cupon: Cupon) {
    this.router.navigate(['/carrito'], { queryParams: { cupon: cupon.codigo } });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearDescuento(cupon: Cupon): string {
    if (cupon.tipoDescuento === 'porcentaje') {
      return `${cupon.valorDescuento}%`;
    } else {
      return `S/ ${cupon.valorDescuento}`;
    }
  }
}

