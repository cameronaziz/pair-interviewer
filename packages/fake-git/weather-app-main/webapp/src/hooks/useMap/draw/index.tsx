import * as d3 from 'd3';
import { TooltipItem } from '../../../components/tooltip';
import type * as Types from '../types';
import { makeFeature, makeFeatureCollection, parseGeometry, rainDomain, temperatureDomain } from '../utils';
import drawTooltip, { calculateOffset } from './tooltip';

const drawMap = (options: Types.D3DrawOptions): Types.SVGSelection => {
  const {
    countries,
    viewType,
    onClick,
    tooltip,
    svgSize,
    geoPath,
    zoomCountry,
  } = options;

  const colorScale = d3.scaleThreshold(d3.schemeBlues[5])
    .domain(viewType === 'temperature' ? temperatureDomain : rainDomain);

  const mapData = countries.map((country) => ({
    type: country.geometry.__typename,
    coordinates: parseGeometry(country.geometry),
    ...country,
  })) as App.GeoObject<GraphQL.Country>[];

  d3
    .select('#svg-map')
    .selectAll('*')
    .remove();

  const svg = d3
    .select<SVGElement, TooltipItem>('#svg-map')
    .attr('width', svgSize[0])
    .attr('height', svgSize[1]);

  svg.append('g')
    .selectAll('path')
    .data(mapData)
    .enter()
    .append('path')
    .attr('d', geoPath)
    .attr('stroke', '#ddd')
    .attr('cursor', () => zoomCountry ? 'default' : 'pointer')
    .attr('fill', (d) => {
      if (d.code === zoomCountry?.code) {
        return '#1b7ced';
      }
      if (d.average && !zoomCountry) {
        return colorScale(viewType === 'temperature' ? d.average.day : d.average.rain);
      }
      return '#888';
    })
    .on('click', (e, d) => {
      tooltip.selectChildren('*').remove();
      if (onClick) {
        onClick(d);
      }
    })
    .on('mouseover', (e, d) => {
      drawTooltip({
        ...options,
        container: tooltip,
        noCondition: !!zoomCountry,
        item: d,
        event: e,
      });
    })
    .on('mousemove', (event) => {
      const { left, top } = calculateOffset(event)
      tooltip
        .select('#mounted-tooltip')
        .style('left', `${left}px`)
        .style('top', `${top}px`);

    })
    .on('mouseout', () => {
      tooltip.selectChildren('*').remove();
    });


  return svg;
};

const createProjection = (options: Types.DrawOptions, svgSize: [number, number]): d3.GeoProjection => {
  const {
    countries,
    zoomCountry,
  } = options;
  const projection = d3.geoMercator();
  if (zoomCountry) {
    projection
      .fitSize(svgSize, makeFeature(zoomCountry))
  } else {
    projection
      .fitSize(svgSize, makeFeatureCollection(countries));
  }

  return projection
};

const isCountryFull = (country: GraphQL.Country): country is GraphQL.CountryFull =>
  typeof (country as GraphQL.CountryFull).cities !== 'undefined';

const plotCities = (options: Types.D3DrawOptions) => {
  const {
    geoPath,
    svg,
    zoomCountry,
    tooltip,
    onClick,
    projection
  } = options;

  if (!zoomCountry || !isCountryFull(zoomCountry)) {
    return;
  }

  const scale = projection.scale()
  const size = 10 / Math.log10(scale / 50) / 25;

  zoomCountry.cities.forEach((city) => {
    const circleGenerator = d3.geoCircle()
      .center([city.coordinates.longitude, city.coordinates.latitude])
    const circle = geoPath(circleGenerator.radius(size)());
    const clickCircle = geoPath(circleGenerator.radius(size * 4)());

    svg
      .append('path')
      .attr('fill', "#fff")
      .attr('d', circle)
      .attr('stroke', '#77439c')
      .attr('stroke-width', 2)

    svg
      .append('path')
      .attr('d', clickCircle)
      .attr('opacity', 0)
      .attr('cursor', 'pointer')
      .on('mouseover', (e, d) => {
        drawTooltip({
          ...options,
          container: tooltip,
          item: city,
          event: e,
        });
      })
      .on('mousemove', (event) => {
        const { left, top } = calculateOffset(event)
        tooltip
          .select('#mounted-tooltip')
          .style('left', `${left}px`)
          .style('top', `${top}px`);
      })
      .on('mouseout', () => {
        tooltip.selectChildren('*').remove();
      })
      .on('click', (e, d) => {
        tooltip.selectChildren('*').remove();
        if (onClick) {
          onClick(city);
        }
      })

  });
};

const createTooltipContainer = (svg: Types.SVGSelection): Types.DOMSelection => {
  const parent = d3.select('#root')
  const hasChild = parent.select('#tooltip').size() > 0;
  if (!hasChild) {
    parent
      .append('section')
      .attr('id', 'tooltip')
  }

  return d3.select('#tooltip');
};

const initialSetup = (options: Types.DrawOptions): Types.D3DrawOptions => {
  const { width, height } = options.frame;

  const svg: Types.SVGSelection = d3.select('#svg-map')

  svg
    .selectAll('*')
    .remove();


  const svgSize: [number, number] = [width * 0.8, height * 0.8];
  const projection = createProjection(options, svgSize);
  const geoPath = d3.geoPath().projection(projection);
  const tooltip = createTooltipContainer(svg);

  return {
    ...options,
    geoPath,
    svgSize,
    svg,
    projection,
    tooltip,
  };
};


const draw = (drawOptions: Types.DrawOptions) => {

  if (drawOptions.countries.length === 0) {
    return;
  }

  const options = initialSetup(drawOptions);
  drawMap(options);
  plotCities(options);
};

export default draw;

