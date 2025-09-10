import ReactDOM from 'react-dom/server';
import Tooltip from '../../../components/tooltip';
import type * as Types from '../types';

export const calculateOffset = (event: MouseEvent, offset?: number) => {
  const move = offset || 90;
  const yCenter = window.innerHeight / 2;
  const top = event.clientY > yCenter ? event.clientY - move : event.clientY + (move / 2);
  const xDifference = (event.offsetX - event.clientX) / 2;
  const left = event.clientX + xDifference;

  return {
    top,
    left: left,
  };
};

const drawTooltip = (options: Types.PlotTooltipOptions) => {
  const { container, item, event, temperatureScale, noCondition } = options;
  if (noCondition) {
    return;
  }

  const { left, top } = calculateOffset(event);
  const html = ReactDOM.renderToString(<Tooltip item={item} temperatureScale={temperatureScale} />);
  container
    .append('div')
    .attr('id', 'mounted-tooltip')
    .html(html)
    .style('position', 'absolute')
    .style('left', `${left}px`)
    .style('top', `${top}px`)
};


export default drawTooltip;
