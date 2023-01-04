/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
  let response = GET(`https://w.linovelib.com/S8/?searchkey=${key}&searchtype=all`)
  let array = []
  let $ = HTML.parse(response)
  if ($('h1.header-back-title').text() == "搜索结果") {
    $('li.book-li').forEach((child) => {
      let $ = HTML.parse(child)
      array.push({
        name: $('h4.book-title').text(),
        author: $('span.book-author').text().replace('作者 ',''),
        cover: $('img').attr('data-original'),
        detail: `https://w.linovelib.com${$('a.book-layout').attr('href')}`
      })
    })
  } else {
    array.push({
      name: $('[property=og:novel:book_name]').attr('content'),
      author: $('[property=og:novel:author]').attr('content'),
      cover: $('[property=og:image]').attr('content'),
      detail: $('[property=og:url]').attr('content')
    })
  }
  return JSON.stringify(array)
}

/**
 * 详情
 * @params {string} url
 * @returns {[{summary, status, category, words, update, lastChapter, catalog}]}
 */
const detail = (url) => {
  let response = GET(url)
  let $ = HTML.parse(response)
  let book = {
    summary: $('[property=og:description]').attr('content'),
    status: $('[property=og:novel:status]').attr('content'),
    category: $('[property=og:novel:category]').attr('content'),
    words: $('p.book-meta:nth-child(4)').text().replace(" ","").replace(/字\|.+/,""),
    update: $('[property=og:novel:update_time]').attr('content'),
    lastChapter: $('[property=og:novel:latest_chapter_name]').attr('content'),
    catalog: $('[property=og:novel:read_url]').attr('content')
  }
  return JSON.stringify(book)
}

/**
 * 目录
 * @params {string} url
 * @returns {[{name, url, vip}]}
 */
const catalog = (url) => {
  let response = GET(url)
  let $ = HTML.parse(response)
  let array = []
  $('#volumes > li').forEach((booklet) => {
    let $ = HTML.parse(booklet)
    if($("li.chapter-bar").text())
      array.push({ name: $("li.chapter-bar").text() })
    else array.push({
      name: $("a").text(),
      url: `https://w.linovelib.com${$("a").attr("href")}`
    })
  })
  return JSON.stringify(array)
}

/**
 * 章节
 * @params {string} url
 * @returns {string}
 */
const chapter = (url) => {
  let content = ""
  let i = 2
  let first_url = url
  while (true) {
    let response = GET(url)
    let $ = HTML.parse(response)
    content += $('#acontent')
    let next_btn = $('#footlink > a:contains(下一页)')
    if (next_btn.length == 0) {
      break
    }
    url = first_url.replace('.html', `_${i}.html`);
    i += 1
  }
  return content
}

/**
 * 排行榜
 */
const rank = (title, category, page) => {
  let response = GET(`https://w.linovelib.com/top/${title}/${page + 1}.html`)
  let $ = HTML.parse(response)
  let books = []
  $('ol > li').forEach((child) => {
    let $ = HTML.parse(child)
    books.push({
      name: $('h4.book-title').text(),
      author: $('span.book-author').text(),
      cover: $('img').attr('data-original'),
      detail: `https://w.linovelib.com${$('a.book-layout').attr('href')}`
    })
  })
  return JSON.stringify({
    end: $('ol').length == 0,
    books: books
  })
}

const ranks = [
  {
    title: {
      key: 'goodnum',
      value: '收藏榜'
    }
  },
  {
    title: {
      key: 'words',
      value: '字数榜'
    }
  },
  {
    title: {
      key: 'newhot',
      value: '新书榜'
    }
  },
  {
    title: {
      key: 'allvisit',
      value: '总点击榜'
    }
  },
  {
    title: {
      key: 'monthvisit',
      value: '月点击榜'
    }
  },
  {
    title: {
      key: 'allvote',
      value: '总推荐榜'
    }
  },
  {
    title: {
      key: 'monthvote',
      value: '月推荐榜'
    }
  },
  {
    title: {
      key: 'allflower',
      value: '总鲜花榜'
    }
  },
  {
    title: {
      key: 'monthflower',
      value: '月鲜花榜'
    }
  },
  {
    title: {
      key: 'lastupdate',
      value: '最近更新'
    }
  },
  {
    title: {
      key: 'postdate',
      value: '最新入库'
    }
  },
  {
    title: {
      key: 'signtime',
      value: '最新上架'
    }
  }
]

var bookSource = JSON.stringify({
  name: "哔哩轻小说",
  url: "linovelib.com",
  version: 108,
  ranks: ranks
})
