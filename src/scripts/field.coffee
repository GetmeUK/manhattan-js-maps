$ = require 'manhattan-essentials'
map = require './map.coffee'

class MapField

    # The prefix that identifies attributes used to configure the plugin
    @clsPrefix: 'data-mh-map-field--'

    constructor: (elm, options={}) ->

        # Configure the instance
        $.config(
            this,
            {
                # The tile layer attribution string to display with the map
                attribution: 'Map data © ' +
                    '<a href="http://openstreetmap.org">OpenStreetMap</a>',

                # A list of input selectors used to build content to request a
                # geocode for a descriptive location (like an address).
                #
                # To specify a list of geocode inputs as a string you comma
                # (,) separate the input lists and plus (+) separate inputs,
                # e.g:
                #
                #    data-geocode-inputs="address1+city+postcode,postcode"
                #
                geocodeInputs: [['postcode'], ['city']],

                # The URL endpoing for the geocoding service
                geocodeUrl: '',

                # Selectors for the input for the field
                latInput: 'lat',
                lonInput: 'lon',

                # The min/max level of zoom the map should support
                minZoom: 8,
                maxZoom: 18,

                # The URL for the tile layer we'll be using to render the map
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

                # The initial zoom level for the map
                zoom: 13
            },
            options,
            elm,
            @constructor.clsPrefix
        )

        # If the geocode inputs have been set as a string convert them into a
        # input name arrays.
        if typeof @geocodeInputs is 'string'
            inputs = []
            for inputsStr in @geocodeInputs.split(',')
                inputs.push(inputsStr.split('+'))

        # Set up and configure behaviours
        @_behaviours = {}

        $.config(
            @_behaviours,
            {
                geocode: 'none',
                getValue: 'inputs',
                icon: 'default',
                setValue: 'inputs',
                sync: 'inputs'
            },
            options,
            elm,
            @constructor.clsPrefix
        )

        # Domain for related DOM elements
        @_dom = {}

        # Store a reference to the elment the map is being applied to (we
        # also store a reverse reference to this instance against the element).
        @_dom.elm = elm
        @_dom.elm.__mh_mapField = this

        # Set-up the leaflet map
        @_lmap = new L.Map(elm)
        @_lmap.addLayer(
            new L.TileLayer(
                @url,
                {
                    minZoom: @minZoom,
                    maxZoom: @maxZoom,
                    attribution: @attribution
                }
            )
        )

        # Define read-only properties
        Object.defineProperty(this, 'elm', {value: @_dom.elm})
        Object.defineProperty(this, 'lmap', {value: @_lmap})
        Object.defineProperty(
            this,
            'lmarker',
            {
                get: () => return @_lmarker
            }
        )

        # Add a marker at the current coordinates
        behaviours = @constructor.behaviours
        getValue = behaviours.getValue[@_behaviours.getValue]
        icon = behaviours.icon[@_behaviours.icon]

        @_lmarker = new L.marker(
            getValue(this) or [0, 0],
            {
                draggable: true,
                icon: icon(this),
                keyboard: false
            }
        )
        @_lmarker.addTo(@lmap)

        # Add event listener for the marker being dragged to a new location
        @lmarker.on
            'dragend': (ev) =>
                # Update the field value
                behaviours = @constructor.behaviours
                setValue = behaviours.setValue[@_behaviours.setValue]
                latLon = @lmarker.getLatLng()
                setValue(this, [latLon.lat, latLon.lng])

                # Center the map on the marker
                @lmap.setView(@lmarker.getLatLng(), @zoom)

        # Add event listeners for the lat/lon inputs
        syncInputs = (ev) =>
            # Get the current lat/lon
            latLon = @lmarker.getLatLng()
            latLon = [latLon.lat, latLon.lng]

            # Get the value
            behaviours = @constructor.behaviours
            getValue = behaviours.getValue[@_behaviours.getValue]
            setValue = behaviours.setValue[@_behaviours.setValue]
            newLatLon = getValue(this)

            # If the new value is valid
            if newLatLon
                @lmarker.setLatLng(newLatLon)

            else
                # Reset the lat/lon
                setValue(this, latLon)

            # Center the map on the marker
            @lmap.setView(@lmarker.getLatLng(), @zoom)

        $.listen($.one("[name='#{ @latInput }']"), change: syncInputs)
        $.listen($.one("[name='#{ @lonInput }']"), change: syncInputs)

        # If a geocode behaviour has been defined then add a find location
        # button and implement geocoding support.
        unless @_behaviours.geocode is 'none'

            # Add find location button to the controls
            control = $.one('.leaflet-bottom.leaflet-left', @elm)
            @_dom.findLocation = $.create(
                'div',
                {'class': 'mh-map-field__find-location leaflet-control'}
            )
            @_dom.findLocation.textContent = 'Find location'
            control.appendChild(@_dom.findLocation)

            # Add an event listener for find location button
            $.listen @_dom.findLocation, 'click': (ev) =>
                ev.preventDefault()

                # Build a prioritized list of locations to attempt to geocode
                locations = []
                for inputs in @geocodeInputs
                    location = []
                    for input in inputs
                        domInput = $.one("[name='#{ input }']")
                        if domInput and domInput.value.trim()
                            location.push(domInput.value.trim())

                    if location.length > 0
                        locations.push(location.join(','))

                # Attempt to geocode each location in priority order
                callback = (locations) =>
                    behaviours = @constructor.behaviours
                    geocode = behaviours.geocode[@_behaviours.geocode]
                    setValue = behaviours.setValue[@_behaviours.setValue]

                    _callback = (latLon) =>
                        # If the geocoder returned a valid lat/lon update the
                        # map and associated lat lon fields.
                        if latLon
                            setValue(this, latLon)
                            @lmarker.setLatLng(latLon)
                            @lmap.setView(@lmarker.getLatLng(), @zoom)
                            return

                        # No valid location found yet, try the next location
                        if locations.length is 0
                            return

                        location = locations.shift()
                        latLon = geocode(this, location, callback(locations))

                    return _callback

                callback(locations)()

        # Center the map on the marker
        @lmap.setView(@lmarker.getLatLng(), @zoom)

    # Private methods

    _bem: (block, element='', modifier='') ->
        # Build and return a class name
        name = block
        if element
            name = "#{name}__#{element}"
        if modifier
            name = "#{name}--#{modifier}"
        return name

    _et: (eventName) ->
        # Generate an event type name
        return "mh-map-field--#{eventName}"

    # Behaviours

    @behaviours:

        # The `geocode` behaviour controls the geocoding of descriptive
        # location data (such as an address).
        geocode:

            'none': (mapField, location, callback) ->
                return null

        # The `getValue` behaviour determines how the lat/lon value is
        # obtained.
        getValue:
            'inputs': (mapField) ->
                lat = parseFloat($.one("[name='#{ mapField.latInput }']").value)
                lon = parseFloat($.one("[name='#{ mapField.lonInput }']").value)

                # Lat/lon must be valid numbers
                if isNaN(lat) or isNaN(lon)
                    return null

                # Lat/Lon must be within range
                if lat < -180 or lat > 180 or lon < -90 or lon > 90
                    return null

                return [lat, lon]

        # The `icon` behaviour is used to create the icon for the marker on
        # the map.
        icon:
            'default': (mapField) ->
                return new L.Icon.Default()

        # The `setValue` behaviour determines how the lat/lon values are
        # stored.
        setValue:
            'inputs': (mapField, latLon) ->
                $.one("[name='#{ mapField.latInput }']").value = latLon[0]
                $.one("[name='#{ mapField.lonInput }']").value = latLon[1]


module.exports = {
    MapField: MapField
}