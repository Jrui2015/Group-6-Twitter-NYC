// coordinates = [x, y]
const makePointFeature = (coordinates) => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates,
  },
});

export default makePointFeature;
