import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import * as $ from 'manhattan-essentials'
import {MapView} from '../module/map-view.js'

chai.should()
chai.use(require('sinon-chai'))


describe('Sortable', () => {

    let mapElm = null

    beforeEach(() => {
        mapElm = $.create('div', {'data-mh-map-view': true})
        document.body.appendChild(mapElm)
    })

    afterEach(() => {
        document.body.removeChild(mapElm)
    })

    describe('constructor', () => {
        it('should generate a new `MapView` instance', () => {
            const mapView = new MapView(mapElm)
            mapView.should.be.an.instanceof(MapView)
        })
    })

})
