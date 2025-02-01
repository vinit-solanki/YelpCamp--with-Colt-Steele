const mapToken = '<%= process.env.MAPTILER_API_KEY %>';
const campground = '<%= JSON.stringify(camp) %>';

const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/streets/style.json?key=${mapToken}`,
    center: campground.geometry.coordinates,
    zoom: 10
});

new maplibregl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new maplibregl.Popup({ offset: 25 })
            .setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`)
    )
    .addTo(map);
