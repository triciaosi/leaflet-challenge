// Creating the map object
var myMap = L.map("map", {
    center: [40.7128, -95.5],
    zoom: 3
});

// Adding the tile layer
var basemap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'", {
    attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
});

var themap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

basemap.addTo(myMap)

// Build dropdown menu
var baseMaps = {
    "Global Earthquakes": basemap,
    "Global Blue": themap,

};
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();


var overlays = {
    "Tectonic Plates": tectonicplates,
    Earthquakes: earthquakes
};

L.control
    .layers(baseMaps, overlays)
    .addTo(myMap);




// Use this link to get the GeoJSON data.
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Getting our GeoJSON data
d3.json(link).then(function (data) {
    // Creating a GeoJSON layer with the retrieved data

    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // set colors of circles
    function getColor(magnitude) {
        if (magnitude > 5) {
            return "#ea2c2c";
        }
        else if (magnitude > 4) {
            return "#ea822c";
        }
        else if (magnitude > 3) {
            return "#ee9c00";
        }
        else if (magnitude > 2) {
            return "#eecc00";
        }
        else if (magnitude > 1) {
            return "#d4ee00";
        }
        else {
            return "#98ee00";
        }
    }
    // determine size of each circle marker
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }

        return magnitude * 4;
    }


    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            console.log(data);
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
    }).addTo(earthquakes);

    earthquakes.addTo(myMap)

    let legend = L.control({
        position: "bottomright"
    });


    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        const magnitudes = [0, 1, 2, 3, 4, 5];
        const colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
        ];

        // Looping through our intervals to generate a label with a colored square for each interval.
        for (var i = 0; i < magnitudes.length; i++) {
            console.log(colors[i]);
            div.innerHTML +=
                "<i style='background: " + colors[i] + "'></i> " +
                magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
        }
        return div;
    };


    legend.addTo(myMap);


    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {

        L.geoJson(platedata, {
            color: "orange",
            weight: 2
        }).addTo(tectonicplates);

        tectonicplates.addTo(myMap);
    });

});
