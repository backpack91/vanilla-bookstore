import GorillaError from './utils/Error';
import Component from './Component';
// target에 component에 최종적으로 꽂아주는 역할
export default function renderToDOM (component, target) {
  if (!(component instanceof Component)) {
    throw new GorillaError('First argument must be an instance of `Gorilla.Component`');
  }

  if (!(target instanceof Element)) {
    throw new GorillaError('Second argument must be an instance of `Element`');
  }

  target.appendChild(component.render());
};
