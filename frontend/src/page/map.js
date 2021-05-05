/**
 * This file contains functions for working with the route map.
 */

import * as L from 'leaflet';

export function initMap() {
    const myMap = L.map("map").setView([46.5, -94.5], 6);

    L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            `
              Map data &copy;
              <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
              contributors,
              Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>
            `.replace(/\n/, " ").trim(),
          maxZoom: 18,
          minZoom: 1,
          id: "mapbox/streets-v11",
          tileSize: 512,
          zoomOffset: -1,
          accessToken: "pk.eyJ1Ijoid2FsYnIwMzciLCJhIjoiY2tuZTBlaHhnMmNpcjJ3bGc4cGJvNW9tNCJ9.2tzm5cKgtdqznvB521ozLQ",
        }
    ).addTo(myMap);
}
