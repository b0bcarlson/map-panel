// import _ from 'lodash';
// import decodeGeoHash from './geohash';

const allowedPollutants = ['h', 'no2', 'p', 'pm10', 'pm25', 't'];

export default class DataFormatter {
  constructor(ctrl, kbn) {
    this.ctrl = ctrl;
    this.kbn = kbn;
  }

  setValues(data) {
    const setSeries = {};
    let serieType;
    let pollutantsAux;

    if (this.ctrl.series && this.ctrl.series.length > 0) {
      this.ctrl.series.forEach((serie) => {
        // console.log(serie);
        serieType = serie.id.split(':')[0];
        const serieName = serie.alias.split(': ')[1];

        // VERIFY HERE ALL TYPES RECEIVED
        if (!(setSeries[serieName])) {
          setSeries[serieName] = [];
        }

        serie.datapoints.forEach((datapoint) => {
          const datapointValue = parseFloat(datapoint[0]);
          const valueAndType = {'value': datapointValue, 'type': serieType};
          setSeries[serieName].push(valueAndType);
        });
      });

      const latitudes = setSeries.latitude;
      const longitudes = setSeries.longitude;
      const values = setSeries.value;
      const ids = setSeries.id;

      setSeries.pollutants = [];
      pollutantsAux = [];

      allowedPollutants.forEach((pollutant) => {
        if (setSeries[pollutant]) {
          const receivedPoll = [];
          setSeries[pollutant].forEach((poll) => {
            receivedPoll.push(poll);
          });

          pollutantsAux.push({'name': pollutant, 'value': receivedPoll});
          delete setSeries[pollutant];
        }
      });

      latitudes.forEach((value, index) => {
        let dataValue;

        if (value.type === 'environment') {
          const thisPollutants = [];
          pollutantsAux.forEach((pollAux) => {
            thisPollutants.push({'name': pollAux.name, 'value': pollAux.value[index].value});
          });
          dataValue = {
            locationLatitude: value.value,
            locationLongitude: longitudes[index].value,
            value: values[index].value,
            type: values[index].type,
            pollutants: thisPollutants,
            id: ids[value].id
          };
        } else if (value.type === 'traffic') {
          dataValue = {
            locationLatitude: value.value,
            locationLongitude: longitudes[index].value,
            value: values[index].value,
            type: values[index].type,
            id: ids[value].id
          };
        }
        data.push(dataValue);
      });
    }
  }
}
