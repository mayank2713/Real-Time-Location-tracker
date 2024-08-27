const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Current Latitude: ${latitude}, Longitude: ${longitude}`);
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 500,
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
    const { id, latitude, longitude } = data;

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
        markers[id].openPopup();
    } else {
        markers[id] = L.marker([latitude, longitude])
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
