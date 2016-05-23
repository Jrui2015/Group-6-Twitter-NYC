import React, { Component, PropTypes } from 'react';
import L from 'leaflet-headless';
import d3 from 'd3';
import makePointFeature from './utils';

const NYC = [40.7317, -73.9841];

const MIN_RADIUS = 3;
const radiusScale = d3.scale.sqrt();
const colorScale = d3.scale.category20();

/* eslint-disable no-param-reassign */

class TweetMap extends Component {

  static propTypes = {
    tweets: PropTypes.array.isRequired,
    newTweetLocation: PropTypes.object,
    nodesInBounds: PropTypes.array,
    onBoundsChange: PropTypes.func.isRequired,
    onRemoveKeyword: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.map = L.map('map').setView(NYC, 13);
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

    this.animationLayer = this.svg
      .append('g')
      .attr('class', 'leaflet-zoom-hide animation')
      .attr('id', 'animation');

    d3.select('.leaflet-control-container')
      .append('div')
      .attr('id', 'map-overlap')
      .style('transform', 'translate3d(0px, 0px, 100px)')
      .append('svg')
      .attr('id', 'legend-layer')
      .append('g')
      .attr('id', 'legend');

    d3.select('#legend-layer')
      .append('g')
      .attr('id', 'keywords');

    const _map = this.map;
    function projectPoint(x, y) {
      const point = _map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    const transform = d3.geo.transform({ point: projectPoint });
    this.path = d3.geo.path().projection(transform);
  }

  _updateRscale() {
    if (!this.map) { return; }
    const size = this.map.getSize();
    const maxRadius = Math.min(size.x, size.y) / 20;
    const scales = [];
    const sizes = [];

    let maxSize = this.props.nodesInBounds
            .map(d => d.size)
            .reduce((a, b) => Math.max(a, b), 0);
    maxSize = Math.max(50, maxSize);

    for (let r = maxRadius, s = maxSize; r > MIN_RADIUS && s > 1; r /= Math.sqrt(5), s /= 5) {
      scales.unshift(r);
      sizes.unshift(s);
    }

    this.legendScales = scales;
    this.legendSizes = sizes;
    this.rscale = radiusScale
      .domain(sizes)
      .range(scales);
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
    const newLoc = this.props.newTweetLocation ?
            this.props.newTweetLocation.coordinates :
            [Infinity, Infinity];

    // let defColor = this.props.keywords.length ? '#ccc' : '#ffd800';
    const defColor = '#ccc';
    this.cScale = colorScale.domain(this.props.keywords.slice(0).sort());
    this.props.nodesInBounds.forEach(node => node.visit((nd, data, l, t, r, b) => {
      const westNorth = this.path.centroid(makePointFeature([l, b]));
      const eastSouth = this.path.centroid(makePointFeature([r, t]));
      const bound = Math.min(eastSouth[0] - westNorth[0], eastSouth[1] - westNorth[1]) * 0.175;
      const radius = this.rscale(nd.size);
      const isDense = (bound <= radius || nd.isLeaf);
      nd.color = defColor;
      if (isDense) {
        nd.pixelLocation = this.path.centroid(makePointFeature(nd.centroid));
        if (l <= newLoc[0] && newLoc[0] <= r &&
            t <= newLoc[1] && newLoc[1] <= b) {
          this.updatedCluster = nd;
        }
        let haveKeywords = 0;
        this.props.keywords.slice(0).reverse().forEach(k => {
          if (nd.freqs && nd.freqs.freqs.get(k)) {
            haveKeywords++;
            nd.color = this.cScale(k);
          }
        });
        if (haveKeywords <= 1 || nd.isLeaf) {
          clusters.push(nd);
        } else {
          return false;
        }
      }
      return isDense;
    }));
    return clusters;
  }

  redrawSubset(nodes) {
    if (!nodes.length || !this.path) return;
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
    this.animationLayer.attr('transform', `translate(${-topLeft[0]}, ${-topLeft[1]})`);

    const clusters = this.makeClusters();
    global.clusters = clusters
    const circles = this.g.selectAll('circle')
            .data(clusters, d => d.id);

    circles
      .enter()
      .append('circle');

    circles.exit().remove();
    circles.attr({
      cx: d => d.pixelLocation[0],
      cy: d => d.pixelLocation[1],
      r: d => this.rscale(d.size),
    }).style({
      fill: d => d.color,
      opacity: d => d.color === '#ccc' ? 0.4 : 0.8,
    });

    // animiation for incoming tweets
    if (this.updatedCluster && this.updatedLocation !== this.props.newTweetLocation) {
      const node = this.updatedCluster;
      this.updatedCluster = null;
      const r = this.rscale(node.size);
      this.updatedLocation = this.props.newTweetLocation;
      [2.4, 2.7, 3.0].forEach(scale => {
        d3.select('#animation')
          .append('circle')
          .attr({
            cx: node.pixelLocation[0],
            cy: node.pixelLocation[1],
            r,
          })
          .style({ fill: node.color, opacity: 0.2, stroke: '#bbc300' })
          .transition()
          .duration(2000 / scale)
          .attr({ r: r * scale })
          .remove();
      });
    }

    // top topic list
    if (this.props.keywords.length) {
      const g = d3.select('#keywords');
      const padLeft = 40;
      const padTop = 30;
      g.attr('transform', `translate(${padLeft}, ${padTop})`);
      const list = this.props.keywords.map(kw => ({
        keyword: kw,
        color: this.cScale(kw),
        id: this.props.keywords.indexOf(kw),
      }));
      g.selectAll('rect').remove();
      g.append('rect')
        .attr({
          x: 10,
          y: -padTop - 10,
          rx: 10,
          ry: 10,
          width: 180,
          height: (padTop + 13) * (this.props.keywords.length - 1),
        })
        .style({
          fill: 'white',
          opacity: 0.2,
        });
      const keywords = g.selectAll('text').data(list, d => d.keyword);
      keywords
        .enter()
        .append('text')
        .on('click', d => this.props.onRemoveKeyword(d.keyword))
        .text(d => d.keyword);
      keywords.exit().remove();
      keywords
        .attr({
          x: padLeft,
          y: d => padTop * d.id,
        })
        .style({
          fill: d => this.cScale(d.keyword),
          'font-size': 20,
        });
    }

    // legend
    if (this.legendScales && this.map) {
      const mapSize = this.map.getSize();
      const legendSize = this.legendScales.reverse()[0];
      const pad = 20;
      const height = 2 * pad + legendSize * this.legendScales.length;
      const width = 2 * pad + legendSize + 100;
      const g = d3.select('#legend');
      d3.select('#legend-layer').attr({
        width: mapSize.x,
        height: mapSize.y,
      });
      g.attr('transform', `translate(${pad}, ${pad + mapSize.y - height})`);
      g.selectAll('rect').remove();
      g.append('rect')
        .attr({
          x: 0,
          y: -pad - legendSize * 0.75,
          width,
          height: height + legendSize,
          rx: 10,
          ry: 10,
        })
        .style({
          fill: 'white',
          opacity: 0.2,
        });
      const legendsObj = this.legendScales.map(d => ({
        size: d,
        id: this.legendScales.indexOf(d) + 1,
      }));
      const legends = g.selectAll('circle').data(legendsObj, d => d.id);
      legends
        .enter()
        .append('circle');

      legends
        .attr({
          cx: legendSize + pad,
          cy: d => legendSize * d.id - (d.id === 1 ? legendSize * 0.75 : 0),
          r: d => d.size,
        })
        .style({
          fill: '#ffd800',
          opacity: 0.8,
        });
      legends.exit().remove();

      this.legendSizes.reverse();
      const legendSizesObj = this.legendSizes.map(d => ({
        size: d,
        id: this.legendSizes.indexOf(d) + 1,
      }));
      const legendSizes = g.selectAll('text')
              .data(legendSizesObj, d => d.id);
      legendSizes
        .enter()
        .append('text');
      legendSizes
        .text(d => Math.round(d.size))
        .attr({
          x: legendSize * 2 + pad + 10,
          y: d => legendSize * d.id,
        })
        .style({
          fill: 'white',
          opacity: 0.8,
        });
      legendSizes.exit().remove();
    }


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
        <div id="map-overlap" style={{ transform: 'translate3d(0px, 0px, 100px)' }}></div>
      </div>
    );
  }

}

export default TweetMap;
