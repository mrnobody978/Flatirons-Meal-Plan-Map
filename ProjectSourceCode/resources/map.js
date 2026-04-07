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

// fetch favorite restaurants
let favoriteIds = new Set();

async function loadFavorites() {
  const res = await fetch('/api/favorites');
  const favorites = await res.json();

  favoriteIds = new Set(favorites.map(r => r.id));
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
            (r.phone ? '<br>' + r.phone : '') +
            // favorite restaurant button
            `<br><button onclick="toggleFavorite(${r.id})">
            ${favoriteIds.has(r.id) ? 'Unfavorite' : 'Favorite'}
            </button>`
          );
      }
    }
  } catch (err) {
    console.log('Error loading restaurant pins:', err);
  }
}

async function initMap() {
  await loadFavorites();
  await loadRestaurantPins();
}

initMap();

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

// calling routes to favorite/unfavorite a restaurant
async function toggleFavorite(id) {
  try {
    if (favoriteIds.has(id)) {
      // UNFAVORITE
      await fetch(`/api/favorites/${id}`, {
        method: 'DELETE'
      });

      favoriteIds.delete(id);
      alert("Removed from favorites");

    } else {
      // FAVORITE
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: id })
      });

      favoriteIds.add(id);
      alert("Added to favorites");
    }

    // we could use this to reload the UI quickly but it resets the whole page
    // location.reload();

  } catch (err) {
    console.error(err);
    alert("Error updating favorite");
  }
}