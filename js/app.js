// Snaigės Žygiai — app.js

const MATK_OFFICE = [54.6892, 25.2798]; // Gynėjų g. 4, Vilnius

const map = L.map('map').setView(MATK_OFFICE, 10);

// Base layers
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 18
});

const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  maxZoom: 17
});

osm.addTo(map);
L.control.layers({ 'Žemėlapis': osm, 'Topografinis': topo }).addTo(map);

// Load trails
const gpxLayers = {};

fetch('trails/trails.json')
  .then(r => r.json())
  .then(trails => {
    const bounds = L.latLngBounds();
    const container = document.getElementById('trails');

    trails.forEach(trail => {
      // GPX layer on map
      const gpxLayer = new L.GPX(trail.gpx, {
        async: true,
        polyline_options: {
          color: trail.color,
          weight: 4,
          opacity: 0.85
        },
        marker_options: {
          startIconUrl: null,
          endIconUrl: null,
          shadowUrl: null,
          wptIconUrls: { '': null }
        }
      });

      gpxLayer.on('loaded', function(e) {
        const b = e.target.getBounds();
        bounds.extend(b);
        map.fitBounds(bounds, { padding: [40, 40] });
      });

      gpxLayer.on('click', function() {
        map.fitBounds(gpxLayer.getBounds(), { padding: [60, 60] });
      });

      gpxLayer.bindPopup(`<strong>${trail.name}</strong><br>${trail.description}`);
      gpxLayer.addTo(map);
      gpxLayers[trail.id] = gpxLayer;

      // Trail card
      const card = document.createElement('div');
      card.className = 'trail-card';
      card.style.borderLeftColor = trail.color;
      card.innerHTML = `
        <h2>${trail.name}</h2>
        <div class="meta">
          <span>${trail.distance}</span>
          <span>${trail.difficulty}</span>
        </div>
        <p class="description">${trail.description}</p>
        <div class="actions">
          <a href="${trail.gpx}" download class="btn-gpx">Atsisiųsti GPX</a>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') return; // let download link work
        const layer = gpxLayers[trail.id];
        if (layer && layer.getBounds) {
          map.fitBounds(layer.getBounds(), { padding: [60, 60] });
        }
      });

      container.appendChild(card);
    });
  })
  .catch(err => console.error('Nepavyko užkrauti trasų:', err));
