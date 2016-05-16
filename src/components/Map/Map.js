import React, { Component, PropTypes } from 'react';
import L from 'leaflet-headless';
import d3 from 'd3';

const NYC = [40.7317, -73.9841];

const mercatorXofLongitude = (lon) => lon * 20037508.34 / 180;
const mercatorYofLatitude = (lat) =>
        (Math.log(Math.tan((90 + lat) * Math.PI / 360)) /
         (Math.PI / 180)) * 20037508.34 / 180;

function updateNodes(quadtree) {
  /* eslint-disable no-param-reassign */
  const nodes = [];
  quadtree.depth = 0;

  quadtree.visit((node, x1, y1, x2, y2) => {
    const nodeRect = {
      left: mercatorXofLongitude(x1),
      right: mercatorXofLongitude(x2),
      bottom: mercatorYofLatitude(y1),
      top: mercatorYofLatitude(y2),
    };
    node.width = (nodeRect.right - nodeRect.left);
    node.height = (nodeRect.top - nodeRect.bottom);

    if (node.depth === 0) {
      console.log(`width: ${node.width} height: ${node.height}`);
    }
    nodes.push(node);
    for (let i = 0; i < 4; i++) {
      if (node.nodes[i]) node.nodes[i].depth = node.depth + 1;
    }
  });
  return nodes;
}


const cscale = d3
        .scale
        .linear()
        .domain([1, 3])
        .range([
          '#ff0000', '#ff6a00',
          '#ffd800', '#b6ff00',
          '#00ffff', '#0094ff',
        ]);


function getZoomScale(leafletMap) {
  const mapWidth = leafletMap.getSize().x;
  const bounds = leafletMap.getBounds();
  const planarWidth = mercatorXofLongitude(bounds.getEast()) -
          mercatorXofLongitude(bounds.getWest());
  const zoomScale = mapWidth / planarWidth;
  return zoomScale;
}

class TweetMap extends Component {

  static propTypes = {
    tweets: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.map = L.map('map').setView(NYC, 12);
    L.tileLayer('http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png').addTo(this.map);
    this.map.on('moveend', this._updateBounds.bind(this));
    this._updateBounds();

    this.svg = d3
      .select(this.map.getPanes().overlayPane)
      .append('svg');

    this.g = this.svg
      .append('g')
      .attr('class', 'leaflet-zoom-hide tweet-locations');

    const _map = this.map;
    function projectPoint(x, y) {
      const point = _map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    const transform = d3.geo.transform({ point: projectPoint });
    this.path = d3.geo.path().projection(transform);
  }

  _updateBounds() {
    this.setState({ bounds: this.map.getBounds() });
  }

  search(quadtree, x0, y0, x3, y3) {
    const pts = [];
    let subPixel = false;
    let subPts = [];
    const scale = getZoomScale(this.map);
    let counter = 0;
    quadtree.visit((node, x1, y1, x2, y2) => {
      const p = node.point;
      const pwidth = node.width * scale;
      const pheight = node.height * scale;
      // -- if this is too small rectangle only count the branch and set opacity
      if ((pwidth * pheight) <= 1) {
        // start collecting sub Pixel points
        subPixel = true;
      } else { // -- jumped to super node large than 1 pixel
        // end collecting sub Pixel points
        if (subPixel && subPts && subPts.length > 0) {
          subPts[0].group = subPts.length;
          pts.push(subPts[0]); // add only one todo calculate intensity
          counter += subPts.length - 1;
          subPts = [];
        }
        subPixel = false;
      }
      if ((p) && (p.x >= x0) && (p.x < x3) && (p.y >= y0) && (p.y < y3)) {
        if (subPixel) {
          subPts.push(p.all);
        } else {
          if (p.all.group) {
            delete (p.all.group);
          }
          pts.push(p.all);
        }
      }
      return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    return pts;
  }

  redrawSubset(subset) {
    this.path.pointRadius(3);// * scale);
    const bounds = this.path.bounds({ type: 'FeatureCollection', features: subset });
    const padding = 30;
    const topLeft = bounds[0].map(x => x - padding);
    const bottomRight = bounds[1].map(x => x + padding);

    this.svg.attr('width', bottomRight[0] - topLeft[0])
      .attr('height', bottomRight[1] - topLeft[1])
      .style('left', `${topLeft[0]}px`)
      .style('top', `${topLeft[1]}px`);

    this.g.attr('transform', `translate(${-topLeft[0]}, ${-topLeft[1]})`);

    const points = this.g.selectAll('path')
          .data(subset, d => d.id_str);
    points.enter().append('path').style('fill', '#ffd800');
    points.exit().remove();
    points.attr('d', this.path);

    points.style('fill-opacity', d => d.group ? (d.group * 0.1) + 0.2 : 1);
  }


  render() {
    const points = this.props.tweets.map((tweet) => ({
      x: tweet.coordinates.coordinates[0],
      y: tweet.coordinates.coordinates[1],
      all: {
        id_str: tweet.id_str,
        type: 'Feature',
        geometry: tweet.coordinates,
      },
    }));
    this.qtree = d3.geom.quadtree(points);
    updateNodes(this.qtree);
    global.qtree = this.qtree
    const bounds = this.state.bounds;
    if (bounds) {
      const subset = this.search(this.qtree,
                                 bounds.getWest(),
                                 bounds.getSouth(),
                                 bounds.getEast(),
                                 bounds.getNorth());
      this.redrawSubset(subset);
    }
    return (
      <div id="map" style={{ minHeight: '200px' }} className="App_fill_2Je">
      </div>
    );
  }

}

export default TweetMap;
