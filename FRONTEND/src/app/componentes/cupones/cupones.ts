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
    // Obtener datos del usuario actual
    this.usuario = this.authService.getUsuarioActual();
    
    // Si no hay usuario logueado, redirigir al login
    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar cupones del usuario
    this.cargarCupones();
  }

  cargarCupones() {
    this.cupones = [
      {
        id: 1,
        codigo: 'BIENVENIDA20',
        descripcion: '20% de descuento en tu primer pedido',
        tipoDescuento: 'porcentaje',
        valorDescuento: 20,
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        montoMinimo: 30,
        activo: true,
        usado: false
      },
      {
        id: 2,
        codigo: 'DESCUENTO10',
        descripcion: 'S/ 10 de descuento en compras mayores a S/ 50',
        tipoDescuento: 'monto_fijo',
        valorDescuento: 10,
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        montoMinimo: 50,
        activo: true,
        usado: false
      },
      {
        id: 3,
        codigo: 'PROMO15',
        descripcion: '15% de descuento en hamburguesas',
        tipoDescuento: 'porcentaje',
        valorDescuento: 15,
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
        montoMinimo: 25,
        activo: true,
        usado: true,
        fechaUso: '2024-03-15'
      },
      {
        id: 4,
        codigo: 'VERANO25',
        descripcion: '25% de descuento en bebidas',
        tipoDescuento: 'porcentaje',
        valorDescuento: 25,
        fechaInicio: '2024-01-01',
        fechaFin: '2024-02-29',
        montoMinimo: 20,
        activo: false,
        usado: false
      },
      {
        id: 5,
        codigo: 'FREESHIP',
        descripcion: 'Envío gratis en compras mayores a S/ 40',
        tipoDescuento: 'monto_fijo',
        valorDescuento: 8,
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        montoMinimo: 40,
        activo: true,
        usado: false
      }
    ];

    this.categorizarCupones();
    this.calcularEstadisticas();
  }

  categorizarCupones() {
    const categorizacion = this.cuponesService.categorizarCupones(this.cupones);
    this.cuponesDisponibles = categorizacion.cuponesDisponibles;
    this.cuponesUsados = categorizacion.cuponesUsados;
    this.cuponesExpirados = categorizacion.cuponesExpirados;
  }

  calcularEstadisticas() {
    this.estadisticas = this.cuponesService.calcularEstadisticas(this.cuponesDisponibles, this.cuponesUsados);
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

