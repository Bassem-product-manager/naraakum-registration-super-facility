function initMap() {
    const map = new google.maps.Map(document.getElementById('Tracking-map-container'), {
        zoom: 6,
        center: { lat: 24.664330, lng: 46.708069 }, // Default center  

        mapTypeId: "roadmap",
        disableDefaultUI: true,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false,
        mapTypeControl: false,
        draggable: true,
        scrollwheel: true,
    });

    // Static location (Start)
    const staticLocation = { lat: 24.664330, lng: 46.708069 }; 

    // Moving location (End)
    const moveLocation = { lat: 24.713552, lng: 46.675297 }; 

    // Create marker for static location
    const staticMarker = new google.maps.Marker({
        position: staticLocation,
        map: map,
        title: 'Start Location'
    });

    // Create marker for moving location
    const movingMarker = new google.maps.Marker({
        position: staticLocation, // Initially set to static location
        map: map,
        title: 'Moving Location'
    });

    // Request route between two locations
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const request = {
        origin: staticLocation,
        destination: moveLocation,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const route = result.routes[0].overview_path;
            animateMarker(movingMarker, route, result);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

// Animate marker along the route
function animateMarker(marker, route, result) {
    let i = 0;
    setInterval(() => {
        i = (i + 1) % route.length;
        marker.setPosition(route[i]);
        updateRouteInfo(result);
    }, 1000); // Change marker position every 1 second (adjust for smoother or faster movement)
}

// Update live route distance and duration
function updateRouteInfo(result) {
    const distance = result.routes[0].legs[0].distance.text;
    const duration = result.routes[0].legs[0].duration.text;

    document.getElementById('map-Distance').innerHTML =  distance;
    document.getElementById('map-duration').innerHTML =  duration;
   
}