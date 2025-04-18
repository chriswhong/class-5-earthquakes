mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaXN3aG9uZ21hcGJveCIsImEiOiJjbDl6bzJ6N3EwMGczM3BudjZmbm5yOXFnIn0.lPhc5Z5H3byF_gf_Jz48Ug';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-74.5, 40],
    zoom: 2
});

map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);

map.on('load', () => {
    // add mapbox-gl-globe-minimap plugin
    map.addControl(
        new GlobeMinimap({
            landColor: "#4ebf6e",
            waterColor: "#8dcbe3"
        }),
        "bottom-right"
    );

    map.addSource('earthquakes', {
        type: 'geojson',
        data: './all-earthquakes-week.geojson'
    })

    map.addSource('active-earthquake', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    })


    const magnitudeRadiusExpression = [
        "interpolate",
        ["linear"],
        ["get", "mag"],
        0, 2,      // mag = 0 -> radius = 2
        1, 4,      // mag = 1 -> radius = 4
        3, 8,      // mag = 3 -> radius = 8
        5, 14,     // mag = 5 -> radius = 14
        7, 22      // mag = 7 -> radius = 22
    ]


    map.addLayer({
        'id': 'circle-earthquakes',
        type: 'circle',
        source: 'earthquakes',
        paint: {
            "circle-radius": magnitudeRadiusExpression,
            "circle-color": "#ff5722",
            "circle-opacity": 0.6,
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 1
        }
    })

    map.addLayer({
        'id': 'active-earthquake',
        type: 'circle',
        source: 'active-earthquake',
        paint: {
            'circle-stroke-color': '#333',
            'circle-stroke-width': 2,
            'circle-opacity': 0,
            'circle-radius': magnitudeRadiusExpression,
        }
    })
})

map.on('click', 'circle-earthquakes', (e) => {
    // get the earthquake features at the clicked point
    const features = map.queryRenderedFeatures(e.point, {
        layers: ['circle-earthquakes']
    })

    // if there are no features, return
    if (features.length > 0) {

        // populate the sidebar with properties of the top-most earthquake feature
        document.getElementById('eq-place').innerHTML = features[0].properties.place;
        document.getElementById('eq-mag').innerHTML = numeral(features[0].properties.mag).format('0.00');
        document.getElementById('eq-time').innerHTML = moment(features[0].properties.time).fromNow();

        // update the active-earthquake source with the clicked feature
        map.getSource('active-earthquake').setData(features[0])
    }
})


map.addControl(new mapboxgl.NavigationControl());


// listen for clicks on the fly-to buttons
document.getElementById('fly-aleutian').addEventListener('click', () => {
    map.flyTo({
        center: [-170.88841, 54.53183],
        zoom: 4.33,
        duration: 1500
    })
})

document.getElementById('fly-japan').addEventListener('click', () => {
    map.fitBounds([
        [111.96593, 25.68929],
        [160.29855, 44.04752]
    ], {
        padding: 40
    })
})

let showEarthquakes = true;

// handle clicks on the toggle button
document.getElementById('toggle-earthquakes').addEventListener('click', () => {
    if (showEarthquakes) {
        map.setLayoutProperty('circle-earthquakes', 'visibility', 'none');
        map.setLayoutProperty('active-earthquake', 'visibility', 'none');

        document.getElementById('toggle-earthquakes').textContent = 'Show Earthquakes';
        showEarthquakes = false;
    } else {
        map.setLayoutProperty('circle-earthquakes', 'visibility', 'visible');
        map.setLayoutProperty('active-earthquake', 'visibility', 'visible');

        document.getElementById('toggle-earthquakes').textContent = 'Hide Earthquakes';
        showEarthquakes = true;
    }
})


