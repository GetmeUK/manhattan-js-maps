import * as $ from 'manhattan-essentials'
import {FeatureGroup, Icon, LatLng, Map, Marker, TileLayer} from 'leaflet';


// -- Class definition --

/**
 * Display a map (a simple wrapper for Leaflet maps that provides a Manhattan
 * plugin API).
 *
 * To gain access to the underlying Leaflet map after the MapView instance has
 * been initialized use the `lmap` property.
 */
export class MapView {

    constructor(mapElm, options={}, prefix='data-mh-map-view--') {

        // Configure the options
        this._options = {}

        $.config(
            this._options,
            {

                /**
                 * A tile layer attribution string to display (required by
                 * some vendors including the default vendor OpenStreetMap.
                 */
                'attribution': 'Map data © '
                    + '<a href="https://openstreetmap.org">OpenStreetMap</a>',

                /**
                 * The center coordinates of the map view (lat, lng).
                 */
                'coords': [52.185766, -2.089655],

                /**
                 * Flag indicating if the map view can be dragged by
                 * mouse/touch.
                 */
                'dragging': false,

                /**
                 * The padding placed around a group when viewed (see the
                 * `home` behaviour for `fitMarkers`).
                 */
                'groupPadding': [40, 40],

                /**
                 * The marker source (see `fetchMarkers` behaviour).
                 */
                'markers': '[data-mh-map-marker]',

                /**
                 * The min/max levels of zoom the map should allow.
                 */
                'minZoom': 8,
                'maxZoom': 18,

                /**
                 * Set to true to allow the mouse scroll wheel to zoom the
                 * map.
                 */
                'scrollWheelZoom': false,

                /**
                 * The URL for the tile layer used to render the map, the
                 * default vendor is OpenStreetMap.
                 */
                'tileLayerURL': 'http://{s}.tile.openstreetmap.org/'
                    + '{z}/{x}/{y}.png',

                /**
                 * This zoom level for the map view.
                 */
                'zoom': 13,

                /**
                 * Flag to indicate whether the zoom control should be rendered
                 */
                'zoomControl': false
            },
            options,
            mapElm,
            prefix
        )

        // If the coordinates have been set as a string convert them to an
        // array.
        if (typeof this._options.coords === 'string') {
            this._options.coords = this._options.coords.split(',')
            const [lat, lon] = this._options.coords
            this._options.coords[0] = parseFloat(lat)
            this._options.coords[1] = parseFloat(lon)
        }

        // If the group padding has been set as a string convert it to an
        // array.
        if (typeof this._options.groupPadding === 'string') {
            this._options.groupPadding = this._options.groupPadding.split(',')
            const [paddingX, paddingY] = this._options.groupPadding
            this._options.groupPadding[0] = parseFloat(paddingX)
            this._options.groupPadding[1] = parseFloat(paddingY)
        }

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'fetchMarkers': 'selector',
                'home': 'coords',
                'icon': 'default',
                'marker': 'default',
                'popup': 'none'
            },
            options,
            mapElm,
            prefix
        )

        // A handle to the Leaflet map
        this._lmap = null

        // A list of Leaflet markers added to the map
        this._lmarkers = []

        // Domain for related DOM elements
        this._dom = {'map': null}

        // Store a reference to the mapElm
        this._dom.map = mapElm
    }

    // -- Getters & Setters --

    get coords() {
        const latLng = this.lmap.getCenter()
        return [latLng.lat, latLng.lng]
    }

    set coords(value) {
        this.lmap.setView(new LatLng(value[0], value[1]))
    }

    get lmap() {
        return this._lmap
    }

    get lmarkers() {
        return this._lmarkers.slice()
    }

    get mapElm() {
        return this._dom.map
    }

    get zoom() {
        return this.lmap.getZoom()
    }

    set zoom(value) {
        this.lmap.setZoom(value)
    }

    // -- Public methods --

    /**
     * Remove the map view.
     */
    destroy() {
        // Remove the map and markers
        if (this.lmap !== null) {
            this.lmap.remove()
        }
        this._lmap = null
        this._lmarkers = []

        // Remove the map view reference from the container
        delete this._dom.map._mhMapView
    }

    /**
     * Initialize the map view.
     */
    init() {
        const {behaviours} = this.constructor

        // Store a reference to the map view instance against the map
        this._dom.map._mhMapView = this

        // Set-up the Leaflet map
        this._lmap = new Map(
            this.mapElm,
            {
                'dragging': this._options.dragging,
                'scrollWheelZoom': this._options.scrollWheelZoom,
                'zoomControl': this._options.zoomControl
            }
        )
        const layer = new TileLayer(
            this._options.tileLayerURL,
            {
                'minZoom': this._options.minZoom,
                'maxZoom': this._options.maxZoom,
                'attribution': this._options.attribution
            }
        )
        this._lmap.addLayer(layer)

        // Add markers to the map
        const fetchMarkers = behaviours
            .fetchMarkers[this._behaviours.fetchMarkers]
        const createIcon = behaviours.icon[this._behaviours.icon]
        const createMarker = behaviours.marker[this._behaviours.marker]
        const createPopup = behaviours.popup[this._behaviours.popup]

        for (let marker of fetchMarkers(this)) {

            // Add the marker
            let lmarker = createMarker(
                this,
                marker[0],
                createIcon(marker[1])
            )
            lmarker.addTo(this.lmap)
            this._lmarkers.push(lmarker)

            // Add popup
            let popup = createPopup(this, marker[1])
            if (popup) {
                lmarker.bindPopup(popup)
            }
        }

        // Show the home view of the map
        behaviours.home[this._behaviours.home](this)
    }
}


// -- Behaviours --

MapView.behaviours = {

    /**
     * The `fetchMarkers` behaviour is used to fetch the list of markers that
     * will be displayed on the map. The list should consist of a list of
     * lists in the form:
     *
     *    [[[lat, lng], obj|elm], ...]
     *
     */
    'fetchMarkers': {

        /**
         * Find marker coordinates with the page using the given CSS selector.
         */
        'selector': (inst) => {
            const markers = []
            const markerElms = $.many(inst._options.markers)
            for (let markerElm of markerElms) {
                let coords = markerElm
                    .getAttribute('data-mh-map-marker--coords')
                coords = coords.split(',')
                coords[0] = parseFloat(coords[0])
                coords[1] = parseFloat(coords[1])
                markers.push([coords, markerElm])
            }
            return markers
        }

    },

    /**
     * The `home` behaviour controls how the home view/position of the map is
     * set.
     */
    'home': {

        /**
         * Set the home position of the map based on the given coordinates.
         */
        'coords': (inst) => {
            inst.zoom = inst._options.zoom
            inst.coords = inst._options.coords
        },

        /**
         * Set the home position of the map to the location of the first
         * marker.
         */
        'first-marker': (inst) => {
            if (inst.lmarkers.length > 0) {
                const coords = inst.lmarkers[0].getLatLng()
                inst.zoom = inst._options.zoom
                inst.coords = [coords.lat, coords.lng]
            } else {
                inst.constructor.behaviours.home.coords(inst)
            }
        },

        /**
         * Set the home position of the map to be inclusive of all markers.
         */
        'fit-markers': (inst) => {
            if (inst.lmarkers.length > 0) {
                const group = new FeatureGroup(inst.lmarkers)
                inst.lmap.fitBounds(
                    group.getBounds(),
                    {'padding': inst._options.groupPadding}
                )
            } else {
                inst.constructor.behaviours.home.coords(inst)
            }
        }

    },

    /**
     * The `icon` behaviour is used to create the icon for a marker on the
     * map.
     */
    'icon': {

        /**
         * Return the default leaflet icon.
         */
        'default': (inst, obj) => {
            return new Icon.Default()
        }

    },

    /**
     * The `marker` behaviour is used to create markers for the map.
     */
    'marker': {

        /**
         * Return a leaflet marker for the given coords and icon.
         */
        'default': (inst, coords, icon) => {
            return new Marker(coords, {icon})
        }

    },

    /**
     * The `popup` behaviour is used to create pop up content for markers.
     */
    'popup': {

        /**
         * Don't build a pop up for the marker (default).
         */
        'none': (inst, obj) => {
            return null
        },

        /**
         * Create a popup using the content of the element associated with the
         * marker.
         */
        'content': (inst, obj) => {
            const popupBody = $.create('div')
            popupBody.innerHTML = obj.innerHTML
            return popupBody
        }

    }

}


// -- CSS classes --

MapView.css = {}
