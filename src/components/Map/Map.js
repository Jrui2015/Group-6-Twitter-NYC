import React, { Component, PropTypes } from 'react';
import L from 'leaflet-headless';
import d3 from 'd3';
import { Corpus, Terms, STOPWORDS } from 'text-miner';
import Cloud from '../Cloud';

// XXX do some evil here
let counter = 0;
function addCounter() {
  counter = (++counter) % 10;
  return counter;
}

const NYC = [40.7317, -73.9841];

const MIN_RADIUS = 3;
const radiusScale = d3.scale.sqrt();

/* eslint-disable no-param-reassign */

function bottomUp(node, base, recursive) {
  let ret;
  if (node.leaf && node.point) {
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
    .reduce((a, b) => a + b, 0);
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

function visit(node, cb) {
  cb(node);
  node.nodes.filter(e => e).forEach(e => visit(e, cb));
}

function countKeywords(clusters) {
  clusters.filter(n => n.size > 5).forEach(node => {
    let doc = '';
    visit(node, n => {
      if (n.point) {
        doc += ` ${n.point.text}`;
      }
    });
    const corpus = new Corpus([doc]);
    corpus
      .trim()
      .toLower()
      .removeInterpunctuation()
      .removeNewlines()
      .removeWords(STOPWORDS.EN)
      .removeWords(['#']);
    node.dict = new Terms(corpus).findFreqTerms(10);
  });
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
    if (addCounter() === 2) {
      countKeywords([quadtree]);
      this.dict = quadtree.dict;
      global.dict = quadtree.dict;
    }
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
    countKeywords(clusters);
    global.clusters = clusters
    //global.data = quadtree
    return clusters;
  }


  redrawSubset(subset) {
    const bounds = this.path.bounds({ type: 'FeatureCollection', features: subset });
    const padding = 100;
    const topLeft = bounds[0].map(x => x - padding);
    const bottomRight = bounds[1].map(x => x + padding);

    this.svg.attr('width', bottomRight[0] - topLeft[0])
      .attr('height', bottomRight[1] - topLeft[1])
      .style('left', `${topLeft[0]}px`)
      .style('top', `${topLeft[1]}px`);

    this.g.attr('transform', `translate(${-topLeft[0]}, ${-topLeft[1]})`);

    const projected = subset.map(feature => ({
      id_str: feature.id_str,
      text: feature.text,
      name: feature.name,
      x: this.path.centroid(feature)[0],
      y: this.path.centroid(feature)[1],
    }));
    const groups = d3.geom.quadtree(projected);
    const clusters = this.makeClusters(groups);

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
    this.qtree = d3.geom.quadtree(points);
    //global.qtree = this.qtree
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
      <div className="App_fill_2Je">
        <div id="map" style={{ minHeight: '200px' }} className="App_fill_2Je"></div>
      </div>
    );
  }

}

export default TweetMap;
