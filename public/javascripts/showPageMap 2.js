mapboxgl.accessToken = mapboxToken;
campgroundObj = JSON.parse(campground);

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v11',
    center: campgroundObj.geometry.coordinates, // [lng, lat]
    zoom: 10
});
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

new mapboxgl.Marker()
    .setLngLat(campgroundObj.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campgroundObj.title}</h3><p>${campgroundObj.location}</p>`
            )
    )
    .addTo(map);