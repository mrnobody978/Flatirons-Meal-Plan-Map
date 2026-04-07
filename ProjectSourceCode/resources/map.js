var map = L.map('map').setView([40.015, -105.27], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  referrerPolicy: 'strict-origin',
  maxZoom: 18,
}).addTo(map);

// Geocode an address using Nominatim (free, no API key needed)
async function geocode(address) {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(address);
  const response = await fetch(url);
  const data = await response.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

// Fetch restaurants from API and place pins on the map
async function loadRestaurantPins() {
  try {
    const response = await fetch('/api/restaurants');
    const restaurants = await response.json();

    for (const r of restaurants) {
      // Nominatim requires ~1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1100));

      const coords = await geocode(r.address);
      if (coords) {
        L.marker([coords.lat, coords.lng]).addTo(map)
          .bindPopup(
            '<b>' + r.name + '</b><br>' +
            r.address +
            (r.phone ? '<br>' + r.phone : '')
          );
      }
    }
  } catch (err) {
    console.log('Error loading restaurant pins:', err);
  }
}

loadRestaurantPins();

// Real-time user location tracking
var userMarker = null;

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        userMarker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: '#4285F4',
          color: '#fff',
          weight: 2,
          fillOpacity: 1
        }).addTo(map).bindPopup('You are here');
      }
    },
    function (error) {
      console.log('Geolocation error:', error.message);
    },
    { enableHighAccuracy: true }
  );
}
