const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const accuracyKm = (accuracy / 1000).toFixed(2); // Convert accuracy to kilometers and round to 2 decimal places
            console.log(`Current Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracyKm} km`);
            socket.emit("send-location", { latitude, longitude, accuracy });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 0,
        }
    );
}

// Initialize the map
const map = L.map("map").setView([0, 0], 5);

// Add tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Mayank Chourey"
}).addTo(map);

const markers = {};

socket.on("recieve-location", (data) => {
    const { id, latitude, longitude, accuracy } = data;
    const accuracyKm = (accuracy / 1000).toFixed(2); // Convert accuracy to kilometers and round to 2 decimal places
    
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
        // Optionally update marker with new accuracy information
        markers[id].bindPopup(`Accuracy: ${accuracyKm} km`).openPopup();
    } else {
        markers[id] = L.marker([latitude, longitude])
            .bindPopup(`Accuracy: ${accuracyKm} km`)
            .addTo(map);
    }
    map.setView([latitude, longitude]);
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
