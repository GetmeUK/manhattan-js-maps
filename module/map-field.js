import * as $ from 'manhattan-essentials'
import {Icon, LatLng, Map, Marker, TileLayer} from 'leaflet';


// -- Class definition --

/**
 * Display a map with a marker that can be integrated within a form to:
 *
 * - Show the geographic position described by one or more fields (e.g
 *   lat/lng).
 * - Allow the form's lat/lng field values to be updated when the marker on
 *   form is repositioned by a user.
 * - Support for geocoding fields within the form (e.g town, postcode) to set
 *   the position of the marker and the form's lat/lng field values.
 */
export class MapField {

    constructor(mapElm, options={}, prefix='data-mh-map-field--') {

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
                 * Flag indicating if the map field can be dragged by
                 * mouse/touch.
                 */
                'dragging': true,

                /**
                 * The form the map is integrated with.
                 */
                'form': null,

                /**
                 * A list of input selectors used to build a query string to
                 * request a geocode for a descriptive location (like an
                 * address).
                 *
                 * To specify a list of geocode inputs as a string you comma
                 * (,) separate the input lists and plus (+) separate inputs,
                 * e.g:
                 *
                 *    data-mh-map-field--geocode-inputs=
                 *        "address1+city+postcode,postcode"
                 *
                 */
                'geocodeInputs': [
                    ['postcode'],
                    ['city']
                ],

                /**
                 * The URL (endpoint) for the geocoding service.
                 */
                'geocodeURL': '',

                /**
                 * Selectors for the lat/lng input fields.
                 */
                'latInput': 'lat',
                'lngInput': 'lng',

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
                 * This zoom level for the map field.
                 */
                'zoom': 13
            },
            options,
            mapElm,
            prefix
        )

        // If `geocodeInputs` has been set as a string convert it to an array
        // of arrays.
        if (typeof this._options.geocodeInputs === 'string') {
            const inputs = []
            for (let input of this._options.geocodeInputs.split(',')) {
                inputs.push(input.split('+'))
            }
            this._options.geocodeInputs = inputs
        }

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'geocode': 'none',
                'getForm': 'parent',
                'getValue': 'inputs',
                'icon': 'default',
                'setValue': 'inputs',
                'sync': 'inputs'
            },
            options,
            mapElm,
            prefix
        )

        // A handle to the Leaflet map
        this._lmap = null

        // A list of Leaflet markers added to the map
        this._lmarker = null

        // Domain for related DOM elements
        this._dom = {
            'findLocation': null,
            'form': null,
            'map': null
        }

        // Store a reference to the mapElm
        this._dom.map = mapElm

        // Domain for handlers
        this._handlers = {
            'findLocation': (event) => {
                event.preventDefault()
                event.stopPropagation()
                this._findLocation()
            },
            'sync': (event) => {
                this._sync()
            }
        }
    }

    // -- Getter & Setters --

    get form() {
        return this.constructor.behaviours.getForm[this._behaviours.getForm](
            this,
            this._options.form
        )
    }

    get lmap() {
        return this._lmap
    }

    get lmarker() {
        return this._lmarker
    }

    get mapElm() {
        return this._dom.map
    }

    // -- Public methods --

    /**
     * Remove the map field.
     */
    destroy() {
        // Remove event listeners
        const {behaviours} = this.constructor
        const fields = behaviours.sync[this._behaviours.sync](this)
        for (let field of fields) {
            $.ignore(field, {'change': this._handlers.sync})
        }

        // Remove find location button
        if (this._dom.findLocation !== null) {
            $.ignore(
                this._dom.findLocation,
                {'click': this._handlers.findLocation}
            )
            this._dom.findLocation.parentNode.remove(this._dom.findLocation)
            this._dom.findLocation = null
        }

        // Remove the map and markers
        if (this.lmap !== null) {
            this.lmap.remove()
        }
        this._lmap = null
        this._lmarker = null

        // Clear any reference to the form
        this._dom.form = null

        // Remove the map field reference from the container
        delete this._dom.map._mhMapField
    }

    /**
     * Initialize the map field.
     */
    init() {
        const {behaviours} = this.constructor

        // Store a reference to the map field instance against the map
        this._dom.map._mhMapField = this

        // Set-up the Leaflet map
        this._lmap = new Map(
            this.mapElm,
            {
                'dragging': this._options.dragging,
                'scrollWheelZoom': this._options.scrollWheelZoom
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

        // Add a marker at the current coordinates
        const getValue = behaviours.getValue[this._behaviours.getValue]
        const createIcon = behaviours.icon[this._behaviours.icon]

        this._lmarker = new Marker(
            getValue(this) || [0, 0],
            {
                'draggable': true,
                'icon': createIcon(this),
                'keyboard': false
            }
        )
        this._lmarker.addTo(this.lmap)

        // Add event listeners for the marker so we can handle the marker
        // being moved.
        this.lmarker.on({
            'dragend': (event) => {
                // Set the lat/lng in the form
                const setValue = this
                    .constructor
                    .behaviours
                    .setValue[this._behaviours.setValue]
                const latLng = this.lmarker.getLatLng()
                setValue(this, [latLng.lat, latLng.lng])

                // Center the map on the marker
                this.lmap.setView(latLng)
            }
        })

        // Set up event listeners
        const fields = behaviours.sync[this._behaviours.sync](this)
        for (let field of fields) {
            $.listen(field, {'change': this._handlers.sync})
        }

        if (this._behaviours.geocode !== 'none') {

            // Add the find location button to the map
            const control = $.one(
                '.leaflet-bottom.leaflet-left',
                this.mapElm
            )
            this._dom.findLocation = $.create(
                'div',
                {
                    'class': `${this.constructor.css['findLocation']} \
leaflet-control`
                }
            )
            this._dom.findLocation.textContent = 'Find location'
            control.appendChild(this._dom.findLocation)

            // Attempt to geocode/find the a location whenever the button is
            // clicked.
            $.listen(
                this._dom.findLocation,
                {'click': this._handlers.findLocation}
            )
        }

        // Center the map on the marker
        this.lmap.setView(this.lmarker.getLatLng(), this._options.zoom)
    }

    // -- Private methods --

    /**
     * Find the lat/lng for a location and if found update the map and form.
     */
    _findLocation() {
        const {behaviours} = this.constructor
        const geocode = behaviours.geocode[this._behaviours.geocode]
        const setValue = behaviours.setValue[this._behaviours.setValue]

        // Build a list of locations to attempt to geocode
        const locations = []
        for (let inputs of this._options.geocodeInputs) {
            let location = []
            for (let input of inputs) {
                let inputElm = $.one(`[name="${input}"]`, this.form)
                if (inputElm && inputElm.value.trim()) {
                    location.push(inputElm.value.trim())
                }
            }
            if (location.length > 0) {
                locations.push(location.join(','))
            }
        }

        // Attempt to find the locations
        const _lookup = (_locations) => {
            return geocode(this, _locations.shift())
                .then((latLng) => {
                    // Found, set the new location in the map and the form
                    this.lmarker.setLatLng(latLng)
                    this.lmap.setView(this.lmarker.getLatLng())
                })
                .catch(() => {
                    // Not found, try the next one if there is one
                    if (_locations.length > 0) {
                        return _lookup(_locations)
                    }
                })
        }
        return _lookup(locations)
    }

    /**
     * Sync the lat/lng values in the form with the map.
     */
    _sync() {
        const {behaviours} = this.constructor
        const getValue = behaviours.getValue[this._behaviours.getValue]
        const setValue = behaviours.setValue[this._behaviours.setValue]

        // Get the current marker lat/lng
        const latLng = this.lmarker.getLatLng()

        // Sync the form and map
        const formLatLng = getValue(this)
        if (formLatLng) {
            // Update the marker/map with the new coordinates
            this.lmarker.setLatLng(formLatLng)
            this.lmap.setView(this.lmarker.getLatLng())
        } else {
            // Reset the form value if it isn't valid
            setValue(
                this,
                [
                    latLng.lat,
                    latLng.lng
                ]
            )
        }
    }
}


// -- Behaviours --

MapField.behaviours = {

    /**
     * The `geocode` behaviour controls the geocoding of descriptive location
     * data (such as an address).
     */
    'geocode': {

        /**
         * No geocoding available.
         */
        'none': (inst, location) => {
            return null
        },

        /**
         * Use the GeocodeUK.com service.
         */
        'geocodeuk': (inst, location) => {

            // Build the API URL
            const apiKey = inst._options.geocodeURL
            const url = `https://geocodeuk.com/api/v1/${apiKey}/geocode\
?q=${location}`

            // Fetch the location
            return fetch(url)
                .then((response) => {
                    return response.json()
                })
                .then((json) => {
                    if (json.matches && json.matches.length > 0) {
                        return json.matches[0].point
                    }
                    throw new Error('No match')
                })
        }
    },

    /**
     * The `getForm` behaviour deminines how the form for the map field is
     * selected.
     */
    'getForm': {

        /**
         * Select the closest form using a CSS selector.
         */
        'closest': (inst, selector) => {
            return $.closest(inst.mapElm, selector)
        },

        /**
         * Return the specified form (this assumes the form element was
         * passed in the options).
         */
        'elm': (inst, form) => {
            return form
        },

        /**
         * Select the form the map field resides in.
         */
        'parent': (inst, form) => {
            return $.closest(inst.mapElm, 'form')
        },

        /**
         * Select the form using a CSS selector.
         */
        'selector': (inst, selector) => {
            return $.one(selector)
        }
    },

    /**
     * The `getValue` behaviour determines how the lat/lng values are
     * acquired from the form.
     */
    'getValue': {

        /**
         * Get the lat/lng values from two separate input fields.
         */
        'inputs': (inst) => {
            const latInput = $.one(
                `[name="${inst._options.latInput}"]`,
                inst.form
            )
            const lat = parseFloat(latInput.value)
            const lngInput = $.one(
                `[name="${inst._options.lngInput}"]`,
                inst.form
            )
            const lng = parseFloat(lngInput.value)

            // Validate lat/lng were valid numbers
            if(isNaN(lat) || isNaN(lng)) {
                return null
            }

            // Validate the range of the lat/lng
            if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
                return null
            }

            return [lat, lng]
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
     * The `setValue` behaviour determines how the lat/lon values are stored.
     */
    'setValue': {

        /**
         * Set the lat/lng values for two separate input fields.
         */
        'inputs': (inst, latLng) => {
            const latInput = $.one(
                `[name="${inst._options.latInput}"]`,
                inst.form
            )
            const lngInput = $.one(
                `[name="${inst._options.lngInput}"]`,
                inst.form
            )
            const [lat, lng] = latLng
            latInput.value = lat
            lngInput.value = lng
        }

    },

    /**
     * The `sync` behaviour determines which fields in the form should be
     * monitored for changes in order to keep the map and form in synd.
     */
    'sync': {

        /**
         * Return lat/lng input fields.
         */
        'inputs': (inst) => {
            return $.many(
                `[name="${inst._options.latInput}"],
                 [name="${inst._options.lngInput}"]`,
                inst.form
            )
        }

    }
}


// -- CSS classes --

MapField.css = {

    /**
     * Applied to the find location button on the map.
     */
    'findLocation': 'mh-find-location'

}
