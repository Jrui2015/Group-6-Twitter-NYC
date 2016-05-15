import React, { Component } from 'react';
import L from 'leaflet-headless';

const NYC = [40.7317, -73.9841];

class TweetMap extends Component {

  componentDidMount() {
    const map = L.map('map').setView(NYC, 12);
    L.tileLayer('http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png').addTo(map);
  }

  render() {
    return (
      <div id="map" style={{ minHeight: '200px' }} className="App_fill_2Je">
      </div>
    );
  }
}

export default TweetMap;
