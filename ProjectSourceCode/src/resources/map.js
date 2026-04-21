var map = L.map('map').setView([40.015, -105.27], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  referrerPolicy: 'strict-origin',
  maxZoom: 18,
}).addTo(map);

// Store favorite restaurant IDs
let favoriteIds = new Set();

// Store all restaurants and their markers for search bar use
let allRestaurants = [];
let restaurantMarkers = {};

// Fetch favorite restaurants for the current user
async function loadFavorites() {
  const res = await fetch('/api/favorites');
  const favorites = await res.json();
  favoriteIds = new Set(favorites.map(r => r.id));
}

// Fetch restaurants from API, store for search bar, and place pins on map
async function loadRestaurantPins() {
  try {
    const response = await fetch('/api/restaurants');
    const restaurants = await response.json();

    // Store restaurants for search bar use
    allRestaurants = restaurants;

    for (const r of restaurants) {
      if (r.latitude && r.longitude) {
        const marker = L.marker([r.latitude, r.longitude]).addTo(map)
          .bindPopup(
            '<b>' + r.name + '</b><br>' +
            r.address +
            (r.phone ? '<br>' + r.phone : '') +
            `<br><button onclick="toggleFavorite(${r.id})">
            ${favoriteIds.has(r.id) ? 'Unfavorite' : 'Favorite'}
            </button>`
          );

        // Store marker by restaurant ID for search use
        restaurantMarkers[r.id] = marker;
      }
    }
  } catch (err) {
    console.log('Error loading restaurant pins:', err);
  }
}

// Initialize map by loading favorites and restaurant pins
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
          radius: 10,
          fillColor: '#FF0000',
          color: '#fff',
          weight: 3,
          fillOpacity: 1
        }).addTo(map).bindPopup('<b>You are here</b>');
      }
    },
    function (error) {
      console.log('Geolocation error:', error.message);
    },
    { enableHighAccuracy: true }
  );
}

// Toggle favorite status for a restaurant
async function toggleFavorite(id) {
  try {
    if (favoriteIds.has(id)) {
      // Unfavorite
      await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
      favoriteIds.delete(id);
      alert("Removed from favorites");
    } else {
      // Favorite
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: id })
      });
      favoriteIds.add(id);
      alert("Added to favorites");
    }
  } catch (err) {
    console.error(err);
    alert("Error updating favorite");
  }
}

// Listen for input in search bar and show dropdown results
document.getElementById('restaurant-search').addEventListener('input', function () {
  const query = this.value.toLowerCase().trim();
  const dropdown = document.getElementById('search-results');

  // Hide dropdown if query is too short
  if (query.length < 3) {
    dropdown.style.display = 'none';
    return;
  }

  // Filter restaurants by name based on query
  const matches = allRestaurants
    .filter(r => r.name.toLowerCase().includes(query));

  // Hide dropdown if no matches found
  if (matches.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  // Build dropdown HTML from matched restaurants
  dropdown.innerHTML = matches.map(r => `
    <div class="search-result-item" data-id="${r.id}" data-name="${r.name}" data-lat="${r.latitude}" data-lon="${r.longitude}">
      <strong>${r.name}</strong>
      <br>
      <small>${r.address}</small>
    </div>
  `).join('');

  dropdown.style.display = 'block';

  // Add click handler to each result item
  dropdown.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', function () {
      const name = this.dataset.name;
      const id = parseInt(this.dataset.id);
      const lat = parseFloat(this.dataset.lat);
      const lon = parseFloat(this.dataset.lon);

      // Fill search bar with selected name and close dropdown
      document.getElementById('restaurant-search').value = name;
      dropdown.style.display = 'none';

      // If restaurant has coordinates, center map and open its popup
      if (lat && lon) {
        map.setView([lat, lon], 17);
        if (restaurantMarkers[id]) {
          restaurantMarkers[id].openPopup();
        }
      }
    });
  });
});

// Close dropdown when clicking outside the search container
document.addEventListener('click', function (e) {
  if (!e.target.closest('.search-container')) {
    document.getElementById('search-results').style.display = 'none';
  }
});