import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import {Map, Marker} from 'leaflet';
import * as $ from 'manhattan-essentials'
import {MapView} from '../module/map-view.js'

chai.should()
chai.use(require('sinon-chai'))


describe('Sortable', () => {

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
                'data-mh-map-marker--coords': [52.056398, -2.715974]
            }
        )
        marker1.innerHTML = 'Marker 1'
        document.body.appendChild(marker1)

        const marker2 = $.create(
            'div',
            {
                'data-mh-map-marker': true,
                'data-mh-map-marker--coords': [52.193636, -2.221575]
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
            mapView = new MapView(mapElm)
        })

        afterEach(() => {
            mapView.destroy()
        })
    })
})
