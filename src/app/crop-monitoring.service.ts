import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CropMonitoringService {
  constructor(private http: HttpClient,@Inject("baseURL") private baseURL: string,) {
  }
  token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJVU0VSX05BTUUiOiJkZW1vQGdtYWlsLmNvbSIsIklEIjoiMzIiLCJDT01QQU5ZX0lEIjoiMSIsIlJPTEVfSUQiOiI1IiwiRklSU1RfTkFNRSI6IkRlbW8iLCJNSURETEVfTkFNRSI6bnVsbCwiTEFTVF9OQU1FIjoiU2t5bWV0IiwiUEhPTkVfTlVNQkVSIjoiOTkxMTIwMDEzMSIsIkVNQUlMIjoiZGVtb0BnbWFpbC5jb20iLCJMQVNUX0xPR0lOIjoiMjAyMS0wMi0yNSAxMzowMjoxOSIsIkhBU0hDT0RFIjoiZDk4NWU1ZGZiN2EyYWVhMzc4ZGE3NThhYzk4ZTI1NmQ2ZWVlOTE3ZCIsIkFDVElWRV9TVEFUVVMiOm51bGwsImlzX2FybXNfdXNlciI6IjEiLCJpc19ncmFtY292ZXJfdXNlciI6IjAiLCJwcmljaW5nIjoiMSIsImNyb3BfbW9uaXRvcmluZyI6IjEiLCJmYXJtZXJfZGlhcnkiOiIxIiwidXBkYXRlZF9hdCI6IjIwMTktMDItMDYgMTA6Mzc6MjUiLCJteXBvcnRmb2xpbyI6IjEiLCJwYXlvdXRfYWNjZXNzIjoiMSIsImlkIjoiMzIifQ.37BPWSll_fEicpYad5Wyf1DREhJqVUieD3I2Q4ESmSU';
  headers = new HttpHeaders({'Authorization': this.token});

  getState(id: number) {
    const url = this.baseURL + `all-states?id=${id}`;
    return this.http.get<any>(url).pipe(map(this.extractData));
  }
  getDistrict(id:number,state:string) {
    const url = this.baseURL + `all-districts?id=${id}&state=${state}`;
    return this.http.get<any>(url).pipe(map(this.extractData));
  }
  getSubDistrict(id:number,state:string,district:string) {
    const url = this.baseURL + `all-sub-districts?id=${id}&state=${state}&district=${district}`;
    return this.http.get<any>(url).pipe(map(this.extractData));
  }
  getDate(): Observable<any> {
    const url = this.baseURL + 'fortnight-date-range';
    return this.http.get<any>(url).pipe(map(this.extractData));
  }
  getInputData(id: number, token: string): Observable<any> {
    const url = this.baseURL + 'inputdata?id=' + id + '&token=' + token;
    return this.http.get<any>(url).pipe(map(this.extractData));
  }
  getUserAssignData(id: number, token: string, season: string, year: string, phase: number): Observable<any> {
    const url = this.baseURL + 'userassigneddata?id='
      + id + '&token=' + token + '&season=' + season + '&year=' + year + '&phase=' + phase;
    return this.http.get<any>(url).pipe(map(this.extractData));
  }
  exportRegionSpecificCropMonitoringData(id, token, season, year, phase, state, district, subDistrict): Observable<any> {
    let url = this.baseURL + 'seprate-report?id='
      + id + '&token=' + token + '&season=' + season +
      '&year=' + year + '&phase=' + phase;
    if (state && state !== 'All State') {
      url = url + '&state=' + state;
    }
    if (district && district !== 'District') {
      url = url + '&district=' + district;
    }
    if (subDistrict && subDistrict !== 'Sub District') {
      url = url + '&subdist=' + subDistrict;
    }
    return this.http.get<any>(url).pipe(map(this.extractData));
  }
  exportAllCropMonitoringData(id, token, season, year, phase): Observable<any> {
    const url = this.baseURL + 'alldata-report?id='
      + id + '&token=' + token + '&season=' + season + '&year=' + year + '&phase=' + phase;
    return this.http.get<any>(url).pipe(map(this.extractData));
  }
  getSubDistrictList(id, token, state, district) {
    const url = this.baseURL + 'subdistrict?id='
      + id + '&token=' + token + '&state=' + state + '&district=' + district;
    return this.http.get<any>(url).pipe(map(this.extractData));
  }

  getStateId(state:any) {
    
    let url = 	this.baseURL + 'getstateid?state='+state+'&id='+32+'&token='+this.token;
    return this.http.get<any>( url ).pipe( map( this.extractData ) );
  }
  getDistrictId(district:any) {
    
    let url = 	this.baseURL + 'getdistrictid?district='+district+'&id='+32+'&token='+this.token;
    return this.http.get<any>( url ).pipe( map( this.extractData ) );
  }
  getSubDistrictId(subDistrict:any) {
    
    let url = 	this.baseURL + 'getsubdistrictid?subdistrict='+subDistrict+'&id='+32+'&token='+this.token;
    return this.http.get<any>( url ).pipe( map( this.extractData ) );
  }

  mailapiservice(body:any,token,id): Promise<any[]> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
         //Authorization: token
      })
    };


    const bodyJson=JSON.stringify(body);
    const filterUrl = this.baseURL + `mailapiservice?token=${token}&id=${id}&random=${Math.random()}`;
    return this.http.post<any>(filterUrl,bodyJson,httpOptions).toPromise(); 
  }

  getLayersDetails(id:any,year:any,from:any,to:any) {
    
    let url = '';
      url = this.baseURL + 'layers-details-gp-v1?from='+from+'&to='+to+'&id='+id+'&token='+this.token;
       return this.http.get<any>( url ).pipe( map( this.extractData ));
  }

  getFitBounds(id, state, district, subDistrict) {
    let url = 	this.baseURL + 'map-bound?id=' + id + '&token=' + this.token ;
    if (state && state !== 'All State') {
      url = url + '&state=' + state;
    }
    if (district && district !== 'District') {
      url = url + '&district=' + district;
    }

    if ( subDistrict && subDistrict !== 'Sub District' ) {
      url = url + '&subdist=' + subDistrict;
    }
    return this.http.get<any>( url ).pipe( map( this.extractData ) );
  }



  private extractData(res: any) {
    const body = res;
    return body;
  }
}
