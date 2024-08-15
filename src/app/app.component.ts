import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { State } from "./models/States"
import { ThisReceiver } from '@angular/compiler';
import { Observable } from 'rxjs';
import { ResponseToken } from './models/ResponseToken';
import { ResponseStates } from './models/ResponseStates';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CommonModule } from '@angular/common';



const data = {
  // Aquí defines los datos que deseas enviar
  user: "csm",
  password: "exam1csm"
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, HttpClientModule, MatPaginatorModule, GoogleMapsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(
    private http: HttpClient,) { }
  states: State[] = [];
  responseToken: ResponseToken | undefined;
  title = 'cim-test';
  urlStates = "http://104.154.142.250/apis/exam/positions"
  urlTokens = "http://104.154.142.250/apis/exam/auth"
  // @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  // center: google.maps.LatLngLiteral = { lat: 24, lng: 12 }; // Ajusta las coordenadas según tu ubicación
  // zoom = 4;

  // markers: { position: google.maps.LatLngLiteral; title: string; description: string }[] = [
  //   {
  //     position: { lat: 25.761681, lng: -80.191788 },
  //     title: 'Miami',
  //     description: 'Esta es una descripción de Miami.',
  //   },
  //   {
  //     position: { lat: 40.712776, lng: -74.005974 },
  //     title: 'Nueva York',
  //     description: 'Esta es una descripción de Nueva York.',
  //   },
  // ];

  // infoWindowContent: { title: string; description: string } = { title: '', description: '' };

  // openInfoWindow(marker: MapMarker) {
  //   this.infoWindowContent = { title: marker.getTitle() || '', description: marker.getCursor() || '' };
  //   this.infoWindow.open(marker);
  // }

  displayedColumns: string[] = ['eco', 'lat', 'lng', 'state', "country"];
  displayedColumnsMax: string[] = ['state', 'count',];
  dataSource = new MatTableDataSource<State>();
  dataSourceOrderMax: any;
  dataSourceOrderMin: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngOnInit(): void {
    //Obtencion del token
    this.getToken();
  }
  ngAfterViewInit(): void {
    // Asigna el paginador una vez que la vista esté inicializada
    this.dataSource.paginator = this.paginator;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  getStates(): void {
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${this.responseToken?.data.jwt}` // Incluye el token en la cabecera
    });
    //Obtencion de los estados
    this.http.get<ResponseStates>(this.urlStates, { headers }).subscribe({
      next: (response: ResponseStates) => {
        // Puedes guardar el token o realizar otras acciones con la respuesta aquí
        this.states = response.data;
        this.dataSource.data = this.states
        this.countCountries()

      },
      error: (err) => {
        console.error('Error al obtener los estados:', err); // Manejo de errores
      }
    });
  }
  getToken(): void {
    this.http.post<ResponseToken>(this.urlTokens, data).subscribe({
      next: (response: ResponseToken) => {
        // Puedes guardar el token o realizar otras acciones con la respuesta aquí
        this.responseToken = response;
        if (this.responseToken != null) {
          //Obtencion de los estados
          this.getStates();
        }
      },
      error: (err) => {
        console.error('Error al obtener el token:', err); // Manejo de errores
      }
    });
  }
  countCountries() {
    const countMap = this.dataSource.data.reduce((acc, obj) => {
      const state = obj.state.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
        .trim();;
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const countMap2 = this.dataSource.data.reduce((acc, obj) => {
      const country = obj.country.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
        .trim();;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const sortedStateCounts = Object.entries(countMap)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => a.count - b.count); // Ordenar en función de la cantidad (de menor a mayor)
    // Paso 2: Asignar los datos a dataSourceOrderMin
    this.dataSourceOrderMin = sortedStateCounts

    const sortedCountriesCounts = Object.entries(countMap2)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count); // Ordenar en función de la cantidad (de menor a mayor)
  // Paso 2: Asignar los datos a dataSourceOrderMin
  this.dataSourceOrderMax = sortedCountriesCounts

  }

}
