'use strict';

System.register(['lodash', './leaflet', './css/leaflet.css!', './worldmap'], function (_export, _context) {
  var _, L, WorldMap;

  function link(scope, elem, attrs, ctrl) {
    var mapContainer = elem.find('.mapcontainer');

    ctrl.events.on('render', function () {
      render();
      ctrl.renderingCompleted();
    });

    function render() {
      if (!ctrl.data) return;

      if (!ctrl.map) {
        ctrl.map = new WorldMap(ctrl, mapContainer[0]);
        ctrl.circles = [];
      }

      ctrl.map.resize();

      if (ctrl.mapCenterMoved) ctrl.map.panToMapCenter();

      if (!ctrl.legend && ctrl.panel.showLegend) createLegend();

      drawCircles();
    }

    function createLegend() {
      ctrl.legend = window.L.control({ position: 'bottomleft' });
      ctrl.legend.onAdd = function () {
        ctrl.legend._div = window.L.DomUtil.create('div', 'info legend');
        ctrl.legend.update();
        return ctrl.legend._div;
      };

      ctrl.legend.update = function () {
        var thresholds = ctrl.data.thresholds;
        var legendHtml = '';
        legendHtml += '<i style="background:' + ctrl.panel.colors[0] + '"></i> ' + '&lt; ' + thresholds[0] + '<br>';
        for (var index = 0; index < thresholds.length; index++) {
          legendHtml += '<i style="background:' + getColor(thresholds[index] + 1) + '"></i> ' + thresholds[index] + (thresholds[index + 1] ? '&ndash;' + thresholds[index + 1] + '<br>' : '+');
        }
        ctrl.legend._div.innerHTML = legendHtml;
      };

      ctrl.map.addLegend(ctrl.legend);
    }

    function getColor(value) {
      for (var index = ctrl.data.thresholds.length; index > 0; index--) {
        if (value >= ctrl.data.thresholds[index - 1]) {
          return ctrl.panel.colors[index];
        }
      }
      return _.first(ctrl.panel.colors);
    }

    function needToRedrawCircles() {
      if (ctrl.circles.length === 0 && ctrl.data.length > 0) return true;
      if (ctrl.circles.length !== ctrl.data.length) return true;
      var locations = _.map(_.map(ctrl.circles, 'options'), 'location').sort();
      var dataPoints = _.map(ctrl.data, 'key').sort();
      return !_.isEqual(locations, dataPoints);
    }

    function clearCircles() {
      if (ctrl.circlesLayer) {
        ctrl.circlesLayer.clearLayers();
        ctrl.map.removeCircles(ctrl.circlesLayer);
        ctrl.circles = [];
      }
    }

    function drawCircles() {
      if (needToRedrawCircles()) {
        clearCircles();
        createCircles();
      } else {
        updateCircles();
      }
    }

    function createCircles() {
      var circles = [];
      ctrl.data.forEach(function (dataPoint) {
        if (!dataPoint.locationName) return;
        circles.push(createCircle(dataPoint));
      });
      ctrl.circlesLayer = ctrl.map.addCircles(circles);
      ctrl.circles = circles;
    }

    function updateCircles() {
      ctrl.data.forEach(function (dataPoint) {
        if (!dataPoint.locationName) return;

        var circle = _.find(ctrl.circles, function (cir) {
          return cir.options.location === dataPoint.key;
        });

        if (circle) {
          circle.setRadius(calcCircleSize(dataPoint.value || 0));
          circle.setStyle({
            color: getColor(dataPoint.value),
            fillColor: getColor(dataPoint.value),
            fillOpacity: 0.5,
            location: dataPoint.key
          });
          circle.unbindPopup();
          createPopup(circle, dataPoint.locationName, dataPoint.valueRounded);
        }
      });
    }

    function createCircle(dataPoint) {
      var circle = window.L.circleMarker([dataPoint.locationLatitude, dataPoint.locationLongitude], {
        radius: calcCircleSize(dataPoint.value || 0),
        color: getColor(dataPoint.value),
        fillColor: getColor(dataPoint.value),
        fillOpacity: 0.5,
        location: dataPoint.key
      });

      createPopup(circle, dataPoint.locationName, dataPoint.valueRounded);
      return circle;
    }

    function calcCircleSize(dataPointValue) {
      if (ctrl.data.valueRange === 0) {
        return ctrl.panel.circleMinSize;
      }

      var dataFactor = (dataPointValue - ctrl.data.lowestValue) / ctrl.data.valueRange;
      var circleSizeRange = ctrl.panel.circleMaxSize - ctrl.panel.circleMinSize;

      return circleSizeRange * dataFactor + ctrl.panel.circleMinSize;
    }

    function createPopup(circle, locationName, value) {
      var unit = value && value === 1 ? ctrl.panel.unitSingular : ctrl.panel.unitPlural;
      circle.bindPopup(locationName + ': ' + value + ' ' + unit, { 'offset': window.L.point(0, -2), 'className': 'worldmap-popup' });

      circle.on('mouseover', function (evt) {
        var layer = evt.target;
        layer.bringToFront();
        this.openPopup();
      });
      circle.on('mouseout', function () {
        circle.closePopup();
      });
    }
  }

  _export('default', link);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_leaflet) {
      L = _leaflet.default;
    }, function (_cssLeafletCss) {}, function (_worldmap) {
      WorldMap = _worldmap.default;
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=map_renderer.js.map