import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import {Icon, Map, Marker} from 'leaflet';
import * as $ from 'manhattan-essentials'
import {MapView} from '../module/map-view.js'

chai.should()
chai.use(require('sinon-chai'))


describe('MapView', () => {

    let mapElm = null
    let markerElms = null

    beforeEach(() => {
        // Create the map
        mapElm = $.create('div', {'data-mh-map-view': true})
        document.body.appendChild(mapElm)

        // Create a list of markers for the map
        const marker1 = $.create(
            'div',
            {
                'data-mh-map-marker': true,
                'data-mh-map-marker--coords': '52.056398,-2.715974'
            }
        )
        marker1.innerHTML = 'Marker 1'
        document.body.appendChild(marker1)

        const marker2 = $.create(
            'div',
            {
                'data-mh-map-marker': true,
                'data-mh-map-marker--coords': '52.193636,-2.221575'
            }
        )
        marker2.innerHTML = 'Marker 2'
        document.body.appendChild(marker2)

        markerElms = [marker1, marker2]
    })

    afterEach(() => {
        document.body.removeChild(mapElm)
        for (let markerElm of markerElms) {
            document.body.removeChild(markerElm)
        }
    })

    describe('constructor', () => {
        it('should generate a new `MapView` instance', () => {
            const mapView = new MapView(mapElm)
            mapView.should.be.an.instanceof(MapView)
        })
    })

    describe('getters & setters', () => {
        let mapView = null

        beforeEach(() => {
            mapView = new MapView(mapElm)
            mapView.init()
        })

        afterEach(() => {
            mapView.destroy()
        })

        describe('coords', () => {
            it('should return the coordinates for the map', () => {
                mapView.coords.should.deep.equal([52.185766, -2.089655])
            })

            it('should set the coordinates for the map', () => {
                mapView.coords = [50.0, 1.0]
                mapView.coords.should.deep.equal([50.0, 1.0])
            })
        })

        describe('lmap', () => {
            it('should return the Leaflet map for the view', () => {
                mapView.lmap.should.be.an.instanceof(Map)
            })
        })

        describe('lmarkers', () => {
            it('should return a list of Leaflet markers for the '
                + 'view', () => {

                mapView.lmarkers.length.should.equal(2)
            })
        })

        describe('mapElm', () => {
            it('should return the associate map element', () => {
                mapView.mapElm.should.equal(mapElm)
            })
        })

        describe('zoom', () => {
            it('should return the zoom for the map', () => {
                mapView.zoom.should.deep.equal(13)
            })

            it('should set the coordinates for the map', () => {
                mapView.zoom = 15
                mapView.zoom.should.deep.equal(15)
            })
        })
    })

    describe('public methods', () => {
        let mapView = null

        beforeEach(() => {
            mapView = new MapView(mapElm, {'popup': 'content'})
        })

        afterEach(() => {
            mapView.destroy()
        })

        describe('destroy', () => {
            it('should destroy the MapView', () => {
                mapView.init()
                mapView.destroy()

                // Check the map has been removed
                chai.expect(mapView.lmap).to.be.null

                // Check the markers have been cleared
                mapView.lmarkers.should.deep.equal([])
            })
        })

        describe('init', () => {
            it('should initialize the MapView', () => {
                mapView.init()

                // Check a Lealet map has been created
                mapView.lmap.should.be.an.instanceof(Map)

                // Check a Leaflet marker has been created
                mapView.lmarkers.length.should.equal(2)
                mapView.lmarkers[0].should.be.an.instanceof(Marker)
                mapView.lmarkers[1].should.be.an.instanceof(Marker)

                // Check the map coordinates have been set to detaults
                mapView.coords.should.deep.equal([52.185766, -2.089655])

                // Check a popup was bound to the markers
                const {lmarkers} = mapView
                lmarkers[0]._popup._content.innerHTML.should.equal('Marker 1')
                lmarkers[1]._popup._content.innerHTML.should.equal('Marker 2')
            })
        })
    })

    describe('options', () => {
        let mapView = null

        afterEach(() => {
            mapView.destroy()
        })

        describe('coordinates', () => {
            it('should convert a coords string option to pair of [x, y]'
                + 'coordinates', () => {
                mapView = new MapView(mapElm, {'coords': '50.0, -1.0'})
                mapView._options.coords.should.deep.equal([50.0, -1.0])
            })
        })

        describe('groupPadding', () => {
            it('should convert a group padding string to a pair of [x, y]'
                + 'padding values', () => {

                mapView = new MapView(mapElm, {'groupPadding': '50.0, -1.0'})
                mapView._options.groupPadding.should.deep.equal([50.0, -1.0])
            })
        })
    })

    describe('behaviours > fetchMarkers', () => {
        const behaviours = MapView.behaviours.fetchMarkers
        let mapView = null

        beforeEach(() => {
            mapView = new MapView(mapElm)
            mapView.init()
        })

        afterEach(() => {
            mapView.destroy()
        })

        describe('selector', () => {
            it('should return a list of [coordinates, element] from the '
                + 'selected elements', () => {

                const markers = behaviours.selector(mapView)
                markers.should.deep.equal([
                    [[52.056398, -2.715974], markerElms[0]],
                    [[52.193636, -2.221575], markerElms[1]]
                ])
            })
        })
    })

    describe('behaviours > home', () => {
        const behaviours = MapView.behaviours.home
        let mapView = null

        beforeEach(() => {
            mapView = new MapView(mapElm)
            mapView.init()
        })

        afterEach(() => {
            mapView.destroy()
        })

        describe('coords', () => {
            it('should set the map view to a pair of coordinates', () => {
                behaviours.coords(mapView)
                mapView.coords.should.deep.equal([52.185766, -2.089655])
            })
        })

        describe('first-marker', () => {
            it('should set the map view central to the first marker', () => {
                behaviours['first-marker'](mapView)
                mapView.coords.should.deep.equal([52.056398, -2.715974])
            })
            it('should set the map view to the coords if there are no '
                + 'markers', () => {

                // Clear the marker
                mapView._lmarkers = []

                behaviours['first-marker'](mapView)
                mapView.coords.should.deep.equal([52.185766, -2.089655])
            })
        })

        describe('coords', () => {
            it('should set the map view to include all the marker', () => {
                behaviours['fit-markers'](mapView)
                mapView.coords.should.deep.equal([
                    52.12506983006412,
                    -2.4687744999999954
                ])
            })
            it('should set the map view to the coords if there are no '
                + 'markers', () => {

                // Clear the marker
                mapView._lmarkers = []

                behaviours['fit-markers'](mapView)
                mapView.coords.should.deep.equal([52.185766, -2.089655])
            })
        })
    })

    describe('behaviours > icon', () => {
        const behaviours = MapView.behaviours.icon
        let mapView = null

        beforeEach(() => {
            mapView = new MapView(mapElm)
            mapView.init()
        })

        afterEach(() => {
            mapView.destroy()
        })

        describe('default', () => {
            it('should return a default Leaflet icon', () => {
                const icon = behaviours['default'](mapView, {})
                icon.should.be.an.instanceof(Icon)
            })
        })
    })

    describe('behaviours > marker', () => {
        const behaviours = MapView.behaviours.marker
        let mapView = null

        beforeEach(() => {
            mapView = new MapView(mapElm)
            mapView.init()
        })

        afterEach(() => {
            mapView.destroy()
        })

        describe('default', () => {
            it('should return a Leaflet marker with the given coordinates '
                + 'and icon', () => {

                const marker = behaviours['default'](
                    mapView,
                    [50.0, -1.0],
                    new Icon.Default()
                )
                marker.should.be.an.instanceof(Marker)
            })
        })
    })

    describe('behaviours > popup', () => {
        const behaviours = MapView.behaviours.popup
        let mapView = null

        beforeEach(() => {
            mapView = new MapView(mapElm)
            mapView.init()
        })

        afterEach(() => {
            mapView.destroy()
        })

        describe('none', () => {
            it('should return null', () => {
                const popup = behaviours.none(mapView, {})
                chai.expect(popup).to.be.null
            })
        })

        describe('content', () => {
            it('should return the content of the element for the '
                + 'marker', () => {

                const popup = behaviours.content(mapView, markerElms[1])
                popup.innerHTML.should.be.equal('Marker 2')
            })
        })
    })
})
