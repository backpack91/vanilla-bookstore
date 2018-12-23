// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================


// Importing component templates
import bookChartTemplate from 'bookChart.ejs';
import headerTemplate from 'header.ejs';
import bodyTemplate from 'body.ejs';

// Import Gorilla Module
import Gorilla from '../Gorilla';

var countForURLReq = 0;//url함수 비동기  count
var urlList = [];//줄여진 url
var bookInfos = [];//축적된 모든 -자료
var infosToAdd = [];//추가적으로 받은 책 자료
var countBookInfoReq = 0;//책자료 startIndex
var whichType = 'list';
var isDone = false;
var currentScrollY = 0;

var header = new Gorilla.Component(headerTemplate, {
});

var bookChart = new Gorilla.Component(bookChartTemplate, {
  book: [],
  whichType: whichType
});

var body = new Gorilla.Component(bodyTemplate, {
}, {
  header,
  bookChart
});

header.clickByEnter = function (event) {
  var keyWord = document.querySelector('#input').value;
  if (event.keyCode === 13 && keyWord.length >= 1 && keyWord.length <= 20) {
    currentScrollY = 0;
    bookInfos.length = 0;
    countBookInfoReq = 0;
    console.log('*****enter!*****');
    makeRequest(keyWord);
  }
}

header.clickButt = function (event) {
  var keyWord = document.querySelector('#input').value;
  if (event.keyCode === 13 && keyWord.length >= 1 && keyWord.length <= 20) {
    currentScrollY = 0;
    bookInfos.length = 0;
    countBookInfoReq = 0;
    console.log('workingRequest2')
    makeRequest(keyWord);
  }
}

header.TransformToCard = function (event) {
  bookChart.whichType = 'card';
}

header.TransformToList = function (event) {
  bookChart.whichType = 'list';
}

// body.loadMore = function (event) {
//   var keyWord = document.querySelector('#input').value;
//   makeRequest(keyWord);
// }

window.addEventListener('scroll', function (event) {
  var bookChart = document.querySelector('.bookChart');
  if ( !isDone && (bookChart.offsetHeight + bookChart.offsetTop) === window.scrollY + 613) {
    isDone = true;
    // currentScrollY = window.scrollY;
    var keyWord = document.querySelector('#input').value;
    makeRequest(keyWord);
  }
});

bookChart.on('AFTER_RENDER', () => {
  // window.scrollTo(0, currentScrollY);
  isDone = false;
});

Gorilla.renderToDOM ( body, document.querySelector('#root'));

function listUp (infoList) {
  bookChart.book = infoList;
}

function infoModifier () {
  console.log('*****infoModifier*****');
  for (var i = 0; i < urlList.length; i++) {
    bookInfos[i + (12 * (countBookInfoReq-1))]['link'] = urlList[i].url;

    if (bookInfos[i + (12 * (countBookInfoReq - 1))].description.length > 50) {
      var allDescription = bookInfos[i + (12 * (countBookInfoReq - 1))].description;
      bookInfos[i + (12 * (countBookInfoReq - 1))].description = allDescription.split('').slice(0, 50).join('');
    }
  }

  var listVersion = document.querySelector('#listversion');
  var cardVersion = document.querySelector('#cardVersion');
  listUp(bookInfos);
}

function playURLShortner (infoList) {
  console.log('*****playURLShortner*****');
  shortURLRequest(infoList[countForURLReq].link);
}

function makeRequest (keyWord) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (req.readyState === 4) {
      if(req.status === 200) {
        console.log('*****makeRequest*****');
        countBookInfoReq++;
        infosToAdd.length = 0;
        urlList.length = 0;
        countForURLReq = 0;
        infosToAdd = infosToAdd.concat(JSON.parse(req.responseText).items);
        bookInfos = bookInfos.concat(JSON.parse(req.responseText).items);
        playURLShortner(JSON.parse(req.responseText).items);
      } else {
        console.log("Error loading page\n");
      }
    }
  };
  req.open('GET', `http://localhost:3000/v1/search/book/?query=${keyWord}&display=12&start=${1+(12 * countBookInfoReq)}`, true);
  req.send();
  req.onreadystatechange();
}

function shortURLRequest (url) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function (url) {
    if (req.readyState === 4) {
      if(req.status === 200) {
        console.log('*****shortURLRequest*****');
        urlList.push(JSON.parse(req.responseText).result);
        if (countForURLReq !== infosToAdd.length-1) {
          countForURLReq++;
          playURLShortner(infosToAdd);
        } else {
          infoModifier();
        }
      } else {

        console.log("Error loading URL\n");
      }
    }
  };
  req.open('GET', `http://localhost:3000/v1/util/shorturl/?url=${url}`, true);
  req.send();
  req.onreadystatechange();
}

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */
