import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RepartidorService } from '../../servicios/repartidor.service';
interface ReporteProblema {
  idPedido: number;
  fechaReporte: string;
  estadoPedido: string;
  clienteNombre: string;
  clienteTelefono: string;
  detalleProblema: string;
  repartidor?: string;
}

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pedidos.html',
  styleUrls: ['./admin-pedidos.css']
})
export class AdminPedidos implements OnInit {
  reportes: ReporteProblema[] = [];
  reportesFiltrados: ReporteProblema[] = [];
  terminoBusqueda = '';

  constructor(private router: Router, private repartidorService: RepartidorService) {}

  ngOnInit() {
    this.cargarReportes();
  }

  cargarReportes() {
    this.repartidorService.obtenerReportesProblemas().subscribe({
      next: (reportes: any[]) => {
        this.reportes = (reportes || []).map(reporte => ({
          idPedido: reporte.idPedido,
          fechaReporte: reporte.fechaProblema,
          estadoPedido: reporte.estadoPedido,
          clienteNombre: reporte.clienteNombre,
          clienteTelefono: reporte.clienteTelefono,
          detalleProblema: reporte.detalleProblema,
          repartidor: reporte.repartidorNombre
        }));
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al cargar reportes de problemas:', error);
        this.reportes = [];
        this.reportesFiltrados = [];
      }
    });
  }

  aplicarFiltros() {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    this.reportesFiltrados = this.reportes.filter(reporte => {
      if (!termino) return true;
      return (
        reporte.idPedido.toString().includes(termino) ||
        reporte.clienteNombre.toLowerCase().includes(termino) ||
        (reporte.detalleProblema?.toLowerCase().includes(termino) ?? false)
      );
    });
  }

  buscarReportes() {
    this.aplicarFiltros();
  }

  verDetallePedido(reporte: ReporteProblema) {
    this.router.navigate(['/admin/pedidos/detalle', reporte.idPedido]);
  }

  volverAlDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleString('es-PE');
  }
}
