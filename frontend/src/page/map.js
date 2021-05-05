/**
 * This file contains functions for working with the route map.
 */

import * as L from 'leaflet';

import { swap } from '../utils';

let myMap;
let polylines = [];

export function initMap() {
    myMap = L.map("map").setView([46.5, -94.5], 6);

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

export function initCities(cityData) {
    const geoJsonProcessingSteps = {
        // Turns GeoJSON points to Leaflet circle markers.
        pointToLayer: (_, latLng) => {
            return new L.CircleMarker(latLng, { radius: 5, color: "#f00" });
        },
        // Adds a popup to each city, if popup information exists in the
        // GeoJSON.
        onEachFeature: (feature, geoJsonLayer) => {
            if (feature.properties.popupContent) {
                geoJsonLayer.bindPopup(feature.properties.popupContent);
            }
        },
    };

    L.geoJSON(asGeoJson(cityData), geoJsonProcessingSteps).addTo(myMap);
}

export function setRoute(route, cityData) {
    // We'll draw two lines on top of each other---of different colors and
    // widths. (It'll be fancy.)
    const lineStyle = {
        dashArray: [10, 20],
        weight: 5,
        color: "#00f"
    };
    const fillStyle = {
        weight: 5,
        color: "#fff"
    };

    const coordinates = asListOfCoordinates(route, cityData);

    if (polylines.length === 0) {
        // Make the polylines for the first time.
        polylines[0] = L.polyline(coordinates, fillStyle).addTo(myMap);
        polylines[1] = L.polyline(coordinates, lineStyle).addTo(myMap);
    } else {
        // Update the polylines.
        polylines[0].setLatLngs(coordinates);
        polylines[1].setLatLngs(coordinates);
    }
}

function asListOfCoordinates(route, cityData) {
    const routeWithStartAndEndConnected = [...route, route[0]];
    return routeWithStartAndEndConnected.map(index =>
        cityData.cities[index].location
    );
}

function asGeoJson(cityData) {
    return cityData.cities.map(city =>
        ({
            type: "Feature",
            properties: {
                name: city.name,
                show_on_map: true,
                popupContent: city.name,
            },
            geometry: {
                type: "Point",
                coordinates: swap(city.location),
            }
        })
    );
}
