import React, { Component, PropTypes } from 'react';
import d3 from 'd3';
//import cloud from 'd3-cloud';
//import Canvas from 'canvas';

const sizeScale = d3.scale.linear().range(10, 100);

class Cloud extends Component {

  render() {
    /*
    const scale = sizeScale.domain(d3.extent(this.props.wordCounts, d => d.count));
    const data = this.props.wordCounts.map(c => ({
      text: c.word,
      size: scale(c.count),
    }));

    cloud
      .size([960, 500])
      .canvas(() => new Canvas(1, 1))
      .words(data)
      .padding(5)
      .font('Impact')
      .fontSize(d => d.size)
      .start();
     */
    return (
        <div className="cloud">
        <svg></svg>
        </div>
    );
  }
}

export default Cloud;
