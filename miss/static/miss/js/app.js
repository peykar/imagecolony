var bing_apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";
var map;

function init() {
    map = new OpenLayers.Map({
        div: "map",
    });

    var google_roadmap = new OpenLayers.Layer.Google("Google Roadmap", {type: google.maps.MapTypeId.ROADMAP});
    var google_satellite = new OpenLayers.Layer.Google("Google Satellite", {type: google.maps.MapTypeId.SATELLITE});
    var bing_aerial = new OpenLayers.Layer.Bing({
        name: "Bing Aerial",
        key: bing_apiKey,
        type: "Aerial"
    });

    // note that first layer must be visible
    map.addLayers([google_satellite, bing_aerial]);

    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToMaxExtent();


    //map = new OpenLayers.Map("map");
    
}

