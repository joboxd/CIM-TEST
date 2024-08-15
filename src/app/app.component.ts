import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { State } from "./models/States"
import { ThisReceiver } from '@angular/compiler';
import { Observable } from 'rxjs';
import { ResponseToken } from './models/ResponseToken';
import { ResponseStates } from './models/ResponseStates';


const data = {
  // Aquí defines los datos que deseas enviar
  user: "csm",
  password: "exam1csm"
};
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(
    private http: HttpClient,) { }
  states: State[] = [];
  responseToken: ResponseToken | undefined;
  title = 'cim-test';
  urlStates = "http://104.154.142.250/apis/exam/positions"
  urlTokens = "http://104.154.142.250/apis/exam/auth"


  displayedColumns: string[] = ['eco', 'lat', 'lng', 'state', "country"];
  dataSource = new MatTableDataSource<State>();

  ngOnInit(): void {
    //Obtencion del token
    this.getToken();

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
        console.log(this.states); // Aquí puedes ver los datos de la respuesta
        
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
        console.log(this.responseToken.data.jwt); // Aquí puedes ver los datos de la respuesta
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
}
