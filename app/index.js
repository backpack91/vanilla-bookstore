// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================


// Importing component templates
import bookChartTemplate from 'bookChart.ejs';
import headerTemplate from 'header.ejs';
import bodyTemplate from 'body.ejs';

import Gorilla from '../Gorilla';

let countForURLReq = 0;
const shortenedUrlList = [];
let bookInfoStorage = [];
let infosToAdd = [];
let countForBookInfoReq = 0;
let chartType = 'list';
let requestedloadMore = false;
let gotResponse = true;
let isFirstRender = true;

const header = new Gorilla.Component(headerTemplate, {
  headerClass: 'header',
  titleClass: 'title'
});

const bookChart = new Gorilla.Component(bookChartTemplate, {
  book: [],
  chartType,
  bookChartClass: 'bookChartAfterSearch',
  isFirstRender: true
});

const body = new Gorilla.Component(bodyTemplate, {
}, {
  header,
  bookChart
});

body.topBtn = function (event) {
  scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

header.onSearchSubmit = function (event) {
  const keyWord = document.querySelector('#input').value;

  if (event.keyCode === 13 && keyWord.length >= 1 && keyWord.length <= 20 && gotResponse) {
    gotResponse = false;
    bookInfoStorage.length = 0;
    countForBookInfoReq = 0;
    makeRequest(keyWord);
    document.querySelector('#header').classList.remove('header');
    document.querySelector('#header').classList.add('headerAfterSearch');
    document.querySelector('#title').classList.remove('title');
    document.querySelector('#title').classList.add('titleAfterSearch');
    bookChart.isFirstRender = false;
  }
};

header.onSearchBtnClick = function (event) {
  const keyWord = document.querySelector('#input').value;

  gotResponse = false;
  bookInfoStorage.length = 0;
  countForBookInfoReq = 0;
  makeRequest(keyWord);
  header.headerClass = 'headerAfterSearch';
  header.titleClass = 'titleAfterSearch';
};

header.TransformToCard = function (event) {
  bookChart.chartType = 'card';
};

header.TransformToList = function (event) {
  bookChart.chartType = 'list';
};

bookChart.on('AFTER_RENDER', () => {
  requestedloadMore = false;
  gotResponse = true;
});

window.addEventListener('scroll', function (event) {
  const bookChart = document.querySelector('#bookChart');
  const topBtn = document.querySelector('.topBtn');
  const keyWord = document.querySelector('#input').value;

  if ( !requestedloadMore && (bookChart.offsetHeight + bookChart.offsetTop + 100) === window.scrollY + window.innerHeight) {
    requestedloadMore = true;
    makeRequest(keyWord);
  }
  if (window.scrollY >500 && topBtn.classList.contains('hide')) {
    topBtn.classList.remove('hide');
  } else if (window.scrollY <= 500 && !topBtn.classList.contains('hide')){
    topBtn.classList.add('hide');
  }
});

Gorilla.renderToDOM (body, document.querySelector('#root'));

function listUp (infoList) {
  bookChart.book = infoList;
}

function infoModifier () {
  for (let i = 0; i < shortenedUrlList.length; i++) {
    let oldDescription = bookInfoStorage[i + (20 * (countForBookInfoReq-1))].description;
    let oldTitle = bookInfoStorage[i + (20 * (countForBookInfoReq-1))].title;

    bookInfoStorage[i + (20 * (countForBookInfoReq-1))]['link'] = shortenedUrlList[i].url;
    oldDescription = oldDescription.replace(/<b>/g, '');
    oldDescription = oldDescription.replace(/<\/b>/g, '');
    if (oldDescription.length) {
      oldDescription = oldDescription.slice(0,50) + "...";
    }
    bookInfoStorage[i + (20 * (countForBookInfoReq-1))].description = oldDescription;
    oldTitle = oldTitle.replace(/<b>/g, '');
    oldTitle = oldTitle.replace(/<\/b>/g, '');
    bookInfoStorage[i + (20 * (countForBookInfoReq-1))].title = oldTitle;
  }
  listUp(bookInfoStorage);
}

function playURLShortner (infoList) {
  shortURLRequest(infoList[countForURLReq].link);
}

function makeRequest (keyWord) {
  const req = new XMLHttpRequest();

  req.onreadystatechange = function () {
    if (req.readyState === 4) {
      if(req.status === 200) {
        if (JSON.parse(req.responseText).items.length !== 0) {
          countForBookInfoReq++;
          infosToAdd.length = 0;
          shortenedUrlList.length = 0;
          countForURLReq = 0;
          infosToAdd = infosToAdd.concat(JSON.parse(req.responseText).items);
          bookInfoStorage = bookInfoStorage.concat(JSON.parse(req.responseText).items);
          playURLShortner(JSON.parse(req.responseText).items);
        }
      } else {
        console.log("Error loading infos...");
      }
    }
  };
  req.open('GET', `http://localhost:3000/v1/search/book/?query=${keyWord}&display=20&start=${1+(20 * countForBookInfoReq)}`, true);
  req.send();
  req.onreadystatechange();
}

function shortURLRequest (url) {
  const req = new XMLHttpRequest();

  req.onreadystatechange = function (url) {
    if (req.readyState === 4) {
      if(req.status === 200) {
        shortenedUrlList.push(JSON.parse(req.responseText).result);
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
