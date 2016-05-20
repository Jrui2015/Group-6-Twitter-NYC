import React, { Component, PropTypes } from 'react';
import L from 'leaflet-headless';
import d3 from 'd3';
import makePointFeature from './utils';

const NYC = [40.7317, -73.9841];

const MIN_RADIUS = 3;
const radiusScale = d3.scale.sqrt();

/* eslint-disable no-param-reassign */

class TweetMap extends Component {

  static propTypes = {
    tweets: PropTypes.array.isRequired,
    newTweetLocation: PropTypes.object,
    nodesInBounds: PropTypes.array,
    onBoundsChange: PropTypes.func.isRequired,
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
      .attr('class', 'leaflet-zoom-hide tweet-locations')
      .attr('id', 'clusters');

    const _map = this.map;
    function projectPoint(x, y) {
      const point = _map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    const transform = d3.geo.transform({ point: projectPoint });
    this.path = d3.geo.path().projection(transform);
  }

  _updateRscale() {
    const size = this.map.getSize();
    const maxRadius = Math.min(size.x, size.y) / 15;
    const totalSize = this.props.nodesInBounds
            .map(d => d.size)
            .reduce((a, b) => a + b, 0);
    this.rscale = radiusScale
      .domain([1, totalSize])
      .range([MIN_RADIUS, maxRadius]);
  }

  _updateBounds() {
    const bounds = this.map.getBounds();
    this.props.onBoundsChange([bounds.getWest(),
                               bounds.getSouth(),
                               bounds.getEast(),
                               bounds.getNorth()]);
  }

  makeClusters() {
    const clusters = [];
    this.props.nodesInBounds.forEach(node => node.visit((nd, data, l, t, r, b) => {
      const westNorth = this.path.centroid(makePointFeature([l, b]));
      const eastSouth = this.path.centroid(makePointFeature([r, t]));
      const bound = Math.min(eastSouth[0] - westNorth[0], eastSouth[1] - westNorth[1]) * 0.2;
      const radius = this.rscale(nd.size);
      const isDense = (bound <= radius || nd.isLeaf);
      if (isDense) {
        nd.pixelLocation = this.path.centroid(makePointFeature(nd.centroid));
        clusters.push(nd);
      }
      return isDense;
    }));
    return clusters;
  }

  redrawSubset(nodes) {
    if (!nodes.length) return;
    const features = [].concat(...nodes.map(d => d.geo));

    const bounds = this.path.bounds({ type: 'FeatureCollection', features });
    const padding = 100;
    const topLeft = bounds[0].map(x => x - padding);
    const bottomRight = bounds[1].map(x => x + padding);
    this.svg.attr('width', bottomRight[0] - topLeft[0])
      .attr('height', bottomRight[1] - topLeft[1])
      .style('left', `${topLeft[0]}px`)
      .style('top', `${topLeft[1]}px`);
    this.g.attr('transform', `translate(${-topLeft[0]}, ${-topLeft[1]})`);

    const clusters = this.makeClusters();
    const circles = this.g.selectAll('circle')
            .data(clusters, d => d.id);

    circles
      .enter()
      .append('circle')
      .style({
        fill: '#ffd800',
        opacity: 0.6,
      });

    circles.exit().remove();
    circles.attr({
      cx: d => d.pixelLocation[0],
      cy: d => d.pixelLocation[1],
      r: d => this.rscale(d.size),
    });

    /*
    const projected = nodes.map(nd => ({
      topLeft: this.path.centroid(nd.geo[0]),
      bottomRight: this.path.centroid(nd.geo[1]),
      id: nd.id,
      node: nd.node,
    }));
    projected.forEach(d => {
      d.width = d.bottomRight[0] - d.topLeft[0];
      d.height = d.bottomRight[1] - d.topLeft[1];
      d.centroid = this.path.centroid(makePointFeature(d.node.centroid));
    });

    const rects = this.g.selectAll('rect').data(projected, d => d.id);
    rects.enter().append('rect');
    rects.exit().remove();
    rects.attr({
      x: nd => nd.topLeft[0],
      y: nd => nd.topLeft[1],
      width: nd => nd.width,
      height: nd => nd.height,
    }).style({
      stroke: 'blue',
      fill: 'none',
    });

    const sizes = this.g.selectAll('text').data(projected, d => d.id);
    sizes.enter().append('text').text(d => d.node.size);
    sizes.exit().remove();
    sizes.attr({
      x: d => d.centroid[0],
      y: d => d.centroid[1],
    }).style({
      'text-anchor': 'center',
      fill: 'yellow',
    });
    //*/
  }


  render() {
    const nodes = this.props.nodesInBounds;
    if (nodes) {
      this._updateRscale();
      const rects = nodes.map(nd => ({
        geo: [
          makePointFeature([nd.l, nd.b]),
          makePointFeature([nd.r, nd.t]),
        ],
        id: nd.id,
        node: nd,
      }));
      this.redrawSubset(rects);
    }

    return (
      <div id="map" style={{ minHeight: '200px' }} className="App_fill_2Je">
      </div>
    );
  }

}

export default TweetMap;
