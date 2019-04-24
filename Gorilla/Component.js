import lifecycleEventsMixin from './utils/lifecycleEventsMixin';
import GorillaError from './utils/Error';
import View from './View';
import SUPPORTED_DOM_EVENTS from './utils/supportedDOMEvents';

//새로운 객체 생성: context의 속성들을 복붙해줌
function Component(template, context, children) {
  //template: 변경을 원하는 EJS파일
  //context: 객체
  //children: 하위 template
  const that = this;
  //인스턴스
  that._element = null;
  that._view = new View(template, { context, children });
  //view생성자 다시보기..
  that._publish = lifecycleEventsMixin(that);
  //(event)=>eventHandler실행: 컴포넌트의 생애주기에 따른 이벤트핸들러 실행함수

  for (let prop in context) {
  //context객체에 있는 prop(속성)들을 반복문에 돌림
    if (context.hasOwnProperty(prop)) {
    //hasOwnProperty: undefined나null값을 지녀도 true,
    //enumerable한 속성만 true값 반환(프로토타입체인 속성 false로인지)
    //for ...in 연산자는 enumerable하지 않은것까지 모두 실행 >>> 질문..
      Object.defineProperties(that, {
        [prop]: {
          get: function () {
            return context[prop];
          },
          set: function (val) {
            that._view.context[prop] = val;
            that.render();
          },
          enumerable: true
        }
      });
      // getter, setter 세팅
      // >> instance.prop;//context.prop값 반환
      // >> instance.[context.prop] = "어떤값" //instance.[context.prop];//"어떤값"
    }
  }
}
//dom event를 초기화 하는애: 고릴라객체 + 하위객체 의 이벤트에따른 이벤트 핸들러 걸어줌.
Component.prototype._initializeDOMEvents = function () {
  const elementEventsMap = [];
  const reg = new RegExp('^gorilla-');

  function findElementsWithGorillaAttr (element) {
    const attrs = element.attributes;
    //element의 속성들만 추려내기
    for (let i = 0; i < attrs.length; i++) {
      if (reg.test(attrs[i].nodeName)) {
        const eventType = attrs[i].nodeName.split('-')[1];
        //고릴라객체 이름중 event type 추출
        if (SUPPORTED_DOM_EVENTS.indexOf(eventType) === -1) {
          throw new GorillaError(`Unsupported event type: ${eventType}`);
        }
        //지원되는 이벤트인지 확인
        elementEventsMap.push({
          element,
          eventType,
          eventHandler: attrs[i].nodeValue
        });
        //이벤트맵배열에 {ele, eventType, eventHandler}객체 추기
        break;
      }
    }

    if (element.children.length > 0) {
      for (let j = 0; j < element.children.length; j++) {
        if (!element.children[j].dataset.gorillaComponent) {
          findElementsWithGorillaAttr(element.children[j]);
        }
      }
    }//자식 노드가 있으면 그 노드도 재귀로 실행
  }
  findElementsWithGorillaAttr(this._element);//고릴라 속성/이벤트 핸들러만 추출함

  elementEventsMap.forEach(eventRegistrationData => {
    const eventType = eventRegistrationData.eventType;
    const targetElement = eventRegistrationData.element;
    const eventHandler = this[eventRegistrationData.eventHandler];

    if (typeof eventHandler !== 'function') {
      throw new GorillaError(`Cannot find method "${eventRegistrationData.eventHandler}" from the instance`);
    }
    //각각의 고릴라 이벤트에 필요한 이벤트 핸들러를 걸어줌
    targetElement.addEventListener(eventType, eventHandler);
  });
};//

Component.prototype.render = function () {
  this._publish("BEFORE_RENDER");
  this._element = this._view.render();//하위 템플릿들을 렌더해서 this._element에 할당
  this._initializeDOMEvents();

  setTimeout(() => {
    this._publish("AFTER_RENDER");
  }, 0);

  return this._element;
};

Component.prototype.destroy = function () {
  this._publish("BEFORE_DESTROY");
  this._view.destroy();

  setTimeout(() => {
    this._publish("AFTER_DESTROY");
  }, 0);

  this._element = null;

  // TODO: remove event listeners from the element
};

export default Component;
