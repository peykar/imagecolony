var bing_apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";
var map;

function init() {
    map = new OpenLayers.Map({
        div: "map",
        allOverlays: true
    });

    var osm = new OpenLayers.Layer.OSM();
/*    var google_roadmap = new OpenLayers.Layer.Google("Google Roadmap", {type: google.maps.MapTypeId.ROADMAP});
    var google_hybrid = new OpenLayers.Layer.Google("Google Hybrid", {type: google.maps.MapTypeId.HYBRID});
    var google_terrain = new OpenLayers.Layer.Google("Google Terrain", {type: google.maps.MapTypeId.TERRAIN});
    var google_satellite = new OpenLayers.Layer.Google("Google Satellite", {type: google.maps.MapTypeId.SATELLITE});

    var bing_road = new OpenLayers.Layer.Bing({
        name: "Bing Road",
        key: bing_apiKey,
        type: "Road"
    });
    var bing_hybrid = new OpenLayers.Layer.Bing({
        name: "Bing Hybrid",
        key: bing_apiKey,
        type: "AerialWithLabels"
    });
    var bing_aerial = new OpenLayers.Layer.Bing({
        name: "Bing Aerial",
        key: bing_apiKey,
        type: "Aerial"
    });

    // note that first layer must be visible
    map.addLayers([osm, google_roadmap, google_hybrid, google_terrain, google_satellite, bing_road, bing_hybrid, bing_aerial]);
*/

    map.addLayers([osm]);
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToMaxExtent();


    //map = new OpenLayers.Map("map");
    
}

