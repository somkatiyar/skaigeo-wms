import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { CropMonitoringService } from '../crop-monitoring.service';
declare var $: any;
interface LayerInterface {
  name: string,
  value: string
}
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {



  selectedLayer:any ="Greenness Layer";
  selectedFromDate: any ='2020-01-01';
  selectedToDate: any = '2022-08-29';
  selectedState: any;
  selectedYear: any;
 
  selectedDistrict: any;
  selectedSubDist: any;
  selectedCrop: any;
  selectedPhase: any;
  dateData: any = new Array();
  states: any = new Array();
  districts: any = new Array();
  subDistricts: any = new Array();
  isSlider:boolean = true;
  layers: LayerInterface[] =[
    {name:"Greenness Index", value:"Greenness Layer"},
    {name:"Soil Moisture", value:"SM Normal"},
    {name:"Maximum Temperature", value:"Maximum Temperature"},
    {name:"Precipitation Index", value:"Precipitation Index"},
    {name:"Irrigation potential", value:"Irrigation potential"},
    {name:"CCE Points", value:"CCE Points"},
    {name:"Cat Event Risk Rating", value:"Cat Event Risk Rating"},
    {name:"AI Crop Classification", value:"AI Crop Classification"}
    
  ];
  setParmForMap: any;
  filteredStates: any;
  allcity: any;
  id: any = 32;
  data: any = [];
  showChartFlag: boolean = false;




  constructor(private _router: Router, public userService: CropMonitoringService, private route: ActivatedRoute,
   ) {
    this.selectedState = 'All State';
    this.selectedDistrict = 'District';
    this.selectedSubDist = 'Sub District';
    this.showChartFlag = false;


  }





  getDates() {
    this.userService.getDate().subscribe(result => {
      this.dateData = result['data'];
      var len = this.dateData.length
      this.selectedFromDate = this.dateData[0]['value'];
      this.selectedToDate = this.dateData[len-1]['value'];
      console.log(this.selectedFromDate,this.selectedToDate, "shiva");
    })
    
  }
  getState() {
     this.showChartFlag = true;
    this.filteredStates = [
      { label: 'All State', value: 'All State' }
    ];
    this.subDistricts = [
      {label: 'Sub District', value: 'Sub District'}
    ];
    this.districts = [
      {
        label: 'District', value: 'District'
      }
    ];
    this.userService.getState(this.id).subscribe(result => {
      this.selectedYear = result['data'][0]['year']
      result['data'].forEach((e:any) => {
        this.filteredStates.push(e);
      })
    })
  }
  onStateChange() {
    this.userService.getDistrict(this.id, this.selectedState).subscribe(result => { 
      this.subDistricts = [
        {label: 'Sub District', value: 'Sub District'}
      ];
      this.districts = [
        {
          label: 'District', value: 'District'
        }
      ];
      this.selectedDistrict = 'District';
      this.selectedSubDist = 'Sub District';
      if (result['data']) {
        result['data'].forEach((e:any) => {
          this.districts.push(e);
        })
      } else {
        return;
      }



    })
  }
  onDistrictChange() {
    this.userService.getSubDistrict(this.id, this.selectedState, this.selectedDistrict).subscribe(result => {
      this.subDistricts = [
        {
          label: 'Sub District', value: 'Sub District'
        }
      ];

      this.selectedSubDist = 'Sub District';

      result['data'].forEach((e:any) => {
        this.subDistricts.push(e);
      })


    })
  }




  ngOnInit() {
    this.getDates()
    this.getState()

  }


 










  removeDuplicates(arr) {
    const result:any = [];
    const duplicatesIndices:any = [];
    // Loop through each item in the original array
    arr.forEach((current, index) => {
      if (duplicatesIndices.includes(index)) return;
      result.push(current);
      // Loop through each other item on array after the current one
      for (let comparisonIndex = index + 1; comparisonIndex < arr.length; comparisonIndex++) {
        const comparison = arr[comparisonIndex];
        const currentKeys = Object.keys(current);
        const comparisonKeys = Object.keys(comparison);
        // Check number of keys in objects
        if (currentKeys.length !== comparisonKeys.length) continue;
        // Check key names
        const currentKeysString = currentKeys.sort().join("").toLowerCase();
        const comparisonKeysString = comparisonKeys.sort().join("").toLowerCase();
        if (currentKeysString !== comparisonKeysString) continue;
        // Check values
        let valuesEqual = true;
        for (let i = 0; i < currentKeys.length; i++) {
          const key = currentKeys[i];
          if (current[key] !== comparison[key]) {
            valuesEqual = false;
            break;
          }
        }
        if (valuesEqual) duplicatesIndices.push(comparisonIndex);
      } 
    }); 
    return result;
  }





  



}









