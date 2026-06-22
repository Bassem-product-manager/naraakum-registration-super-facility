let map;
let marker;
let geocoder;
let searchBox;

function initMap() {
  const defaultCenter = { lat: 24.7136, lng: 46.6753 }; // الرياض

  map = new google.maps.Map(document.getElementById("location-map"), {
  center: defaultCenter,
  zoom: 6,
  disableDefaultUI: true, // تعطيل كل عناصر التحكم
  zoomControl: true,     // تفعيل أزرار الزوم
  scrollwheel: true,     // ✅ تفعيل الزوم بعجلة الماوس
  gestureHandling: "auto" // ✅ يسمح بجميع الإيماءات (ماوس + لمس)
  });

  geocoder = new google.maps.Geocoder();

  // مربع البحث
  const input = document.getElementById("MapsearchInput");
  searchBox = new google.maps.places.SearchBox(input);

  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();
    if (places.length === 0) return;

    const place = places[0];
    if (!place.geometry || !place.geometry.location) return;

    map.setCenter(place.geometry.location);
    map.setZoom(15);

    setMarker(place.geometry.location);

    document.getElementById("location-info").innerHTML = `
             ${place.geometry.location
               .lat()
               .toFixed(6)}, ${place.geometry.location.lng().toFixed(6)}<br>
            ${place.formatted_address || place.name}
          `;
  });

  map.addListener("click", (e) => {
    const latLng = e.latLng;
    setMarker(latLng);

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK") {
        const address = results[0]?.formatted_address || "العنوان غير متوفر";
        document.getElementById("location-info").innerHTML = `
                 ${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}<br>
                 ${address}
              `;
      } else {
        document.getElementById("location-info").innerText =
          "لا يمكن الحصول على العنوان.";
      }
    });
  });

  // زر GPS لتحديد الموقع الحالي
  document.getElementById("gps-btn").addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          map.setCenter(userLocation);
          map.setZoom(15);
          setMarker(userLocation);

          geocoder.geocode({ location: userLocation }, (results, status) => {
            if (status === "OK") {
              const address =
                results[0]?.formatted_address || "العنوان غير متوفر";
              document.getElementById("location-info").innerHTML = `
                       ${userLocation.lat.toFixed(
                         6
                       )}, ${userLocation.lng.toFixed(6)}<br>
                        ${address}
                    `;
            } else {
              document.getElementById("location-info").innerText =
                "تعذر الحصول على العنوان.";
            }
          });
        },
        () => {
          alert("فشل في تحديد الموقع. يرجى السماح بالوصول إلى الموقع.");
        }
      );
    } else {
      alert("المتصفح لا يدعم تحديد الموقع.");
    }
  });
}

function setMarker(position) {
  if (marker) {
    marker.setPosition(position);
  } else {
    marker = new google.maps.Marker({
      position: position,
      map: map,
    });
  }
}
