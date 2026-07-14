"""
Custom Django Admin widget for interactive map-based latitude/longitude selection.
Uses Leaflet.js + OpenStreetMap (no API key required, fully open-source).
"""
import json

from django import forms
from django.utils.safestring import mark_safe


class LeafletLocationWidget(forms.MultiWidget):
    """
    A compound widget that renders an interactive Leaflet map alongside
    latitude and longitude text inputs.

    The administrator can:
    - Search for a location using the Nominatim geocoder
    - Click anywhere on the map to drop a pin
    - Drag the marker to adjust the position
    - The lat/lng fields update automatically in real time

    Usage in ModelAdmin:
        class PropertyAdminForm(forms.ModelForm):
            class Meta:
                model = Property
                fields = '__all__'
                widgets = {
                    'latitude': LeafletLocationWidget.lat_widget(),
                    'longitude': LeafletLocationWidget.lng_widget(),
                }

    Or use the full MapWidget (preferred):
        latitude = MapPickerField(required=True)
        longitude = MapPickerField(required=True)
    """

    template_name = "admin/widgets/leaflet_map.html"

    class Media:
        css = {
            "all": [
                "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
                "admin/css/leaflet_widget.css",
            ]
        }
        js = [
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
            "admin/js/leaflet_widget.js",
        ]

    def __init__(self, attrs=None):
        widgets = [
            forms.HiddenInput(attrs={"class": "leaflet-lat-input"}),
            forms.HiddenInput(attrs={"class": "leaflet-lng-input"}),
        ]
        super().__init__(widgets, attrs)

    def decompress(self, value):
        if value:
            try:
                parts = str(value).split(",")
                return [parts[0].strip(), parts[1].strip()]
            except (IndexError, ValueError):
                pass
        return [None, None]

    def subwidgets(self, name, value, attrs=None):
        return super().subwidgets(name, value, attrs)


class MapPickerWidget(forms.Widget):
    """
    Standalone map picker widget that renders a full interactive Leaflet map.
    Designed to be used on the latitude field of the Property model in admin.
    The companion longitude field is hidden and auto-filled by the map.

    This widget takes care of both lat and lng even though it's attached
    to a single field — the JS updates both inputs by class name.
    """

    class Media:
        css = {
            "all": [
                "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
                "admin/css/leaflet_widget.css",
            ]
        }
        js = [
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
            "admin/js/leaflet_widget.js",
        ]

    def render(self, name, value, attrs=None, renderer=None):
        lat = value or "6.5244"
        lng = "3.3792"  # Default: Lagos, Nigeria

        # Try to get the existing lat/lng from the form if available
        # (name will be 'latitude', companion is 'longitude')

        widget_id = f"map-picker-{name}"
        hidden_lat_id = f"id_{name}"
        hidden_lng_id = "id_longitude"

        html = f"""
<div class="leaflet-map-container" id="{widget_id}-container">
  <!-- Search Bar -->
  <div class="leaflet-search-bar">
    <input
      type="text"
      id="{widget_id}-search"
      class="leaflet-search-input"
      placeholder="🔍 Search for a location (e.g. Lekki Phase 1, Lagos)..."
      autocomplete="off"
    />
    <button type="button" class="leaflet-search-btn" onclick="leafletSearchLocation('{widget_id}')">
      Search
    </button>
    <span class="leaflet-search-hint">Press Enter or click Search to find a location</span>
  </div>

  <!-- Map Container -->
  <div
    id="{widget_id}"
    class="leaflet-map-widget"
    data-lat="{lat}"
    data-lng="{lng}"
    data-lat-field="{hidden_lat_id}"
    data-lng-field="{hidden_lng_id}"
  ></div>

  <!-- Coordinate Display -->
  <div class="leaflet-coords-display">
    <span>📍 Selected: </span>
    <strong id="{widget_id}-lat-display">{lat}</strong>,
    <strong id="{widget_id}-lng-display">{lng}</strong>
    <span class="leaflet-coords-hint">(Click map or drag marker to update)</span>
  </div>

  <!-- Hidden lat/lng inputs that Django form reads -->
  <input type="hidden" id="{hidden_lat_id}" name="{name}" value="{lat}" class="leaflet-lat-value" />
</div>
"""
        return mark_safe(html)
