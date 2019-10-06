const usEducationData =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

const usCountryData =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

let h = 600;
let w = 1100;

let title = d3
  .select('body')
  .append('h1')
  .attr('id', 'title')
  .text('United States Educational Attainment');

let description = d3
  .select('body')
  .append('p')
  .attr('id', 'description')
  .text(
    "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)",
  );

let svg = d3
  .select('body')
  .append('svg')
  .attr('height', h)
  .attr('width', w);

let tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .style('background-color', 'black')
  .style('opacity', '0');

Promise.all([d3.json(usCountryData), d3.json(usEducationData)]).then(function(
  response,
) {
  let responses = response.map(response => response);
  let counties = response[0];
  let education = response[1];

  let bachelorsOrHigher = [];

  education.forEach(function(obj) {
    bachelorsOrHigher.push(obj.bachelorsOrHigher);
  });

  let min = d3.min(bachelorsOrHigher);
  let max = d3.max(bachelorsOrHigher);

  let colorScale = d3
    .scaleLinear()
    .domain([min, max])
    .range(['orange', 'purple']);

  let geojson = topojson.feature(counties, counties.objects.counties);

  let mouseover = function() {
    tooltip.style('opacity', '0.8');
  };

  let mousemove = function(d) {
    let info = education.filter(function(county) {
      return county.fips === d.id;
    });
    let {state, bachelorsOrHigher} = info[0];
    let area = info[0]['area_name'];
    tooltip.html(`${area}, ${state}. <br/> ${bachelorsOrHigher}%`);
    tooltip.attr('data-education', bachelorsOrHigher);
  };

  let mouseleave = function() {
    tooltip.style('opacity', '0');
  };

  let paths = svg
    .selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', d3.geoPath())
    .attr('data-fips', d => d.id)
    .attr('data-education', function(d) {
      let edu = education.filter(function(obj) {
        return obj.fips === d.id;
      });
      return edu[0].bachelorsOrHigher;
    })
    .style('fill', function(d) {
      let bachelors = education.filter(function(edu) {
        return edu.fips === d.id;
      });
      return colorScale(bachelors[0].bachelorsOrHigher);
    })
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseleave', mouseleave);

  let legend = d3
    .legendColor()
    .scale(colorScale)
    .title('Percentage');

  svg
    .append('g')
    .attr('transform', `translate(${w - 140},${20})`)
    .attr('id', 'legend')
    .call(legend);

  //dont delete
});
