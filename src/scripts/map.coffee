$ = require 'manhattan-essentials'


class Map

    # The prefix that identifies attributes used to configure the plugin
    @clsPrefix: 'data-mh-map--'

    constructor: (elm, options={}) ->

        # Configure the instance
        $.config(
            this,
            {
                # Set to true to allow the map to be dragged by mouse/touch
                dragging: false,

                # The tile layer attribution string to display with the map
                attribution: 'Map data © ' +
                    '<a href="http://openstreetmap.org">OpenStreetMap</a>',

                # The initial coordinates the map will center on
                coords: [52.185766, -2.089655],

                # The padding placed around a group when viewed (see the `home`
                # behaviour for `fitMarkers`).
                groupPadding: [40, 40],

                # The marker source (see `fetchMarkers` behaviour)
                markers: '[data-mh-marker]',

                # The min/max level of zoom the map should support
                minZoom: 8,
                maxZoom: 18,

                # Set to true to allow the mouse scroll wheel to zoom the map
                scrollWheelZoom: false,

                # The URL for the tile layer we'll be using to render the map
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

                # The initial zoom level for the map
                zoom: 13

            },
            options,
            elm,
            @constructor.clsPrefix
        )

        # If the coordinates have been set as a string convert them into a
        # number array.
        if typeof @coords is 'string'
            @coords = @coords.split(',')
            @coords[0] = parseFloat(@coords[0])
            @coords[1] = parseFloat(@coords[1])

        # Set up and configure behaviours
        @_behaviours = {}

        $.config(
            @_behaviours,
            {
                fetchMarkers: 'selector',
                home: 'coords',
                icon: 'default',
                marker: 'default',
                popup: 'none'
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
        @_dom.elm.__mh_map = this

        # Set-up the leaflet map
        @_lmap = new L.Map(
            elm,
            {
                dragging: @dragging,
                scrollWheelZoom: @scrollWheelZoom
            }
        )
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
            'lmarkers',
            {
                get: () => return @_lmarkers.slice()
            }
        )

        # Add markers (and associated popups) to the map
        @_lmarkers = []
        behaviours = @constructor.behaviours
        fetchMarkers = behaviours.fetchMarkers[@_behaviours.fetchMarkers]
        icon = behaviours.icon[@_behaviours.icon]
        makeMarker = behaviours.marker[@_behaviours.marker]
        makePopup = behaviours.popup[@_behaviours.popup]

        for rawMarker in fetchMarkers(this)

            # Add marker
            marker = makeMarker(this, rawMarker[0], icon(rawMarker[1]))
            marker.addTo(@lmap)

            # Add popup (if one)
            popup = makePopup(this, rawMarker[1])
            if popup
                marker.bindPopup(popup)

            # Store a reference to the marker
            @_lmarkers.push(marker)

        # Home the map
        behaviours.home[@_behaviours.home](this)

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
        return "mh-map--#{eventName}"

    # Behaviours

    @behaviours:

        # The `fetchMarkers` behaviour is used to fetch the list of markers that
        # will be displayed on the map. The list should consist of a list of
        # lists in the form:
        #
        #    [[[lat, lon], obj|elm], [[lat, lon], obj|elm]...]
        #
        fetchMarkers:
            'selector': (map) ->
                # Find marker coordinates with the page using the given CSS
                # selector.
                markers = []
                domMarkers = $.many(map.markers)
                for domMarker in domMarkers
                    coords = domMarker.getAttribute('data-mh-marker--coords')
                    coords = coords.split(',')
                    coords[0] = parseFloat(coords[0])
                    coords[1] = parseFloat(coords[1])
                    markers.push([coords, domMarker])
                return markers

        # The `home` behaviour controls how the home view/position of the map
        # is set.
        home:
            'coords': (map) ->
                # Set the home position of the map based on the coordinates
                # given
                map.lmap.setView(
                    new L.LatLng(map.coords[0], map.coords[1]),
                    map.zoom
                )

            'first-marker': (map) ->
                # Set the home position of the map to the location of the first
                # marker.
                if map.lmarkers.length > 0
                    map.lmap.setView(
                        map.lmarkers[0].getLatLng(),
                        map.zoom
                    )
                else
                    # If there aren't any markers default to the `coords`
                    # behaviour.
                    map.constructor.behaviours.home.coords(map)

            'fit-markers': (map) ->
                # Set the home position of the map to be inclusive of all
                # markers.
                if map.lmarkers.length > 0
                    group = new L.featureGroup(map.lmarkers)
                    map.lmap.fitBounds(
                        group.getBounds(),
                        {padding: map.groupPadding}
                    )
                else
                    # If there aren't any markers default to the `coords`
                    # behaviour.
                    map.constructor.behaviours.home.coords(map)

        # The `icon` behaviour is used to create the icon for a marker on the
        # map.
        icon:
            'default': (map, obj) ->
                return new L.Icon.Default()

        # The `marker` behaviour is used to create markers for the map
        marker:
            'default': (map, coords, icon) ->
                # Create a marker using coordinates
                return new L.marker(coords, {icon: icon})

        # The `popup` behaviour is used to create pop up content for markers
        popup:
            'none': (map, obj) ->
                # Don't build a pop up (default)
                return

            'content': (map, obj) ->
                # Create the popup from the markers content
                return obj.firstElementChild.innerHTML


module.exports = {
    Map: Map
}