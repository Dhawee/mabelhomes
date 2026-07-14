/**
 * Leaflet Map Widget — Django Admin JavaScript
 * Initializes interactive maps for property location selection.
 * Uses OpenStreetMap tiles (free, no API key required).
 * Uses Nominatim for geocoding/search (free, rate-limited).
 */

(function () {
  "use strict";

  // Store map instances by container ID to avoid re-initialization
  const _maps = {};

  /**
   * Initialize all map widgets on the page.
   * Called on DOMContentLoaded and after inline form additions.
   */
  function initLeafletWidgets() {
    const containers = document.querySelectorAll(".leaflet-map-widget");
    containers.forEach(function (el) {
      if (_maps[el.id]) return; // Already initialized

      const lat = parseFloat(el.dataset.lat) || 6.5244;
      const lng = parseFloat(el.dataset.lng) || 3.3792;
      const latFieldId = el.dataset.latField;
      const lngFieldId = el.dataset.lngField;

      // Initialize the Leaflet map
      const map = L.map(el.id, {
        center: [lat, lng],
        zoom: 13,
        scrollWheelZoom: true,
      });

      // Use OpenStreetMap tiles (free, no API key)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create draggable marker at default/existing position
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

      marker.bindPopup(
        "<strong>📍 Property Location</strong><br>Drag to adjust position"
      ).openPopup();

      // Update fields and display when marker is dragged
      marker.on("dragend", function () {
        const pos = marker.getLatLng();
        updateFields(el.id, pos.lat, pos.lng, latFieldId, lngFieldId);
      });

      // Move marker and update fields when map is clicked
      map.on("click", function (e) {
        marker.setLatLng(e.latlng);
        map.panTo(e.latlng);
        updateFields(el.id, e.latlng.lat, e.latlng.lng, latFieldId, lngFieldId);
      });

      // Wire up the search input for this map
      const searchInput = document.getElementById(el.id + "-search");
      if (searchInput) {
        searchInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            performSearch(el.id, searchInput.value, map, marker, latFieldId, lngFieldId);
          }
        });
      }

      _maps[el.id] = { map, marker, latFieldId, lngFieldId };
    });
  }

  /**
   * Updates the hidden lat/lng form fields and the coordinate display.
   */
  function updateFields(mapId, lat, lng, latFieldId, lngFieldId) {
    const latVal = lat.toFixed(6);
    const lngVal = lng.toFixed(6);

    // Update hidden form fields
    const latField = document.getElementById(latFieldId);
    const lngField = document.getElementById(lngFieldId);

    if (latField) latField.value = latVal;
    if (lngField) lngField.value = lngVal;

    // Update coordinate display labels
    const latDisplay = document.getElementById(mapId + "-lat-display");
    const lngDisplay = document.getElementById(mapId + "-lng-display");

    if (latDisplay) latDisplay.textContent = latVal;
    if (lngDisplay) lngDisplay.textContent = lngVal;
  }

  /**
   * Performs a Nominatim geocoding search and moves the map to the result.
   * Called from the search button onclick and Enter key in the search input.
   */
  window.leafletSearchLocation = function (mapId) {
    const searchInput = document.getElementById(mapId + "-search");
    if (!searchInput) return;
    const query = searchInput.value.trim();
    if (!query) return;

    const mapData = _maps[mapId];
    if (!mapData) return;

    performSearch(
      mapId,
      query,
      mapData.map,
      mapData.marker,
      mapData.latFieldId,
      mapData.lngFieldId
    );
  };

  /**
   * Calls Nominatim API and updates the map to the first result.
   */
  function performSearch(mapId, query, map, marker, latFieldId, lngFieldId) {
    if (!query) return;

    const searchInput = document.getElementById(mapId + "-search");
    const originalValue = searchInput ? searchInput.value : "";

    if (searchInput) {
      searchInput.value = "Searching...";
      searchInput.disabled = true;
    }

    const url =
      "https://nominatim.openstreetmap.org/search?format=json&q=" +
      encodeURIComponent(query) +
      "&limit=1&addressdetails=1";

    fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "MabelHomesAdmin/2.0",
      },
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (results) {
        if (searchInput) {
          searchInput.value = originalValue;
          searchInput.disabled = false;
        }

        if (!results || results.length === 0) {
          alert(
            'Location "' +
              query +
              '" not found. Try a different search term (e.g. "Lekki Phase 1, Lagos").'
          );
          return;
        }

        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        marker.setLatLng([lat, lng]);
        map.setView([lat, lng], 15);
        marker
          .bindPopup(
            "<strong>📍 " +
              (result.display_name || query) +
              "</strong><br>Click 'Confirm' or drag to fine-tune"
          )
          .openPopup();

        updateFields(mapId, lat, lng, latFieldId, lngFieldId);
      })
      .catch(function (err) {
        if (searchInput) {
          searchInput.value = originalValue;
          searchInput.disabled = false;
        }
        console.error("Nominatim geocoding error:", err);
        alert(
          "Location search failed. Check your internet connection and try again."
        );
      });
  }

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLeafletWidgets);
  } else {
    initLeafletWidgets();
  }

  // Re-initialize when Django admin adds inline forms dynamically
  document.addEventListener("formset:added", function () {
    setTimeout(initLeafletWidgets, 100);
  });
})();
