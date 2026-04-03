var map = L.map('map').setView([40.015, -105.27], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  referrerPolicy: 'strict-origin',
  maxZoom: 18,
}).addTo(map);

// Sample pin in Boulder
L.marker([40.0150, -105.2705]).addTo(map)
  .bindPopup('<b>Sample Pin</b><br>Boulder, CO')
  .openPopup();

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