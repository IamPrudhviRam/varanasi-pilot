import { Component } from '@angular/core';
import { LatLngBounds } from '@agm/core';
import { blueLatLngs } from '../constants/blue-lat-lngs';
import { yellowLatLngs } from '../constants/yellow-lat-lngs';
import { orangeLatLngs } from '../constants/orange-lat-lngs';
import { default as varanasiAllGeojsons } from '../constants/varanasi_all.json';
import { HttpClient } from '@angular/common/http';
import { stringify } from '@angular/compiler/src/util';
import { HttpParams } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

declare var google: any;

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  zoom: number = 8;

  // initial center position for the map
  latti: number = 25.3176;
  longi: number = 82.9739;

  distanceInMeters: number = 5000;

  allGeojsons: any = varanasiAllGeojsons;
  allZonePaths: any[] = [];
  allTempProps: Array<any> = [];
  isVisibleMarker: boolean = false;
  animation: any = ''; //BOUNCE
  latCenter: number;
  lngCenter: number;
  StrokeColor: string = 'white';
  hoveredNo: number | null;
  latLngText: string = '';

  blueLatLngs: any = blueLatLngs;
  yellowLatLngs: any = yellowLatLngs;
  orangeLatLngs: any = orangeLatLngs;

  circleWhite = '#e6e6e6';
  circleOrange = '#8cff66';
  circleBlue = '#4da6ff'; // light #b3daff

  strokeGrey = '#bfbfbf';

  strokeYellow = '#e6e600';
  strokeOrange = '#66ff33';
  strokeBlue = '#b3daff';

  strokeWeight = 1;
  fillOpacity = 0.1;

  hideTen: boolean = false;
  showId: boolean = true;
  upIcon: any = {
    url: 'https://img.icons8.com/material-outlined/9/ADADAD/up.png',
    scaledSize: {
      width: 1,
      height: 9,
    },
  };
  icon: any = {
    // url: 'https://img.icons8.com/color/24/null/map-pin.png',
    // url: 'https://img.icons8.com/fluency/24/null/map-pin.png',
    // url: 'https://img.icons8.com/fluency/' + 24 + '/000000/map-pin.png',
    url: 'https://img.icons8.com/material-sharp/' + 24 + '/D12020/marker.png',

    // url: 'https://img.icons8.com/color/' + 24 + '/000000/marker--v1.png',
    // url: '',
    scaledSize: {
      width: 24,
      height: 24,
    },
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.createGeoPath();
    // console.log('all jsons:', this.allGeojsons);
    // console.log('all paths:', this.allZonePaths);
    // console.log('all centers:', this.allTempProps);
    // console.log('currentTempType', this.currentTempType);
  }

  mapReady(map: any) {
    const bonds: LatLngBounds = new google.maps.LatLngBounds();

    bonds.extend(new google.maps.LatLng(this.latti, this.longi));

    this.allGeojsons.features.map((feature: any) => {
      feature.geometry.coordinates[0][0].map((latLng) => {
        bonds.extend(new google.maps.LatLng(latLng[1], latLng[0]));
      });
    });

    this.blueLatLngs.map((item: any) => {
      bonds.extend(new google.maps.LatLng(item[0], item[1]));
    });
    this.yellowLatLngs.map((item: any) => {
      bonds.extend(new google.maps.LatLng(item[0], item[1]));
    });
    this.orangeLatLngs.map((item: any) => {
      bonds.extend(new google.maps.LatLng(item[0], item[1]));
    });

    map.fitBounds(bonds);
  }

  getAltitude(lat, lng, index?) {
    // let endpoint = 'https://api.opentopodata.org/v1/aster30m?';
    let endpoint = 'https://api.gpxz.io/v1/elevation/point?';

    console.log('endpoint:', endpoint);
    // const paramsObj = {
    //   locations: lat.toString() + ',' + lng.toString(),
    // };
    const paramsObj = {
      lat: lat,
      lon: lng,
      'api-key': 'ak_ypfSVhVk_0IuHuxox4ULyoBI1',
    };
    const searchParams = new URLSearchParams(paramsObj);

    //https://api.opentopodata.org/v1/aster30m?
    // fetch(endpoint + new URLSearchParams(paramsObj)).then((response) => {
    //   console.log('response:', response);
    // });

    // fetch(endpoint + new URLSearchParams(paramsObj)).then((response) => {
    //   console.log('response:', response);
    // });
    setTimeout(() => {
      this.http.get(endpoint, { params: paramsObj }).subscribe(
        (response) => {
          console.log('response:', response['result']);
          let lat = response['result'].lat;
          let lng = response['result'].lon;
          let altitude = response['result'].elevation;
          let resolution = response['result'].resolution;
          if (index && lat && lng && altitude) {
            this.latLngText = '' + lat + ', ' + lng + ', ' + altitude;
            let arr = [lat, lng, altitude, resolution];
            this.blueLatLngs[index] = arr;
          } else if (lat && lng && altitude) {
            this.latLngText = '' + lat + ', ' + lng + ', ' + altitude;
            let arr = [lat, lng, altitude, resolution];
            this.blueLatLngs.push(arr);
          }
        },
        (error) => {
          if (index && lat && lng) {
            this.latLngText = '' + lat + ', ' + lng;
            let arr = [lat, lng];
            this.blueLatLngs[index] = arr;
          } else if (lat && lng) {
            this.latLngText = '' + lat + ', ' + lng;
            let arr = [lat, lng];
            this.blueLatLngs.push(arr);
          }
        }
      );
    }, 1000);
  }

  flattenArray(arr: Array<any>): number {
    let counterIndex: number = 0;
    while (arr.length == 1) {
      arr = arr.flat(counterIndex++);
    }
    return counterIndex - 1;
  }

  createGeoPath() {
    //multi-polygon
    this.allGeojsons.features.map((feature: any) => {
      let latLngArr: any[] = [];
      let iterableArray = feature.geometry.coordinates.flat(
        this.flattenArray(feature.geometry.coordinates)
      );

      iterableArray.map((item: any) => {
        let latLng = {
          lat: item[1],
          lng: item[0],
        };
        latLngArr.push(latLng);
      });

      // Calculating avg center for polygon & adding zone for hover
      this.allTempProps.push(
        this.averageCenter(iterableArray, feature.properties['Block Name'])
      );

      this.allZonePaths.push(latLngArr);
    });
  }

  zoomChange(zoom: any) {
    // console.log('zoom change:', zoom);

    let number = 24;
    if (zoom <= 8) {
      number = 36 - zoom;
    } else {
      number = 10 + 2 * zoom;
    }

    this.icon = {
      // url: 'https://img.icons8.com/color/' + number + '/null/map-pin.png',
      // url: 'https://img.icons8.com/fluency/' + number + '/null/map-pin.png',
      // url: 'https://img.icons8.com/fluency/' + number + '/000000/map-pin.png',
      // url: 'https://img.icons8.com/color/' + number + '/000000/marker--v1.png',
      url:
        'https://img.icons8.com/material-sharp/' +
        number +
        '/D12020/marker.png',

      // url: '',
      scaledSize: {
        width: number,
        height: number,
      },
    };
  }

  averageCenter(latLngArray: any[], tooltipContent: string) {
    let latSum = 0;
    let lngSum = 0;
    let pathlength = latLngArray.length;
    latLngArray.map((item: any[]) => {
      latSum += item[0];
      lngSum += item[1];
    });
    return [latSum / pathlength, lngSum / pathlength, tooltipContent];
  }

  polygonClicked(event: any, index: any) {
    let lat = Number(Number(event.latLng.lat()).toFixed(6));
    let lng = Number(Number(event.latLng.lng()).toFixed(6));

    this.getAltitude(lat, lng);
  }

  markerClicked(event: any, index) {
    this.blueLatLngs.splice(index, 1);
  }

  markerDragEnd(event: any, index) {
    let lat = Number(Number(event.coords.lat).toFixed(6));
    let lng = Number(Number(event.coords.lng).toFixed(6));
    // this.blueLatLngs[index] = [lat, lng];
    // this.latLngText = '' + lat + ', ' + lng;
    this.getAltitude(lat, lng, index);
  }

  setMouseOver(index: any, infoWindow: any) {
    this.isVisibleMarker = !this.isVisibleMarker;
    this.hoveredNo = index;
    this.latCenter = this.allTempProps[index][1];
    this.lngCenter = this.allTempProps[index][0];
    setTimeout(() => {
      infoWindow.open();
    });
  }

  setMouseOut(infoWindow: any) {
    this.isVisibleMarker = !this.isVisibleMarker;
    this.hoveredNo = null;
    setTimeout(() => {
      infoWindow.close();
    });
  }

  exportToXls(): any {
    let results = [];
    let headers = [
      ['Desired Lat Lngs'],
      ['Latitude', 'longitude', 'Altitude', 'Resolution'],
    ];
    console.log('blue lat lngs:', this.blueLatLngs);
    results = [...headers, ...this.blueLatLngs];
    let csvString = '';
    results.forEach((rowItem, rowIndex) => {
      rowItem.forEach((colItem, colindex) => {
        csvString += colItem + ',';
      });
      csvString += '\r\n';
    });
    csvString = 'data:application/csv,' + encodeURIComponent(csvString);
    let x = document.createElement('A');
    x.setAttribute('href', csvString);
    let dateString = new Date().toLocaleString();
    x.setAttribute('download', 'latlngs_' + dateString + '.csv');
    document.body.appendChild(x);
    x.click();
  }

  circleClicked(event: any) {
    console.log('clicked', event);
  }
  mouseOver(event: any) {
    console.log('mouse over', event);
  }
  mouseOut(event: any) {
    console.log('mouse over', event);
  }

  hideTenKms(event: any) {
    this.hideTen = !this.hideTen;
  }

  showIds(event: any) {
    this.showId = !this.showId;
  }
}
