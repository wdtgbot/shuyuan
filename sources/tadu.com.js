function utf8ToString(value) {
  return unescape(value.replace(/&#x/g, '%u').replace(/\\u/g, '%u').replace(/;/g, ''));
}


const headers = ["sign:727f21066cbe3c6a38088f47f058fe3b","random:1%&+73"]

/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
  let response = GET(`https://xiao.tadu.com/search/list?page=1&keyWord=${key}&wechat=1`,{headers})
  let array = []
  let $ = JSON.parse(response)
  $.data.content.forEach((child) => {
    array.push({
      name: child.title,
      author: child.author,
      cover: child.img,
      detail: `https://xiao.tadu.com/free/bookDetail?bookId=${child.id}&wechat=1`,
    })
  })
  return JSON.stringify(array)
}

/**
 * 详情
 * @params {string} url
 * @returns {[{summary, status, category, words, update, lastChapter, catalog}]}
 */
const detail = (url) => {
  let response = GET(url, {headers})
  let $ = JSON.parse(response).book
  let book = {
    summary: $.intro,
    status: $.isSerial ? "连载中" : "已完结",
    category: $.brown + " " + $.blue,
    words: $.gray.replace('字',''),
    update: $.maxPartUpdateDate,
    lastChapter: $.maxPartNum,
    catalog: $.id
  }
  return JSON.stringify(book)
}

/**
 * 目录
 * @params {string} url
 * @returns {[{name, url, vip}]}
 */
const catalog = (url) => {
  let array = []
  for(i = 1;i <= 9999;i++) {
    let response = GET(`https://xiao.tadu.com/book/catalog?bookId=${url}&pgNum=${i}&sort=&&wechat=1`, {headers})
    let $ = JSON.parse(response)
    if($.catalog.length == 0) break
    $.catalog.forEach((chapter) => {
      array.push({
        name: chapter.catalogList,
        url: `https://xiao.tadu.com/book/read?bookId=${url}&partId=${chapter.bookPartId}&isNum=0&wechat=1`
      })
    })
  }
  return JSON.stringify(array)
}

/**
 * 章节
 * @params {string} url
 * @returns {string}
 */
const chapter = (url) => {
  let response = GET(url,{headers})
  let $ = JSON.parse(response)
  return utf8ToString($.data.content)
}

/**
 * 排行榜
 */
const rank = (title, category, page) => {
  let response = GET(`https://xiao.tadu.com/categoryDetail?categoryid=${category}&thirdcategory=0&chars=0&bookstatus=0&page=${page + 1}&wechat=1`, {headers})
  let books = []
  let $ = JSON.parse(response)
  $.data.content.forEach((child) => {
    books.push({
      name: child.title,
      author: child.author,
      cover: child.img,
      detail: `https://xiao.tadu.com/free/bookDetail?bookId=${child.id}&wechat=1`,
    })
  })
  return JSON.stringify({
    end: $.data.content.length == 0,
    books: books
  })
}

const ranks = [
  {
    title: {
      key: '1',
      value: '男频'
    },
    categories: [
      { key: "103", value: "现代都市" },
      { key: "108", value: "历史架空" },
      { key: "99", value: "东方玄幻" },
      { key: "113", value: "军事战争" },
      { key: "109", value: "武侠仙侠" },
      { key: "111", value: "科幻末世" },
      { key: "128", value: "灵异悬疑" },
      { key: "107", value: "西方奇幻" },
      { key: "112", value: "游戏竞技" },
      { key: "135", value: "脑洞创意" },
      { key: "281", value: "短篇小说" }
    ]
  },
  {
    title: {
      key: '2',
      value: '女频'
    },
    categories: [
      { key: "104", value: "现代言情" },
      { key: "129", value: "古代言情" },
      { key: "133", value: "幻想言情" },
      { key: "105", value: "浪漫青春" },
      { key: "288", value: "悬疑小说" },
      { key: "291", value: "短篇小说" }
    ]
  }
]

var bookSource = JSON.stringify({
  name: "塔读文学",
  url: "tadu.com",
  version: 107,
  ranks: ranks
})
