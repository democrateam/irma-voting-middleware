//import _ from 'lodash';
import { Tooltip, Toast, Popover, Carousel } from 'bootstrap';

function component() {
  const element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  //element.innerHTML = _.join(['Hello', 'webpack'], ' ');
	//element.innerHTML = "generated";

  return element;
}

document.body.appendChild(component());
