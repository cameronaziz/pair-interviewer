import { Selection } from 'd3';
import { TooltipItem } from '../../components/tooltip';

export type UseMapOptions = {
  countries?: GraphQL.Country[];
  zoomCountry?: GraphQL.Country;
  center?: [number, number];
  onMouseEnter?(feature: GraphQL.City | GraphQL.Country, event: MouseEvent): void;
  onMouseLeave?(feature: GraphQL.City | GraphQL.Country, event: MouseEvent): void;
  onClick?(feature: GraphQL.City | GraphQL.Country): void;
}

export type UseMapReturns = [
  (options?: UseMapOptions) => void
]

export type PlotTooltipOptions =  {
  item: TooltipItem;
  container: DOMSelection;
  event: MouseEvent;
  temperatureScale: App.ScaleType;
  noCondition?: boolean
}

export type D3DrawOptions = DrawOptions & {
  tooltip: DOMSelection;
  svgSize: [number, number];
  projection: d3.GeoProjection;
  geoPath: d3.GeoPath;
  svg: SVGSelection;
}

export type DrawOptions = UseMapOptions & {
  viewType: App.ViewType;
  temperatureScale: App.ScaleType;
  frame: DOMRect
  countries: GraphQL.Country[];
}

export type SVGSelection = Selection<SVGElement, TooltipItem, HTMLElement, any>
export type DOMSelection = Selection<d3.BaseType, TooltipItem, any, any>
export type UseMap = (options?: Partial<UseMapOptions>) => UseMapReturns;
