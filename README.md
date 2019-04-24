# Vanilla Bookstore

![](assets/GIFfiles/vanilla-book-store_1.gif)

![](assets/GIFfiles/vanilla-book-store_2.gif)

# Introduction

## Setup

Install dependencies

```sh
$ yarn install (or npm install)
```

## Development

```sh
$ yarn dev (or npm run dev)
# visit http://localhost:8080
```

## Features

### 1. 책 검색창 보여주기

- 검색어를 입력하면 [Naver Book Search API](https://developers.naver.com/docs/search/book/)로부터 검색 결과를 가져옵니다.
- 검색어는 1글자 이상 20글자 이하(공백 포함) 입니다.
- 검색 데이터를 가져오는 동안에는 새로운 검색이 불가능 합니다.

### 2. 검색 결과 보여주기

- 리스트 형식을 기본으로 검색결과를 보여주지만 카드 형식으로 보는 것도 선택이 가능합니다.
- 검색 결과는 20개가 먼저 보이고 스크롤을 최하단까지 내릴 경우 추가 자료가 있다면 20개씩 추가로 보입니다.
- 각 검색 결과는 아래의 항목들을 표시 합니다.
  - 책 제목
  - 작가 이름
  - 출판사 이름
  - 책 요약 정보 (50글자까지만 보여주어야 합니다.)
  - 출판일
  - 썸네일 이미지 (이미지가 없을 경우, 다른 dummy image를 구해서 대체해주세요.)
  - 해당 검색 결과의 링크 단축 URL ([Naver URL Shortener API](https://developers.naver.com/docs/utils/shortenurl/) 이용)
