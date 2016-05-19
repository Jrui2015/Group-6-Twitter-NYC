import React, { Component, PropTypes } from 'react';
import L from 'leaflet-headless';
import d3 from 'd3';
import QuadTree from './quadtree';
global.QuadTree = QuadTree

const NYC = [40.7317, -73.9841];

const MIN_RADIUS = 3;
const radiusScale = d3.scale.sqrt();

/* eslint-disable no-param-reassign */

function bottomUp(node, base, recursive) {
  let ret;
  if (node.leaf) {
    ret = base(node);
  } else {
    const nodes = node.nodes.filter(e => e);
    ret = recursive(node, nodes);
  }
  return ret;
}

const computeSize = node => bottomUp(node, (nd) => {
  nd.size = 1;
  return 1;
}, (nd, nodes) => {
  nd.size = nodes
    .map(n => computeSize(n))
    .reduce((a, b) => a + b);
  return nd.size;
});

const computeCentroids = node => bottomUp(node, (nd) => {
  nd.cx = nd.x;
  nd.cy = nd.y;
  return [{ pos: nd.cx, size: 1 }, { pos: nd.cy, size: 1 }];
}, (nd, nodes) => {
  const centroids = nodes.map(n => computeCentroids(n));
  const sum = (a, b) => ({
    pos: (a.pos * a.size + b.pos * b.size) / (a.size + b.size),
    size: a.size + b.size,
  });
  nd.cx = centroids.map(n => n[0]).reduce(sum, { pos: 0, size: 0 }).pos;
  nd.cy = centroids.map(n => n[1]).reduce(sum, { pos: 0, size: 0 }).pos;
  return [{ pos: nd.cx, size: nd.size }, { pos: nd.cy, size: nd.size }];
});

const cscale = d3
        .scale
        .linear()
        .domain([1, 3])
        .range([
          '#ff0000', '#ff6a00',
          '#ffd800', '#b6ff00',
          '#00ffff', '#0094ff',
        ]);


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
    global.map = this.map
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
    quadtree.visit((node, x1, y1, x2, y2) => {
      const pt = node.point;
      if (pt && pt.x >= x0 && pt.x < x3 && pt.y >= y0 && pt.y < y3) {
        pts.push(pt.all);
      }
      return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    return pts;
  }

  makeClusters(quadtree) {
    const clusters = [];
    computeSize(quadtree);
    computeCentroids(quadtree);
    const size = this.map.getSize();
    const maxRadius = Math.min(size.x, size.y) / 15;
    this.rscale = radiusScale
            .domain([1, quadtree.size])
            .range([MIN_RADIUS, maxRadius]);
    let id = 0;
    quadtree.visit((node) => {
      node.id = id++;
    });
    quadtree.visit((node, x1, y1, x2, y2) => {
      const radius = this.rscale(node.size);
      const bound = Math.min(x2 - x1, y2 - y1) * 0.2;
      if (bound <= radius) {
        clusters.push(node);
        return true;
      }
      if (node.leaf) {
        clusters.push(node);
      }
      return false;
    });
    global.data = quadtree
    global.cluster = clusters
    return clusters;
  }


  redrawSubset(nodes) {
    global.nodes = nodes
    const features = [].concat(...nodes.map(d => d.geo));
    global.features = features
    const bounds = this.path.bounds({ type: 'FeatureCollection', features });
    const padding = 100;
    const topLeft = bounds[0].map(x => x - padding);
    const bottomRight = bounds[1].map(x => x + padding);

    this.svg.attr('width', bottomRight[0] - topLeft[0])
      .attr('height', bottomRight[1] - topLeft[1])
      .style('left', `${topLeft[0]}px`)
      .style('top', `${topLeft[1]}px`);

    this.g.attr('transform', `translate(${-topLeft[0]}, ${-topLeft[1]})`);

    /*
    const projected = subset.map(feature => ({
      id_str: feature.id_str,
      text: feature.text,
      name: feature.name,
      x: this.path.centroid(feature)[0],
      y: this.path.centroid(feature)[1],
    }));
    const groups = d3.geom.quadtree(projected);
    const clusters = this.makeClusters(groups);
    // TODO use clusters
    const points = this.g.selectAll('circle')
          .data(clusters, d => d.id);
    points.enter().append('circle').style({
      fill: '#ffd800',
      opacity: 0.6,
    });
    points.exit().remove();
    points.attr({
      cx: d => d.cx,
      cy: d => d.cy,
      r: d => this.rscale(d.size),
    });

    points.style('fill-opacity', d => d.group ? (d.group * 0.1) + 0.2 : 1);
    */
    const projected = nodes.map(nd => ({
      topLeft: this.path.centroid(nd.geo[0]),
      bottomRight: this.path.centroid(nd.geo[1]),
      id: nd.id,
      node: nd.node,
    }));
    projected.forEach(d => {
      d.width = d.bottomRight[0] - d.topLeft[0];
      d.height = d.bottomRight[1] - d.topLeft[1];
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
      x: d => d.topLeft[0] + d.width / 2,
      y: d => d.topLeft[1] + d.height / 2,
    }).style({
      'text-anchor': 'center',
      fill: 'yellow',
    });
  }


  render() {
    const points = this.props.tweets.map((tweet) => ({
      x: tweet.coordinates.coordinates[0],
      y: tweet.coordinates.coordinates[1],
      all: {
        id_str: tweet.id_str,
        text: tweet.text,
        name: tweet.user.name,
        type: 'Feature',
        geometry: tweet.coordinates,
      },
    }));
    //this.qtree = d3.geom.quadtree(points);
    this.qtree = new QuadTree([-180, -90, 180, 90], points);
    global.qtree = this.qtree
    global.point = points[0]
    global.path = this.path

    const bounds = this.state.bounds;
    if (bounds) {
      let nodes = this.qtree.nodesInBounds([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()], 0.0000000001);
      nodes = nodes.map(nd => ({
        geo: [{
          type: 'Feature',
          geometry: { coordinates: [nd.l, nd.b], type: 'Point' },
        }, {
          type: 'Feature',
          geometry: { coordinates: [nd.r, nd.t], type: 'Point' },
        }],
        id: nd.id,
        node: nd,
      }));
      this.redrawSubset(nodes);
    }

    return (
      <div id="map" style={{ minHeight: '200px' }} className="App_fill_2Je">
      </div>
    );
  }

}

export default TweetMap;
