import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CropMonitoringService } from '../crop-monitoring.service';
import { dark,light, sanzy} from './google-theme'

declare var google:any;

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss']
})
export class GoogleMapComponent implements OnInit,OnChanges {
  map: any;
  EXTENT = [-Math.PI * 6378137, Math.PI * 6378137];
  @Input() selectedLayer:any;
  @Input() selectedFromDate:any;
  @Input()selectedToDate: any;
  @Input()selectedState: any;
  @Input()selectedSubDist: any;
  @Input()selectedDistrict: any;


  layerDaysListNDVIGp:any = [];
  layerDaysListSMGp:any = [];
  layerDaysListPI:any = [];
  layerDaysListTmax:any = [];
  sliderLayers:any = [];
  sliderDateRange:any = [];
    plotedLayer:any;
    sliderTickIndex:any;
    selectedSliderDate:any = '07-11-2022';
    selectedTheme = 0;
    theme:any = dark;

  constructor(private cropMonitoring:CropMonitoringService) { }

  ngOnInit(): void {
  }

  theameClick(index) {
    alert()
    this.selectedTheme = index
    index == 1 &&  this.map.setOptions({ styles:dark})
    index == 0 &&  this.map.setOptions({ styles:light})
    index == 2 &&  this.map.setOptions({ styles:sanzy})
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isPlay = true;
    this.getLayersDetail().then(()=>{
      if(this.selectedLayer == 'Greenness Layer' && this.sliderLayers) {
        this.ndviAndSm()
      
      }
      if(this.selectedLayer == 'SM Normal' && this.sliderLayers) {
        this.ndviAndSm();
      }
      if(this.selectedLayer == 'Maximum Temperature' && this.sliderLayers) {
        this.plotTmax(this.sliderLayers[this.sliderLayers.length -1]['layer'],this.sliderLayers[this.sliderLayers.length -1]['val'])
      }
      if(this.selectedLayer == 'Precipitation Index' && this.sliderLayers) {
        this.plotSP(this.sliderLayers[this.sliderLayers.length -1]['layer'],this.sliderLayers[this.sliderLayers.length -1]['val'])
      }
      if(this.selectedLayer == 'Irrigation potential'){
        this.plotIrriLayer()
      }
      if(this.selectedLayer == 'CCE Points'){
        this.plotCceLayer()
      }
      if(this.selectedLayer == 'Cat Event Risk Rating'){
        this.plotRisk()
      }

      if(this.selectedLayer == 'AI Crop Classification'){
        this.aiCrop()
      }
      
    });
  }

  ngAfterViewInit(): void {
    this.map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 4.5,
        opacity:1,
        mapTypeControl: false,
        zoomControl: false,
        zoomControlOptions: {
          position: google.maps.ControlPosition.LEFT_CENTER,
        },
        scaleControl: true,
        streetViewControl: false,
        styles: this.theme
      });
    }

locationExtent(){
  this.cropMonitoring.getFitBounds(32, this.selectedState, this.selectedDistrict, this.selectedSubDist).subscribe(response => {
    
 var Item_1 = new google.maps.LatLng(response[1] && response[1][0],response[1] && response[1][1]);
var myPlace = new google.maps.LatLng(response[0] && response[0][0],response[0] && response[0][1]);
var bounds = new google.maps.LatLngBounds(myPlace,Item_1);
response && response.length && this.map.fitBounds(bounds);
    
  });
}


  plotWMS(layer,filter) {
   this.plotedLayer && this.map.overlayMapTypes.clear();
    this.plotedLayer = new google.maps.ImageMapType({
      getTileUrl: (coordinates, zoom)=>{
        return (
          "https://geo.skymetweather.com/geoserver/cite/wms?" +
          "&REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1" +
          "&LAYERS=" +layer+
          "&FORMAT=image%2Fpng" +
          "&transparent=true" +
          "&CQL_FILTER="+filter+
          "&tiled=true"+
          "&matchRGBA=0%2C0%2C0%2C0&missRGBA=null"+
          "&SRS=EPSG:3857&WIDTH=256&HEIGHT=256" +
          "&BBOX=" +
          this.xyzToBounds(coordinates.x, coordinates.y, zoom).join(",")
        );
      },
  
      name: "Landcover",
      alt: "National Land Cover Database 2016",
      opacity:0.7
    });
    this.map.overlayMapTypes.push(this.plotedLayer);
    this.plotedLayer &&  this.locationExtent()
  }
  plotSingleWMS(layer,filter) {
    var option = "";
    if(filter && filter!='')  {
      option ="https://geo.skymetweather.com/geoserver/cite/wms?" +
      "&REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1" +
      "&LAYERS=" +layer+
      "&FORMAT=image%2Fpng" +
      "&transparent=true" +
      "&tiled=true"+
      "&CQL_FILTER="+filter+
      "&matchRGBA=0%2C0%2C0%2C0&missRGBA=null"+
      "&SRS=EPSG:3857&WIDTH=256&HEIGHT=256" +
      "&BBOX=";
    } else {
      option ="https://geo.skymetweather.com/geoserver/cite/wms?" +
      "&REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1" +
      "&LAYERS=" +layer+
      "&FORMAT=image%2Fpng" +
      "&transparent=true" +
      "&tiled=true"+
      "&matchRGBA=0%2C0%2C0%2C0&missRGBA=null"+
      "&SRS=EPSG:3857&WIDTH=256&HEIGHT=256" +
      "&BBOX=";
    }

    this.plotedLayer && this.map.overlayMapTypes.clear();
    this.plotedLayer = new google.maps.ImageMapType({
      getTileUrl: (coordinates, zoom)=>{
        return ( option 
        +
          this.xyzToBounds(coordinates.x, coordinates.y, zoom).join(",")
        );
      },
  
      name: "Landcover",
      alt: "National Land Cover Database 2016",
      opacity:0.7
    });
   
      this.map.overlayMapTypes.push(this.plotedLayer);
      this.plotedLayer &&  this.locationExtent()
  }




    xyzToBounds(x, y, z) {
      
    const tileSize = this.EXTENT[1] * 2 / Math.pow(2, z);
    const minx = this.EXTENT[0] + x * tileSize;
    const maxx = this.EXTENT[0] + (x + 1) * tileSize;
    // remember y origin starts at top
    const miny = this.EXTENT[1] - (y + 1) * tileSize;
    const maxy = this.EXTENT[1] - y * tileSize;
    return [minx, miny, maxx, maxy];
}







async createLayersData(layer) {
  var self = this;
  self.sliderLayers = []
  return new Promise((resolve,reject) => {

    if(layer == 'Greenness Layer') {
      self.layerDaysListNDVIGp.forEach(function (entry:any ,index:any) {
        self.sliderLayers.push(
          {
            layer:'cite%3ARS_NDVI_' + entry['val'] + '_' + entry['year'],
            date:self.formatDate(entry)
          }
          )
      }); 
    } else if(layer == 'SM Normal') {
      self.layerDaysListSMGp.forEach(function (entry:any ,index:any) {
        self.sliderLayers.push(
          {
            layer:'cite%3ARS_SM_' + entry['val'] + '_' + entry['year'],
            date:self.formatDate(entry)
          }
          )
      }); 
    }
    else if(layer == 'Maximum Temperature') {
      self.layerDaysListTmax.forEach(function (entry:any ,index:any) {
        
        self.sliderLayers.push(
          {
            layer:'cite%3AARMS_TMax_view'
           , date:self.formatDate(entry),
             val:entry.val
            
          }
          )
      }); 
    } 
    else if(layer == 'Precipitation Index') {
      self.layerDaysListPI.forEach(function (entry:any ,index:any) {
        self.sliderLayers.push(
          {
            layer:'cite%3AARMS_PI_view',
            date:self.formatDate(entry),
             val:entry.val
          }
          )
      }); 
    } 
 
    this.sliderTickIndex = self.sliderLayers.length-1;
    resolve(self.sliderLayers)
  })


}

async getLayersDetail() {
  return new Promise((resolve, reject) => {
    this.cropMonitoring.getLayersDetails(32, "", this.selectedFromDate, this.selectedToDate)
      .subscribe((res: any) => {
        if (res) {
          this.layerDaysListNDVIGp = [];
          this.layerDaysListSMGp = [];
          this.layerDaysListPI = [];
          this.layerDaysListTmax = [];
          for (const key in res.ndvi.YearDetails) {
            this.layerDaysListNDVIGp.push(res.ndvi.YearDetails[key]);
          }

          for (const key in res.sm.YearDetails) {
            this.layerDaysListSMGp.push(res.sm.YearDetails[key]);
          }

          for (const key in res.pi.YearDetails) {
            delete res.pi.YearDetails[key].val
            res.pi.YearDetails[key]['val']=key
            this.layerDaysListPI.push(res.pi.YearDetails[key]);
            
          }

          for (const key in res.tmax.YearDetails) {
          
            this.layerDaysListTmax.push(res.tmax.YearDetails[key]);
          }
          this.createLayersData(this.selectedLayer)
          resolve(res);
        }
      });
  });

  

}


stLayer:any;
ndviAndSm() {
 
  this.isSlider = true;
  this.unSubscribeSlider()
  if (
    this.selectedState &&
    this.selectedState != "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) {
   this.stLayer = "state_name"+"%3C%3E%27"+this.selectedState+"%27"
    this.plotWMS(this.sliderLayers[this.sliderLayers.length -1]['layer']+'_GP',this.stLayer)
  } else if (
    this.selectedDistrict &&
    this.selectedDistrict != "District" &&
    this.selectedState &&
    this.selectedSubDist == "Sub District"
  ) {
    this.cropMonitoring
      .getDistrictId(this.selectedDistrict)
      .subscribe((response) => {
        this.stLayer = "district%3C%3E%27" + this.selectedDistrict + "%27";
       this.plotWMS(this.sliderLayers[this.sliderLayers.length -1]['layer']+'_GP',this.stLayer )
      });
  } 
  else if (
    this.selectedSubDist &&
    this.selectedSubDist != "Sub District" &&
    this.selectedState &&
    this.selectedDistrict &&
    this.selectedSubDist != "Sub District"
  ) {
    this.cropMonitoring
      .getSubDistrictId(this.selectedDistrict)
      .subscribe((response) => {
        this.stLayer = "block%3C%3E%27" + this.selectedSubDist + "%27";
      this.plotWMS(this.sliderLayers[this.sliderLayers.length -1]['layer']+'_GP', this.stLayer  )

      });
  }
   else if (
    this.selectedState == "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) {
    this.stLayer = "state_name%3D%271%27";
    
    this.plotWMS(this.sliderLayers[this.sliderLayers.length -1]['layer']+'_GP',this.stLayer)
  }

}

plotTmax(layer,tmaxFilter){
  this.isSlider = true;
  this.unSubscribeSlider()
  var stLayer = '';
  if (
    this.selectedState &&
    this.selectedState != "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) 
   this.cropMonitoring.getStateId(this.selectedState).subscribe(response => {
    stLayer ="date_no%3D" +tmaxFilter+ '%20and%20sid%20%3D' + response[0].state_id;
    this.plotWMS(layer,stLayer)
  });
   else if (
    this.selectedDistrict &&
    this.selectedDistrict != "District" &&
    this.selectedState &&
    this.selectedSubDist == "Sub District"
  ) {
    this.cropMonitoring
      .getDistrictId(this.selectedDistrict)
      .subscribe((response) => {
        stLayer = "date_no%3D" +tmaxFilter + ' and did =' + response[0].district_id;
       this.plotWMS(layer,stLayer )
      });
  } 
  else if (
    this.selectedSubDist &&
    this.selectedSubDist != "Sub District" &&
    this.selectedState &&
    this.selectedDistrict &&
    this.selectedSubDist != "Sub District"
  ) {
    this.cropMonitoring
      .getSubDistrictId(this.selectedDistrict)
      .subscribe((response) => {
       var date = tmaxFilter;
       stLayer = `date_no%3D${date}%20and%20state%3D%27${this.selectedState}%27%26%26district%3D%27${this.selectedDistrict}%27%26%26tehsil%3D%27${this.selectedSubDist}%27`   
       this.plotWMS(layer,stLayer  )


      });
  }
   else if (
    this.selectedState == "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) { 
    stLayer = "date_no%3D" +tmaxFilter;
 
    
    this.plotWMS(layer,stLayer)
  } 
}

plotSP(layer,spiFilter){
  this.isSlider = true;
  this.unSubscribeSlider()
  var stLayer = '';
  if (
    this.selectedState &&
    this.selectedState != "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) 
   this.cropMonitoring.getStateId(this.selectedState).subscribe(response => {
    stLayer ="date_no%3D" +spiFilter+ '%20and%20sid%20%3D' + response[0].state_id;
    this.plotWMS(layer,stLayer)
  });
   else if (
    this.selectedDistrict &&
    this.selectedDistrict != "District" &&
    this.selectedState &&
    this.selectedSubDist == "Sub District"
  ) {
    this.cropMonitoring
      .getDistrictId(this.selectedDistrict)
      .subscribe((response) => {
        stLayer = "date_no%3D" +spiFilter + ' and did =' + response[0].district_id;
       this.plotWMS(layer,stLayer )
      });
  } 
  else if (
    this.selectedSubDist &&
    this.selectedSubDist != "Sub District" &&
    this.selectedState &&
    this.selectedDistrict &&
    this.selectedSubDist != "Sub District"
  ) {
    this.cropMonitoring
      .getSubDistrictId(this.selectedDistrict)
      .subscribe((response) => {
       var date = spiFilter;
       stLayer = `date_no%3D${date}%20and%20state%3D%27${this.selectedState}%27%26%26district%3D%27${this.selectedDistrict}%27%26%26tehsil%3D%27${this.selectedSubDist}%27`   
       this.plotWMS(layer,stLayer  )


      });
  }
   else if (
    this.selectedState == "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) { 
    stLayer = "date_no%3D" +spiFilter;
    this.plotWMS(layer,stLayer)
  } 
}

plotIrriLayer(){
  this.isSlider = false;
  this.unSubscribeSlider()
  var stLayer = '';
  if (
    this.selectedState &&
    this.selectedState != "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) {
   stLayer = "state_name"+"%3C%3E%27"+this.selectedState+"%27"
    this.plotWMS('cite%3ACP_IRRIGATION'+'_GP',stLayer)
  } else if (
    this.selectedDistrict &&
    this.selectedDistrict != "District" &&
    this.selectedState &&
    this.selectedSubDist == "Sub District"
  ) {
    this.cropMonitoring
      .getDistrictId(this.selectedDistrict)
      .subscribe((response) => {
        stLayer = "district%3C%3E%27" + this.selectedDistrict + "%27";
       this.plotWMS('cite%3ACP_IRRIGATION'+'_GP',stLayer )
      });
  } 
  else if (
    this.selectedSubDist &&
    this.selectedSubDist != "Sub District" &&
    this.selectedState &&
    this.selectedDistrict &&
    this.selectedSubDist != "Sub District"
  ) {
    this.cropMonitoring
      .getSubDistrictId(this.selectedDistrict)
      .subscribe((response) => {
        stLayer = "block%3C%3E%27" + this.selectedSubDist + "%27";
      this.plotWMS('cite%3ACP_IRRIGATION'+'_GP',stLayer  )

      });
  }
   else if (
    this.selectedState == "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) {
    stLayer = "state_name%3D%271%27";
    this.plotWMS('cite%3ACP_IRRIGATION'+'_GP',stLayer)
  }

}


plotCceLayer(){
  this.isSlider = false;
  this.unSubscribeSlider()
  var stLayer = '';
  if (
    this.selectedState &&
    this.selectedState != "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) {
   stLayer = ""
    this.plotSingleWMS('cite%3Aarms_data_cce_points', stLayer)
  } else if (
    this.selectedDistrict &&
    this.selectedDistrict != "District" &&
    this.selectedState &&
    this.selectedSubDist == "Sub District"
  ) {
    this.cropMonitoring
      .getDistrictId(this.selectedDistrict)
      .subscribe((response) => {
        stLayer = "";
       this.plotSingleWMS('cite%3Aarms_data_cce_points',stLayer )
      });
  } 
  else if (
    this.selectedSubDist &&
    this.selectedSubDist != "Sub District" &&
    this.selectedState &&
    this.selectedDistrict &&
    this.selectedSubDist != "Sub District"
  ) {
    this.cropMonitoring
      .getSubDistrictId(this.selectedDistrict)
      .subscribe((response) => {
        stLayer = "";
      this.plotSingleWMS('cite%3Aarms_data_cce_points',stLayer  )

      });
  }
   else if (
    this.selectedState == "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) {
    stLayer = '';
    this.plotSingleWMS('cite%3Aarms_data_cce_points',stLayer)
  }
}
plotRisk(){
  this.isSlider = false;
  this.unSubscribeSlider()
  var stLayer = '';
  if (
    this.selectedState &&
    this.selectedState != "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) {
    stLayer   =  `state_name%3D%27${this.selectedState}%27`   
    this.plotSingleWMS('cite:risk_pincode',stLayer)
  } else if (
    this.selectedDistrict &&
    this.selectedDistrict != "District" &&
    this.selectedState &&
    this.selectedSubDist == "Sub District"
  ) {
    this.cropMonitoring
      .getDistrictId(this.selectedDistrict)
      .subscribe((response) => {
       stLayer =`district%3D%27${this.selectedDistrict}%27`
       this.plotSingleWMS('cite:risk_pincode',stLayer )
      });
  } 
  else if (
    this.selectedSubDist &&
    this.selectedSubDist != "Sub District" &&
    this.selectedState &&
    this.selectedDistrict &&
    this.selectedSubDist != "Sub District"
  ) {
    this.cropMonitoring
      .getSubDistrictId(this.selectedDistrict)
      .subscribe((response) => {

        //"block%3D%27Fatehpur%20Sikri%27"
        stLayer =`block%3D%27${this.selectedSubDist}%27`
        //stLayer = "block%3D%27" + this.selectedSubDist + "%27";
      this.plotSingleWMS('cite:risk_pincode',stLayer  )

      });
  }
   else if (
    this.selectedState == "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) {
    stLayer = "";
    
    this.plotSingleWMS('cite:risk_pincode',stLayer)
  }
}


aiCrop(){
  this.isSlider = false;
  this.unSubscribeSlider()
  var stLayer = '';
  if (
    this.selectedState &&
    this.selectedState != "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) {
    stLayer   =  `state_name%20%3C%3E%27${this.selectedState}%27`   
    this.plotSingleWMS('cite%3AINDIA_MLCROPRABI2021_250M_GP',stLayer)
  } else if (
    this.selectedDistrict &&
    this.selectedDistrict != "District" &&
    this.selectedState &&
    this.selectedSubDist == "Sub District"
  ) {
    this.cropMonitoring
      .getDistrictId(this.selectedDistrict)
      .subscribe((response) => {


      stLayer =`district%3C%3E%27${this.selectedDistrict}%27`
     
       this.plotSingleWMS('cite%3AINDIA_MLCROPRABI2021_250M_GP',stLayer )
      });
  } 
  else if (
    this.selectedSubDist &&
    this.selectedSubDist != "Sub District" &&
    this.selectedState &&
    this.selectedDistrict &&
    this.selectedSubDist != "Sub District"
  ) {
    this.cropMonitoring
      .getSubDistrictId(this.selectedDistrict)
      .subscribe((response) => {

        //"block%3D%27Fatehpur%20Sikri%27"
        stLayer =`block%3D%27${this.selectedSubDist}%27`

        //stLayer = "block%3D%27" + this.selectedSubDist + "%27";
      this.plotSingleWMS('cite%3AINDIA_MLCROPRABI2021_250M_GP',stLayer  )

      });
  }
   else if (
    this.selectedState == "All State" &&
    this.selectedDistrict == "District" &&
    this.selectedSubDist == "Sub District"
  ) {
    stLayer = "state_name%3D%271%27";
    
    this.plotSingleWMS('cite%3AINDIA_MLCROPRABI2021_250M_GP',stLayer)
  }

}


isPlay:boolean = true;
sliderSubscription: Subscription;
sliderSource = interval(2000);
isSlider:boolean = false;

toggleSlider() {
  this.isPlay = ! this.isPlay;
      if(!this.isPlay) {
      this.sliderSubscription = this.sliderSource.subscribe((val) => this.configSliderTick(val));
    } else {
      this.unSubscribeSlider()
      }
}

unSubscribeSlider() {
  this.sliderSubscription && this.sliderSubscription.unsubscribe();
}

configSliderTick(val:any) {
  if(this.sliderLayers.length-1 >= val) {
    this.selectedLayerConfig(this.sliderLayers[val]);
    this.sliderTickIndex = val;
   this.selectedSliderDate = this.sliderLayers[this.sliderTickIndex]['wmsParams']['date']
  } else {
    this.unSubscribeSlider()
  }
 
}

selectedLayerConfig(layer: any) {
  this.onSliderTickChange(layer,0)
}







onSliderTickChange(layer:any,index:any) {
  this.sliderTickIndex = index;
  this.selectedSliderDate = layer['date']
  if(this.selectedLayer == 'Greenness Layer' || this.selectedLayer ==  'SM Normal') {
    this.plotWMS(layer['layer'],this.stLayer )
  } else if(this.selectedLayer == 'Maximum Temperature') {
    this.plotTmax(layer['layer'],layer['val'])
    console.log(layer,'tmax');

  } else if(this.selectedLayer == 'Precipitation Index') {
    console.log(layer,'pi');
    
    this.plotSP(layer['layer'],layer['val'])
    
  }
}

formatDate(item:any) {  
  var day = item.range.toString().split('-')[0];
  var month = item.day.toString().split('-')[0];
  return day + '-' + month + '-' + item.year
}




}
