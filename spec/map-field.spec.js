import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import {Icon, Map, Marker} from 'leaflet';
import * as $ from 'manhattan-essentials'
import {MapField} from '../module/map-field.js'

chai.should()
chai.use(require('chai-as-promised'))
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

        beforeEach(() => {
            mapField = new MapField(mapElm, {'geocode': 'geocodeuk'})
            global.fetch = () => {
                return Promise.resolve(
                    {
                        'json': () => {
                            return {'matches': [{'point': [50.0, 1.0]}]}
                        }
                    }
                )
            }
            sinon.spy(mapField, '_findLocation')
            sinon.spy(mapField, '_sync')
        })

        afterEach(() => {
            mapField._findLocation.restore()
            mapField._sync.restore()
            delete global.fetch
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
                $.dispatch(latElm, 'change')
                mapField._sync.should.not.have.been.called
            })
        })

        describe('init', () => {
            it('should initialize the MapField', () => {
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

                $.dispatch(mapField._dom.findLocation, 'click')
                $.dispatch(latElm, 'change')

                mapField._findLocation.should.have.been.called
                mapField._sync.should.have.been.called
            })

            describe('invalid intial lat/lng values', () => {
                afterEach(() => {
                    latElm.value = 50
                })

                it('should set the map view to 0, 0', () => {
                    latElm.value = 'a'
                    mapField.init()

                    // Check the position of the map
                    mapField.lmap.getCenter().lat.should.equal(0.0)
                    mapField.lmap.getCenter().lng.should.equal(0.0)
                })
            })
        })
    })

    describe('private methods', () => {
        let mapField = null

        beforeEach(() => {
            mapField = new MapField(mapElm, {'geocode': 'geocodeuk'})
            mapField.init()
        })

        afterEach(() => {
            mapField.destroy()
        })

        describe('_findLocation', () => {

            beforeEach(() => {
                global.fetch = () => {
                    return Promise.resolve(
                        {
                            'json': () => {
                                return {'matches': [{'point': [55.0, 2.0]}]}
                            }
                        }
                    )
                }
                sinon.spy(MapField.behaviours.geocode, 'geocodeuk')
            })

            afterEach(() => {
                delete global.fetch
                MapField.behaviours.geocode.geocodeuk.restore()
            })

            it('should find a location and update the map to show '
                + 'it', (done) => {

                mapField._findLocation().then(() => {
                    mapField.lmap.getCenter().lat.should.equal(55.0)
                    mapField.lmap.getCenter().lng.should.equal(2.0)
                    mapField.lmarker.getLatLng().lat.should.equal(55.0)
                    mapField.lmarker.getLatLng().lng.should.equal(2.0)
                    done()
                }).catch((err) => {
                    done(err)
                })
            })

            it('should not include empty strings in the location '
                + 'search', () => {
                const geocode = MapField.behaviours.geocode.geocodeuk

                postcodeElm.value = ''
                $.dispatch(mapField._dom.findLocation, 'click')

                geocode.should.have.been.calledWith(mapField, 'Worcester')
            })

            it('should do nothing if not location is found', (done) => {
                global.fetch = () => {
                    return Promise.resolve(
                        {
                            'json': () => {
                                return {}
                            }
                        }
                    )
                }

                mapField._findLocation().then(() => {
                    mapField.lmap.getCenter().lat.should.equal(50.0)
                    mapField.lmap.getCenter().lng.should.equal(1.0)
                    mapField.lmarker.getLatLng().lat.should.equal(50.0)
                    mapField.lmarker.getLatLng().lng.should.equal(1.0)
                    done()
                }).catch((err) => {
                    done(err)
                })
            })
        })

        describe('_sync', () => {

            afterEach(() => {
                latElm.value = '50.0'
                lngElm.value = '1.0'
            })

            it('should set the map position to the value of the lat/lon'
                + 'fields if valid', () => {

                latElm.value = '55.0'
                lngElm.value = '2.0'
                mapField._sync()

                mapField.lmap.getCenter().lat.should.equal(55.0)
                mapField.lmap.getCenter().lng.should.equal(2.0)
                mapField.lmarker.getLatLng().lat.should.equal(55.0)
                mapField.lmarker.getLatLng().lng.should.equal(2.0)
            })

            it('should set the lat/lng fields to the map position if their '
                + 'values are invalid', () => {

                latElm.value = 'a'
                lngElm.value = 'b'
                mapField._sync()

                latElm.value.should.equal('50')
                lngElm.value.should.equal('1')
            })

        })
    })

    describe('events', () => {
        const behaviours = MapField.behaviours.geocode
        let mapField = null

        beforeEach(() => {
            mapField = new MapField(mapElm)
            mapField.init()
        })

        afterEach(() => {
            mapField.destroy()
        })

        describe('marker > dragend', () => {
            it('should set the value of lat/lng', () => {

                mapField.lmarker.setLatLng([55.0, 2.0])
                mapField.lmarker.fire('dragend')

                mapField.lmap.getCenter().lat.should.equal(55.0)
                mapField.lmap.getCenter().lng.should.equal(2.0)
                mapField.lmarker.getLatLng().lat.should.equal(55.0)
                mapField.lmarker.getLatLng().lng.should.equal(2.0)
            })
        })
    })

    describe('behaviours > geocode', () => {
        const behaviours = MapField.behaviours.geocode
        let mapField = null

        beforeEach(() => {
            mapField = new MapField(mapElm)
            mapField.init()
        })

        afterEach(() => {
            mapField.destroy()
        })

        describe('none', () => {
            it('should return null', () => {
                chai.expect(behaviours.none(mapField, 'test')).to.be.null
            })
        })

        describe('geocodeuk', () => {

            beforeEach(() => {
                global.fetch = () => {
                    return Promise.resolve(
                        {
                            'json': () => {
                                return {'matches': [{'point': [55.0, 2.0]}]}
                            }
                        }
                    )
                }
            })

            afterEach(() => {
                delete global.fetch
            })

            it('should return coordinates for a location', (done) => {
                behaviours.geocodeuk(mapField, 'worcester')
                    .then((coords) => {
                        coords.should.deep.equal([55.0, 2.0])
                        done()
                    }).catch((err) => {
                        done(err)
                    })
            })
        })
    })

    describe('behaviours > getForm', () => {
        const behaviours = MapField.behaviours.getForm
        let mapField = null

        beforeEach(() => {
            mapField = new MapField(mapElm)
            mapField.init()
        })

        afterEach(() => {
            mapField.destroy()
        })

        describe('closest', () => {
            it('should return the closest element to the map field matching '
                + 'the selector', () => {

                behaviours.closest(mapField, 'form').should.equal(formElm)
            })
        })

        describe('elm', () => {
            it('should return the element given', () => {

                behaviours.elm(mapField, formElm).should.equal(formElm)
            })
        })

        describe('parent', () => {
            it('should return the closest parent form element', () => {

                behaviours.parent(mapField, '').should.equal(formElm)
            })
        })

        describe('selector', () => {
            it('should return an element matching the selector', () => {

                behaviours.selector(mapField, 'form').should.equal(formElm)
            })
        })
    })

    describe('behaviours > getValue', () => {
        const behaviours = MapField.behaviours.getValue
        let mapField = null

        beforeEach(() => {
            mapField = new MapField(mapElm)
            mapField.init()
        })

        afterEach(() => {
            latElm.value = '50.0'
            lngElm.value = '1.0'
            mapField.destroy()
        })

        describe('inputs', () => {

            it('should return the coordinates if the lat/lng inputs are '
                + 'valid', () => {

                behaviours.inputs(mapField).should.deep.equal([50.0, 1.0])
            })

            it('should return null if the lat/lng inputs are invalid', () => {
                // Not valid numbers
                latElm.value = 'a'
                lngElm.value = 'b'
                chai.expect(behaviours.inputs(mapField)).to.be.null

                // Outside the lat/lng range
                latElm.value = '-270'
                lngElm.value = '-180'
                chai.expect(behaviours.inputs(mapField)).to.be.null
            })
        })
    })

    describe('behaviours > icon', () => {
        const behaviours = MapField.behaviours.icon
        let mapField = null

        beforeEach(() => {
            mapField = new MapField(mapElm)
            mapField.init()
        })

        afterEach(() => {
            mapField.destroy()
        })

        describe('default', () => {
            it('should return a default Leaflet icon', () => {
                const icon = behaviours['default'](mapField, {})
                icon.should.be.an.instanceof(Icon)
            })
        })
    })

    describe('behaviours > setValue', () => {
        const behaviours = MapField.behaviours.setValue
        let mapField = null

        beforeEach(() => {
            mapField = new MapField(mapElm)
            mapField.init()
        })

        afterEach(() => {
            latElm.value = '50.0'
            lngElm.value = '1.0'
            mapField.destroy()
        })

        describe('inputs', () => {
            it('should set the lat/lng inputs values', () => {

                behaviours.inputs(mapField, [55.0, 2.0])
                latElm.value.should.equal('55')
                lngElm.value.should.equal('2')
            })
        })
    })

    describe('behaviours > sync', () => {
        const behaviours = MapField.behaviours.sync
        let mapField = null

        beforeEach(() => {
            mapField = new MapField(mapElm)
            mapField.init()
        })

        afterEach(() => {
            latElm.value = '50.0'
            lngElm.value = '1.0'
            mapField.destroy()
        })

        describe('inputs', () => {
            it('should return a list of lat/lng inputs', () => {
                behaviours.inputs(mapField)
                    .should
                    .deep
                    .equal([latElm, lngElm])
            })
        })
    })

})