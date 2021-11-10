mapboxgl.accessToken = 'pk.eyJ1IjoiZmF0aW1hY2FsZGVyb24iLCJhIjoiY2t2MmpjaDhuMGgyaDJ3bm53b2dtMmh0bCJ9.anBlXoK6KS8BfBOjHqTZ1w';
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v9', // style URL
center: [-89.3661482, 13.7128876], // starting position [lng, lat]
zoom: 9 // starting zoom
});

/* Given a query in the form "lng, lat" or "lat, lng"
* returns the matching geographic coordinate(s)
* as search results in carmen geoj
son format,
* https://github.com/mapbox/carmen/blob/master/carmen-geojson.md */
const coordinatesGeocoder = function (query) {
  // Match anything which looks like
  // decimal degrees coordinate pair.
  const matches = query.match(
  /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
  );
  if (!matches) {
  return null;
  }
   
  function coordinateFeature(lng, lat) {
  return {
  center: [lng, lat],
  geometry: {
  type: 'Point',
  coordinates: [lng, lat]
  },
  place_name: 'Lat: ' + lat + ' Lng: ' + lng,
  place_type: ['coordinate'],
  properties: {},
  type: 'Feature'
  };
  }
   
  const coord1 = Number(matches[1]);
  const coord2 = Number(matches[2]);
  const geocodes = [];
   
  if (coord1 < -90 || coord1 > 90) {
  // must be lng, lat
  geocodes.push(coordinateFeature(coord1, coord2));
  }
   
  if (coord2 < -90 || coord2 > 90) {
  // must be lat, lng
  geocodes.push(coordinateFeature(coord2, coord1));
  }
   
  if (geocodes.length === 0) {
  // else could be either lng, lat or lat, lng
  geocodes.push(coordinateFeature(coord1, coord2));
  geocodes.push(coordinateFeature(coord2, coord1));
  }
   
  return geocodes;
  };
   
  const distanceContainer = document.getElementById('distance');

  // GeoJSON object to hold our measurement features
  const geojson = {
      'type': 'FeatureCollection',
      'features': []
  };

  // Used to draw a line between points
  const linestring = {
      'type': 'Feature',
      'geometry': {
          'type': 'LineString',
          'coordinates': []
      }
  };

  map.on('load', () => {
      map.addSource('geojson', {
          'type': 'geojson',
          'data': geojson
      });

      // Add styles to the map
      map.addLayer({
          id: 'measure-points',
          type: 'circle',
          source: 'geojson',
          paint: {
              'circle-radius': 5,
              'circle-color': '#000'
          },
          filter: ['in', '$type', 'Point']
      });
      map.addLayer({
          id: 'measure-lines',
          type: 'line',
          source: 'geojson',
          layout: {
              'line-cap': 'round',
              'line-join': 'round'
          },
          paint: {
              'line-color': '#000',
              'line-width': 2.5
          },
          filter: ['in', '$type', 'LineString']
      });

      map.on('click', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
              layers: ['measure-points']
          });

          // Remove the linestring from the group
          // so we can redraw it based on the points collection.
          if (geojson.features.length > 1) geojson.features.pop();

          // Clear the distance container to populate it with a new value.
          distanceContainer.innerHTML = '';

          // If a feature was clicked, remove it from the map.
          if (features.length) {
              const id = features[0].properties.id;
              geojson.features = geojson.features.filter(
                  (point) => point.properties.id !== id
              );
          } else {
              const point = {
                  'type': 'Feature',
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [e.lngLat.lng, e.lngLat.lat]
                  },
                  'properties': {
                      'id': String(new Date().getTime())
                  }
              };

              geojson.features.push(point);
          }

          if (geojson.features.length > 1) {
              linestring.geometry.coordinates = geojson.features.map(
                  (point) => point.geometry.coordinates
              );

              geojson.features.push(linestring);

              // Populate the distanceContainer with total distance
              const value = document.createElement('pre');
              const distance = turf.length(linestring);
              value.textContent = `Total distance: ${distance.toLocaleString()}km`;
              distanceContainer.appendChild(value);
          }

          map.getSource('geojson').setData(geojson);
      });
  });

  map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
          layers: ['measure-points']
      });
      // Change the cursor to a pointer when hovering over a point on the map.
      // Otherwise cursor is a crosshair.
      map.getCanvas().style.cursor = features.length
          ? 'pointer'
          : 'crosshair';
  });

  
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}),'bottom-right');