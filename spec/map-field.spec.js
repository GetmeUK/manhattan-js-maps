import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import {Icon, Map, Marker} from 'leaflet';
import * as $ from 'manhattan-essentials'
import {MapField} from '../module/map-field.js'

chai.should()
chai.use(require('sinon-chai'))


describe('MapField', () => {

    let cityElm = null
    let formElm = null
    let latElm = null
    let lngElm = null
    let mapElm = null
    let postcodeElm = null

    beforeEach(() => {
        // Create the form
        formElm = $.create('form')
        document.body.appendChild(formElm)

        // Fields
        cityElm = $.create(
            'input',
            {
                'name': 'city',
                'type': 'text',
                'value': 'Worcester'
            }
        )
        formElm.appendChild(cityElm)

        latElm = $.create(
            'input',
            {
                'name': 'lat',
                'type': 'text',
                'value': '50.0'
            }
        )
        formElm.appendChild(latElm)

        lngElm = $.create(
            'input',
            {
                'name': 'lng',
                'type': 'text',
                'value': '1.0'
            }
        )
        formElm.appendChild(lngElm)

        postcodeElm = $.create(
            'input',
            {
                'name': 'postcode',
                'type': 'text',
                'value': 'WR7 4NH'
            }
        )
        formElm.appendChild(postcodeElm)

        // Map
        mapElm = $.create('div', {'data-mh-map-form': true})
        formElm.appendChild(mapElm)
    })

    afterEach(() => {
        document.body.removeChild(formElm)
    })

    describe('constructor', () => {
        it('should generate a new `MapField` instance', () => {
            const mapField = new MapField(mapElm)
            mapField.should.be.an.instanceof(MapField)
        })
    })

    describe('getters & setters', () => {
        let mapField = null

        beforeEach(() => {
            mapField = new MapField(mapElm)
            mapField.init()
        })

        afterEach(() => {
            mapField.destroy()
        })

        describe('form', () => {
            it('should return the form associated with the map', () => {
                mapField.form.should.equal(formElm)
            })
        })

        describe('lmap', () => {
            it('should return the Leaflet map for the map field', () => {
                mapField.lmap.should.be.an.instanceof(Map)
            })
        })

        describe('lmarker', () => {
            it('should return the Leaflet marker for the map field', () => {
                mapField.lmarker.should.be.an.instanceof(Marker)
            })
        })

        describe('mapElm', () => {
            it('should return the associate map element', () => {
                mapField.mapElm.should.equal(mapElm)
            })
        })
    })

    describe('options', () => {
        let mapField = null

        afterEach(() => {
            mapField.destroy()
        })

        describe('geocodeInputs', () => {
            it('should convert a geocode inputs string to to a list of lists',
                () => {

                mapField = new MapField(
                    mapElm,
                    {'geocodeInputs': 'town+postcode,postcode,town'}
                )
                mapField._options.geocodeInputs.should.deep.equal([
                    ['town', 'postcode'],
                    ['postcode'],
                    ['town']
                ])
            })
        })
    })

    describe('public methods', () => {
        let mapField = null

        global.fetch = () => {
            return Promise.resolve(
                {
                    'json': () => {
                        return {'matches': [{'point': [50.0, 1.0]}]}
                    }
                }
            )
        }

        beforeEach(() => {
            mapField = new MapField(mapElm, {'geocode': 'geocodeuk'})
        })

        afterEach(() => {
            delete window.fetch
        })

        describe('destroy', () => {
            it('should destroy the MapField', () => {
                mapField.init()
                mapField.destroy()

                // Check the map has been removed
                chai.expect(mapField.lmap).to.be.null

                // Check the marker has been removed
                chai.expect(mapField.lmarker).to.be.null

                // Check the find location button has been removed
                chai.expect(mapField._dom.findLocation).to.be.null

                // Check event listeners have been removed
                sinon.spy(mapField, '_sync')
                $.dispatch(latElm, 'change')
                mapField._sync.should.not.have.been.called
            })
        })

        describe('init', () => {
            it('should initialize the MapField', async () => {
                mapField.init()

                // Check a Lealet map has been created
                mapField.lmap.should.be.an.instanceof(Map)

                // Check a leaflet marker has been created
                mapField.lmarker.should.be.an.instanceof(Marker)

                // Check the position of the map
                mapField.lmap.getCenter().lat.should.equal(50.0)
                mapField.lmap.getCenter().lng.should.equal(1.0)

                // Check a find location button has been added
                mapField._dom.findLocation.should.exist

                // Check the required event listeners have been added
                sinon.spy(mapField, '_findLocation')
                sinon.spy(mapField, '_sync')

                $.dispatch(mapField._dom.findLocation, 'click')
                $.dispatch(latElm, 'change')

                mapField._findLocation.should.have.been.called
                mapField._sync.should.have.been.called
            })
        })
    })

})
