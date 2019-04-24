import domify from 'domify';
import GorillaError from './utils/Error';
import Component from './Component';

var count = 1;

export default function View (template, options = {}) {
  //template >> template화 시키는 함수
  //options >> context(api정보), children(하위템플릿)이 할당된다
  const that = this;//새로운 객체
  let element = null;
  const childRenderables = {};
  //렌더링 할 child들을 넣을 객체?
  Object.defineProperties(that, {
    // `element` can be modified if `render()` is called again, so this is an accessor, not a data descriptor.
    element: { get: function () { return element; }, enumerable: true }
  });
  //that에 element 속성을 넣어준다.

  that.context = options.context || {};
  that.children = options.children || {};
  //children : 현재 tamplate의 하위 템플릿 >> undefined>> {}, {grandbaby}, {baby}가 된다.
  //새로운 인스턴스 객체에 option에 있는 속성(context &  children)을 복사해서 넣어준다.

  //
  that.render = function () {
    const placeholders = {};
    for (let childName in that.children) {
      //children객체에 tamplate이름을 key로 가지는 컴포넌트 열람.. (Component의 instance인..)
      if (that.children.hasOwnProperty(childName)) {
        if (!(that.children[childName] instanceof Component)) {
          throw new GorillaError(`Child "${childName}" must be a gorilla component instance`);
        }
        // childRenderables에 tamplate이름 별로 render()의 리턴값 element를 할당
        childRenderables[childName] = that.children[childName].render();
        placeholders[childName] = `<div data-gorilla-target="${childName}"></div>`;
      }
    }

    const templateData = Object.assign({}, that.context, placeholders);
    //Object.assign(target, 복사할객체1, 복사할객체2, ...) 같은 이름의 속성은 1,2 순서로 계속 덮어씀
    const oldElement = element;

    //template에 들어갈 속성들을 한데모아 할당해줌.
    element = domify(template(templateData));
    // templateData를 모두 적용한 string type의 html코드를 dom으로 만들어줌
    if (element instanceof DocumentFragment) {
      //domify된 dom들은 DocumentFragment의 instance임
      throw new GorillaError('Gorilla component must be wrapped in a single element');
      //이게 무슨말인지 모르겠음..
    }

    for (let childName in placeholders) {
      if (placeholders.hasOwnProperty(childName)) {
        const target = element.querySelector(`div[data-gorilla-target="${childName}"]`);
        childRenderables[childName].dataset.gorillaComponent = childName;
        //각각의 하위 템플릿에 dataset.gorillaComponent속성을 만들어줌>> 나중에 렌더링 된건지 확인하기 위함?
        target.parentNode.replaceChild(childRenderables[childName], target);
        //새로 만든 하위 템플릿을 기존의 것과 바꾸어줌
      }
    }

    if (oldElement && oldElement.parentNode) {
      oldElement.parentNode.replaceChild(element, oldElement);
    }
    return element;
  };

  that.destroy = function () {
    if (!element || !element.parentNode) {
      throw new GorillaError("View elements must be in the DOM to be destroyed.");
    }

    element.parentNode.removeChild(element);

    element = null;
  };
}
