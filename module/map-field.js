import * as $ from 'manhattan-essentials'


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
export class MapView {

    constructor(mapElm, options={}, prefix='data-mh-map--') {

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
                 * @@ START HERE
                 */
                'geocodeInputs': [
                    ['postcode'],
                    ['city']
                ],

            },
            options,
            mapElm,
            prefix
        )

    }

}


// -- Behaviours --

MapView.behaviours = {}


// -- CSS classes --

MapView.css = {}
