import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos-y-condiciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './terminos-y-condiciones.html',
  styleUrl: './terminos-y-condiciones.css'
})
export class TerminosYCondiciones {
  fechaActualizacion: Date = new Date();
}

