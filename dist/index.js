(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ManhattanMaps"] = factory();
	else
		root["ManhattanMaps"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var $, Map;

$ = __webpack_require__(1);

Map = (function() {
  Map.clsPrefix = 'data-mh-map--';

  function Map(elm, options) {
    var behaviours, fetchMarkers, i, icon, len, makeMarker, makePopup, marker, popup, rawMarker, ref;
    if (options == null) {
      options = {};
    }
    $.config(this, {
      dragging: false,
      attribution: 'Map data © ' + '<a href="http://openstreetmap.org">OpenStreetMap</a>',
      coords: [52.185766, -2.089655],
      groupPadding: [40, 40],
      markers: '[data-mh-marker]',
      minZoom: 8,
      maxZoom: 18,
      scrollWheelZoom: false,
      url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      zoom: 13
    }, options, elm, this.constructor.clsPrefix);
    if (typeof this.coords === 'string') {
      this.coords = this.coords.split(',');
      this.coords[0] = parseFloat(this.coords[0]);
      this.coords[1] = parseFloat(this.coords[1]);
    }
    this._behaviours = {};
    $.config(this._behaviours, {
      fetchMarkers: 'selector',
      home: 'coords',
      icon: 'default',
      marker: 'default',
      popup: 'none'
    }, options, elm, this.constructor.clsPrefix);
    this._dom = {};
    this._dom.elm = elm;
    this._dom.elm.__mh_map = this;
    this._lmap = new L.Map(elm, {
      dragging: this.dragging,
      scrollWheelZoom: this.scrollWheelZoom
    });
    this._lmap.addLayer(new L.TileLayer(this.url, {
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      attribution: this.attribution
    }));
    Object.defineProperty(this, 'elm', {
      value: this._dom.elm
    });
    Object.defineProperty(this, 'lmap', {
      value: this._lmap
    });
    Object.defineProperty(this, 'lmap', {
      value: this._lmap
    });
    Object.defineProperty(this, 'lmarkers', {
      get: (function(_this) {
        return function() {
          return _this._lmarkers.slice();
        };
      })(this)
    });
    this._lmarkers = [];
    behaviours = this.constructor.behaviours;
    fetchMarkers = behaviours.fetchMarkers[this._behaviours.fetchMarkers];
    icon = behaviours.icon[this._behaviours.icon];
    makeMarker = behaviours.marker[this._behaviours.marker];
    makePopup = behaviours.popup[this._behaviours.popup];
    ref = fetchMarkers(this);
    for (i = 0, len = ref.length; i < len; i++) {
      rawMarker = ref[i];
      marker = makeMarker(this, rawMarker[0], icon(rawMarker[1]));
      marker.addTo(this.lmap);
      popup = makePopup(this, rawMarker[1]);
      if (popup) {
        marker.bindPopup(popup);
      }
      this._lmarkers.push(marker);
    }
    behaviours.home[this._behaviours.home](this);
  }

  Map.prototype._bem = function(block, element, modifier) {
    var name;
    if (element == null) {
      element = '';
    }
    if (modifier == null) {
      modifier = '';
    }
    name = block;
    if (element) {
      name = name + "__" + element;
    }
    if (modifier) {
      name = name + "--" + modifier;
    }
    return name;
  };

  Map.prototype._et = function(eventName) {
    return "mh-typeahead--" + eventName;
  };

  Map.behaviours = {
    fetchMarkers: {
      'selector': function(map) {
        var coords, domMarker, domMarkers, i, len, markers;
        markers = [];
        domMarkers = $.many(map.markers);
        for (i = 0, len = domMarkers.length; i < len; i++) {
          domMarker = domMarkers[i];
          coords = domMarker.getAttribute('data-mh-marker--coords');
          coords = coords.split(',');
          coords[0] = parseFloat(coords[0]);
          coords[1] = parseFloat(coords[1]);
          markers.push([coords, domMarker]);
        }
        return markers;
      }
    },
    home: {
      'coords': function(map) {
        return map.lmap.setView(new L.LatLng(map.coords[0], map.coords[1]), map.zoom);
      },
      'first-marker': function(map) {
        if (map.lmarkers.length > 0) {
          return map.lmap.setView(map.lmarkers[0].getLatLng(), map.zoom);
        } else {
          return map.constructor.behaviours.home.coords(map);
        }
      },
      'fit-markers': function(map) {
        var group;
        if (map.lmarkers.length > 0) {
          group = new L.featureGroup(map.lmarkers);
          return map.lmap.fitBounds(group.getBounds(), {
            padding: map.groupPadding
          });
        } else {
          return map.constructor.behaviours.home.coords(map);
        }
      }
    },
    icon: {
      'default': function(map, obj) {
        return new L.Icon.Default();
      }
    },
    marker: {
      'default': function(map, coords, icon) {
        return new L.marker(coords, {
          icon: icon
        });
      }
    },
    popup: {
      'none': function(map, obj) {},
      'content': function(map, obj) {
        return obj.firstElementChild.innerHTML;
      }
    }
  };

  return Map;

})();

module.exports = {
  Map: Map
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.ManhattanEssentials=t():e.ManhattanEssentials=t()}(this,function(){return function(e){function __webpack_require__(r){if(t[r])return t[r].exports;var n=t[r]={exports:{},id:r,loaded:!1};return e[r].call(n.exports,n,n.exports,__webpack_require__),n.loaded=!0,n.exports}var t={};return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.p="",__webpack_require__(0)}([function(e,t,r){e.exports=r(1)},function(e,t){var r,n,o,u,c,i,a,s,l,p,f=[].indexOf||function(e){for(var t=0,r=this.length;t<r;t++)if(t in this&&this[t]===e)return t;return-1};r=function(e,t){var r;if(e.closest)return e.closest(t);for(r=e.matches||e.webkitMatchesSelector||e.mozMatchesSelector||e.msMatchesSelector;e&&!r.call(e,t);)e=e.parentElement;return e},o=function(e,t){var r,n,o;null==t&&(t={}),r=document.createElement(e);for(n in t)o=t[n],f.call(r,n)>=0?r[n]=o:r.setAttribute(n,o);return r},l=function(e,t){return null==t&&(t=document),Array.prototype.slice.call(t.querySelectorAll(e))},p=function(e,t){return null==t&&(t=document),t.querySelector(e)},c=function(e,t,r){var n,o,u;null==r&&(r={}),n=document.createEvent("Event"),n.initEvent(t,!0,!0);for(o in r)u=r[o],n[o]=u;return e.dispatchEvent(n)},a=function(e,t){var r,n,o,u;u=[];for(n in t)o=t[n],u.push(function(){var t,u,c,i;for(c=n.split(/\s+/),i=[],t=0,u=c.length;t<u;t++)r=c[t],i.push(e.removeEventListener(r,o));return i}());return u},s=function(e,t){var r,n,o,u;u=[];for(n in t)o=t[n],u.push(function(){var t,u,c,i;for(c=n.split(/\s+/),i=[],t=0,u=c.length;t<u;t++)r=c[t],i.push(e.addEventListener(r,o));return i}());return u},n=function(e,t,r,n,o){var u,c,i,a;null==o&&(o="data-"),i=[];for(c in t)a=t[c],e[c]=a,r.hasOwnProperty(c)&&(e[c]=r[c]),n&&(u=o+c.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase(),n.hasAttribute(u)?"number"==typeof a?i.push(e[c]=parseInt(n.getAttribute(u))):a===!1?i.push(e[c]=!0):i.push(e[c]=n.getAttribute(u)):i.push(void 0));return i},i=function(e){return e.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g,"\\$&")},u=function(e){var t;try{document.querySelector(e)}catch(e){return t=e,!1}return!0},e.exports={closest:r,create:o,one:p,many:l,dispatch:c,ignore:a,listen:s,config:n,escapeRegExp:i,cssSelectorSupported:u}}])});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var field, map;

field = __webpack_require__(4);

map = __webpack_require__(0);

module.exports = {
  Map: map.Map,
  MapField: field.MapField
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "maps.css";

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var $, MapField, map,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = __webpack_require__(1);

map = __webpack_require__(0);

MapField = (function(superClass) {
  extend(MapField, superClass);

  function MapField() {
    return MapField.__super__.constructor.apply(this, arguments);
  }

  return MapField;

})(map.Map);

module.exports = {
  MapField: MapField
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
module.exports = __webpack_require__(2);


/***/ })
/******/ ]);
});