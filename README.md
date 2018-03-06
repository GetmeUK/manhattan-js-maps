<div align="center">
    <img width="196" height="96" vspace="20" src="http://assets.getme.co.uk/manhattan-logo--variation-b.svg">
    <h1>Manhattan Maps</h1>
    <p>Display maps and map fields using Leaflet.</p>
    <a href="https://badge.fury.io/js/manhattan-maps"><img src="https://badge.fury.io/js/manhattan-maps.svg" alt="npm version" height="18"></a>
    <a href="https://travis-ci.org/GetmeUK/manhattan-js-maps"><img src="https://travis-ci.org/GetmeUK/manhattan-js-maps.svg?branch=master" alt="Build Status" height="18"></a>
    <a href='https://coveralls.io/github/GetmeUK/manhattan-js-maps?branch=master'><img src='https://coveralls.io/repos/github/GetmeUK/manhattan-js-maps/badge.svg?branch=master' alt='Coverage Status' height="18"/></a>
    <a href="https://david-dm.org/GetmeUK/manhattan-js-maps/"><img src='https://david-dm.org/GetmeUK/manhattan-js-maps/status.svg' alt='dependencies status' height="18"/></a>
</div>

## Installation

`npm install manhattan-maps --save-dev`


## Usage

```html
<div
    data-mh-map-view
    data-mh-map-view--dragging
    data-mh-map-view--scroll-wheel-zoom
    data-mh-map-view--home="fit-markers"
    data-mh-map-view--group-padding="100,100"
    data-mh-map-view--popup="content"
    class="map-view"
    ></div>
<datalist>
    <option
        data-mh-map-marker
        data-mh-map-marker--coords="52.056398,-2.715974"
        value="Hereford"
        >
        Hereford
    </option>
    <option
        data-mh-map-marker
        data-mh-map-marker--coords="52.193636,-2.221575"
        value="Worcester"
        >
        Worcester
    </option>
</datalist>
```

```JavaScript
import * as $ from 'manhattan-essentials'
import {mapView} from 'manhattan-maps'

const m = new mapView.MapView($.one('[data-mh-map-view]'))
m.init()
```
