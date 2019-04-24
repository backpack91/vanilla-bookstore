const COMPONENT_LIFECYCLE_EVENTS = [
  'BEFORE_RENDER',
  'AFTER_RENDER',
  'BEFORE_DESTROY',
  'AFTER_DESTROY'
];

// target에 COMPONENT_LIFECYCLE_EVENTS에따른 이벤트 핸들러 등록을 하고
// 그것들을 실행시킬 수 있는 함수를 리턴
export default function eventEmitterMixin(target) {
  const eventMap = {};

  COMPONENT_LIFECYCLE_EVENTS.forEach(event => {
    eventMap[event] = [];
  });
  //이벤트 맵 객체에 각각의 이벤트타입(키) : 배열(밸류) 속성을 할당해줌

  target.on = function (event, cb) {
    if (!eventMap[event]) {
      throw new Error(`Unsupported Event Name "${event}"`);
    }

    eventMap[event].push(cb);
  };
//target에 on메소드를 할당: event에 따른 callback을 할당해줌
  return function (event) {
    const callbacks = eventMap[event] || [];
    callbacks.forEach(cb => cb());
  };
//함수를 리턴, event를 인자로 받고 해당 이벤트 실행시 이벤트핸들러list를 모두 실행해주는 함수
}
