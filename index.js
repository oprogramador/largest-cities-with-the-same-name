const allTheCities = require('all-the-cities');
const _ = require('lodash');
const jsonToMarkdown = require('json-to-markdown');
const countriesByISO = require('i18n-iso-countries');

const englishNames = countriesByISO.getNames('en');
const getCoordinates = city => _.pick(city, 'lat', 'lon');
const areSame = (a, b) => JSON.stringify(getCoordinates(a)) === JSON.stringify(getCoordinates(b));

const groups = _.filter(
  _.groupBy(allTheCities, city => city.name),
  group => group.length > 1,
);
const groupsWithFoundLargestCity = groups.map(cities => ({ cities, largest: _.maxBy(cities, city => city.population) }));
const pairs = _.flatten(
  groupsWithFoundLargestCity.map(
    group => group
      .cities
      .filter(city => !areSame(city, group.largest))
      .map(city => ({ city, largest: group.largest })),
  ),
);
const filteredPairs = pairs.filter(pair => pair.city.population > 10000);
const sortedPairs = _.sortBy(filteredPairs, pair => -pair.city.population);

const prettyResult = sortedPairs.map(pair => ({
  'cities name': pair.city.name,
  '...1': '...',
  'largest city population': pair.largest.population.toLocaleString(),
  'largest city country': englishNames[pair.largest.country],
  'largest city latitude': pair.largest.lat,
  'largest city longitude': pair.largest.lon,
  '...2': '...',
  'smaller city population': pair.city.population.toLocaleString(),
  'smaller city country': englishNames[pair.city.country],
  'smaller city latitude': pair.city.lat,
  'smaller city longitude': pair.city.lon,
}));

console.log(jsonToMarkdown(prettyResult, Object.keys(prettyResult[0])));
