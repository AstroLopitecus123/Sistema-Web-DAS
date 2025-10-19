import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-politica-de-privacidad',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './politica-de-privacidad.html',
  styleUrl: './politica-de-privacidad.css'
})
export class PoliticaDePrivacidad {
  fechaActualizacion: Date = new Date();
}

