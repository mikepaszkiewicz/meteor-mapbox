/* Copyright (c) 2014 Paulo Sérgio Borges de Oliveira Filho
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

var FILES = {
  mapbox: {
    js:   ['https://api.tiles.mapbox.com/mapbox.js/v2.2.3/mapbox.js'],
    css:  ['https://api.tiles.mapbox.com/mapbox.js/v2.2.3/mapbox.css'],
  },

  mapboxgl: {
    js:   ['https://api.tiles.mapbox.com/mapbox-gl-js/v0.31.0/mapbox-gl.js'],
    css:  ['https://api.tiles.mapbox.com/mapbox-gl-js/v0.31.0/mapbox-gl.css'],
  },
  turf: {
    js:   ['https://api.tiles.mapbox.com/mapbox.js/plugins/turf/v2.0.2/turf.min.js'],
    css:  []
  },

  directions: {
    js: ['https://api.tiles.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v3.0.3/mapbox-gl-directions.js'],
    css:  ['https://api.tiles.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v3.0.3/mapbox-gl-directions.css']
  },

  zoomslider: {
    js:   ['https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-zoomslider/v0.7.0/L.Control.Zoomslider.js'],
    css:  ['https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-zoomslider/v0.7.0/L.Control.Zoomslider.css']
  },
};

var deps = new Deps.Dependency;
var loaded = false;

var onLoaded = function () {
  loaded = true;
  Mapbox.hook && Mapbox.hook.call && Mapbox.hook.call(this);
  deps.changed();
};

var onMapboxLoaded = function (plugins, cb) {
  var pluginCount = _.size(plugins);

  if (pluginCount === 0) {
    cb();
    return;
  }

  var loadCb = function () {
    pluginCount--;

    if (pluginCount === 0) {
      cb();
      return;
    }
  };

  _.each(plugins, function (plugin) {
    loadFiles(FILES[plugin], loadCb);
  });
};

var loadScript = function (src, cb) {
  var elem = document.createElement('script');
  elem.type = 'text/javascript';
  elem.src = src;
  elem.defer = true;

  elem.addEventListener('load', _.partial(cb, src), false);

  var head = document.getElementsByTagName('head')[0];
  head.appendChild(elem);
};

var loadCss = function (href) {
  var elem = document.createElement('link');
  elem.rel = 'stylesheet';
  elem.href = href;

  var head = document.getElementsByTagName('head')[0];
  head.appendChild(elem);
};

var loadFiles = function (files, cb) {
  var loadCount = _.size(files.js);

  var loadCb = function (url) {
    if (Mapbox.debug)
      console.log('Loaded:', url);

    loadCount--;

    if (loadCount === 0)
      cb();
  };

  _.each(files.css, loadCss);
  _.each(files.js, function (url) {
    loadScript(url, loadCb);
  });
};

Mapbox = {
  hook: null,
  debug: false,
  load: function (opts) {
    if (loaded)
      return;

    var opts = opts || {};
    var plugins = opts.plugins || [];
    console.log(plugins);
    var initialFiles = opts.gl ? FILES.mapboxgl : FILES.mapbox;


    loadFiles(initialFiles, _.partial(onMapboxLoaded, plugins, onLoaded));
  },
  loaded: function () {
    deps.depend();
    return loaded;
  },
  onLoaded: function(cb) {
    this.hook = cb;
  }
};
