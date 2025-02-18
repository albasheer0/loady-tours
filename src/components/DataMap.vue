<template>
  <div ref="mapContainer" class="map-container">
    <div class="map-overlay" v-if="loading">
      <v-progress-circular indeterminate />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import type { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Location } from '@/types/models';

const props = defineProps<{
  items: Array<{
    id: string;
  } & (
    | {
        type?: 'driver' | 'customer';
        location: Location;
        status?: string;
        locationFrom?: never;
        locationTo?: never;
      }
    | {
        type?: 'tour';
        location?: never;
        status?: 'active' | 'completed' | 'cancelled';
        locationFrom: Location;
        locationTo: Location;
        customerId?: string;
        assignedDriverId?: string;
        shipmentDate?: string;
      }
  )>;
  type: 'driver' | 'customer' | 'tour';
  loading?: boolean;
  selectedId?: string;
}>();

const emit = defineEmits<{
  (e: 'update:selectedId', id: string): void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<maplibregl.Map | null>(null);
const markers = ref<maplibregl.Marker[]>([]);
const routeSources = ref<string[]>([]);

// Map initialization
onMounted(() => {
  if (!mapContainer.value) return;

  // Create the map instance with a string style URL
  const mapInstance = new maplibregl.Map({
    container: mapContainer.value,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [10.4515, 51.1657],
    zoom: 5,
    attributionControl: {
      compact: true,
      customAttribution: 'loady'
    }
  });

  // Add navigation controls after map is loaded
  mapInstance.on('load', () => {
    mapInstance.addControl(new maplibregl.NavigationControl());
    map.value = mapInstance;
    updateMarkers();
  });
});

// Cleanup
onUnmounted(() => {
  markers.value.forEach(marker => marker.remove());
  if (map.value) {
    routeSources.value.forEach(sourceId => {
      if (map.value?.getSource(sourceId)) {
        map.value.removeLayer(`route-line-${sourceId}`);
        map.value.removeSource(sourceId);
      }
    });
    map.value.remove();
  }
});

// Update markers when items change
watch(() => props.items, updateMarkers, { deep: true });

// Watch for selection changes
watch(() => props.selectedId, () => {
  updateMarkers();
});

// Marker creation and update logic
function updateMarkers() {
  if (!map.value) return;

  // Remove existing markers
  markers.value.forEach(marker => marker.remove());
  markers.value = [];

  // Remove existing route sources and layers
  routeSources.value.forEach(sourceId => {
    if (map.value?.getSource(sourceId)) {
      map.value.removeLayer(`route-line-${sourceId}`);
      map.value.removeSource(sourceId);
    }
  });
  routeSources.value = [];

  // Create all markers
  const newMarkers: maplibregl.Marker[] = [];
  
  props.items.forEach(item => {
    if (props.type === 'tour') {
      if (item.locationFrom?.lat && item.locationFrom?.lng && 
          item.locationTo?.lat && item.locationTo?.lng) {
        const fromMarker = createMarker(item.locationFrom, 'from', item.status);
        const toMarker = createMarker(item.locationTo, 'to', item.status);
        if (fromMarker && toMarker) {
          newMarkers.push(fromMarker, toMarker);
          addRouteLine(item.id, item.locationFrom, item.locationTo, item.status);
        }
      }
    } else {
      if (item.location?.lat && item.location?.lng) {
        const marker = createMarker(item.location, props.type, item.status);
        if (marker) {
          newMarkers.push(marker);
        }
      }
    }
  });

  markers.value = newMarkers;
}

function createMarker(location: Location, type: string, status?: string): maplibregl.Marker | null {
  if (!map.value || !location?.lat || !location?.lng) {
    return null;
  }

  // Create a simple div for the marker
  const el = document.createElement('div');
  el.className = `marker-dot ${type}`;
  if (status) {
    el.classList.add(status);
  }

  try {
    // Create the marker
    const marker = new maplibregl.Marker({
      element: el,
      anchor: 'bottom'
    });

    // Set position
    marker.setLngLat([location.lng, location.lat]);

    // Add to map if available
    const mapInstance = map.value;
    if (mapInstance) {
      // Use a type assertion here since we know it's a valid map instance
      (marker as any).addTo(mapInstance);
    }

    // Add click handler
    el.addEventListener('click', () => {
      const item = props.items.find(i => {
        if (type === 'tour') {
          return (i.locationFrom?.lat === location.lat && i.locationFrom?.lng === location.lng) ||
                 (i.locationTo?.lat === location.lat && i.locationTo?.lng === location.lng);
        }
        return i.location?.lat === location.lat && i.location?.lng === location.lng;
      });
      if (item) {
        emit('update:selectedId', item.id);
      }
    });

    return marker;
  } catch (error) {
    console.error('Error creating marker:', error);
    return null;
  }
}

function getMarkerColor(type: string, status?: string): string {
  switch (type) {
    case 'driver':
      return status === 'available' ? '#4CAF50' : '#FFC107';
    case 'customer':
      return '#2196F3';
    case 'from':
      return '#4CAF50';
    case 'to':
      return '#F44336';
    default:
      return '#9C27B0';
  }
}

function addRouteLine(id: string, from: Location, to: Location, status?: string) {
  if (!map.value) return;

  const lineColor = status === 'completed' ? '#4CAF50' : 
                   status === 'cancelled' ? '#F44336' : '#FFC107';

  const sourceId = `route-${id}`;
  routeSources.value.push(sourceId);
  
  // Add the route source
  map.value.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [from.lng, from.lat],
          [to.lng, to.lat]
        ]
      }
    }
  });

  // Add the route line layer
  map.value.addLayer({
    id: `route-line-${sourceId}`,
    type: 'line',
    source: sourceId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': lineColor,
      'line-width': 2,
      'line-dasharray': status === 'active' ? [2, 2] : [1]
    }
  });
}
</script>

<style>
.map-container {
  width: 100%;
  height: 482px;
  position: relative;
  overflow: hidden;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.marker-wrapper {
  width: 32px;
  height: 32px;
  position: relative;
  cursor: pointer;
}

.marker-background {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  background: #666;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.marker-wrapper.selected .marker-background {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #2196F3;
}

.marker-svg-container {
  width: 20px;
  height: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
}

.marker-popover {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  padding: 8px;
  width: max-content;
  max-width: 200px;
  z-index: 3;
  pointer-events: none;
}

.popover-content {
  font-size: 12px;
  line-height: 1.4;
}

.popover-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.popover-status {
  color: #666;
  text-transform: capitalize;
  margin-bottom: 2px;
}

.popover-coords {
  color: #999;
  font-size: 11px;
}

.maplibregl-marker-container {
  will-change: opacity;
}

.marker-dot {
  width: 24px;
  height: 24px;
  background: #666;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.marker-dot.driver {
  background: #FFC107;
}

.marker-dot.driver.available {
  background: #4CAF50;
}

.marker-dot.customer {
  background: #2196F3;
}

.marker-dot.from {
  background: #4CAF50;
}

.marker-dot.to {
  background: #F44336;
}

.marker-dot:hover {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #2196F3;
}

.marker-dot.selected {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #2196F3;
}
</style> 