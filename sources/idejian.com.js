/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
  let response = GET(`https://wechat.idejian.com/api/wechat/search/do?keyword=${key}&page=1`)
  let array = []
  let $ = JSON.parse(response)
  $.body.books.forEach((child) => {
    array.push({
      name: child.bookName,
      author: child.author,
      cover: child.picUrl,
      detail: child.bookId
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
  let response = GET(`https://wechat.idejian.com/api/wechat/book/${url}?bookId=${url}`)
  let $ = JSON.parse(response).body
  let book = {
    summary: $.bookInfo.desc,
    status: $.bookInfo.completeState,
    category: $.bookInfo.category,
    words: $.bookInfo.wordCount.join("").replace("字",""),
    update: $.newestChapter.updateTime,
    lastChapter: $.newestChapter.lastChapter,
    catalog: $.bookInfo.bookId
  }
  return JSON.stringify(book)
}

/**
 * 目录
 * @params {string} url
 * @returns {[{name, url, vip}]}
 */
const catalog = (url) => {
  let response = GET(`https://wechat.idejian.com/api/wechat/allcatalog/${url}?bookId=${url}`)
  let $ = JSON.parse(response).body
  let array = []
  $.chapterList.forEach((chapter) => {
    array.push({
      name: chapter.name,
      url: JSON.stringify({
        bid: url,
        cid: chapter.id
      })
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
  url = JSON.parse(url)
  let content = ""
  for(let i = 1;i<=100;i++) {
    let response = GET(`https://wechat.idejian.com/api/wechat/book/${url.bid}/${url.cid}/${i}?bookId=${url.bid}&chapterId=${url.cid}`)
    let a = JSON.parse(response).body
    let $ = HTML.parse(a.content)
    if($("div.h5_mainbody_bg")[0]) content += $("div.h5_mainbody_bg")
    else if(url.cid == 1) content += $("div.h5_mainbody")[1].remove("h1")
         else content += $("div.h5_mainbody").remove("h1")
    if(a.pageInfo.currentPage == a.pageInfo.pageCount) break
  }
  return content
}

/**
 * 排行榜
 */
const rank = (title, category, page) => {
  let response = GET(`https://wechat.idejian.com/api/wechat/subcategory?categoryId=${category}&resourcesId=28&order=1&filterInfo=&page=${page + 1}`)
  let $ = JSON.parse(response).body
  let books = []
  $.books.forEach((child) => {
    books.push({
      name: child.bookName,
      author: child.author,
      cover: child.picUrl,
      detail: child.bookId,
    })
  })
  return JSON.stringify({
    end: $.pageInfo.page == $.pageInfo.totalPage,
    books: books
  })
}

const ranks = [
  {
    title: {
      key: '1',
      value: '男生'
    },
    categories: [
      { key: 1432, value: '都市' },
      { key: 1433, value: '玄幻' },
      { key: 1434, value: '仙侠' },
      { key: 1435, value: '武侠' },
      { key: 1436, value: '科幻' },
      { key: 1437, value: '奇幻' },
      { key: 1438, value: '校园' },
      { key: 1439, value: '军事' },
      { key: 1440, value: '游戏' },
      { key: 1441, value: '竞技' },
      { key: 1442, value: '历史' }
    ]
  },
  {
    title: {
      key: '2',
      value: '女频'
    },
    categories: [
      { key: 1443, value: '现代言情' },
      { key: 1444, value: '古代言情' },
      { key: 1445, value: '幻想言情' },
      { key: 1446, value: '青春校园' },
      { key: 1447, value: '次元专区' },
      { key: 1448, value: '同人作品' },
      { key: 1449, value: '惊悚恐怖' }
    ]
  },
  {
    title: {
      key: '3',
      value: '出版'
    },
    categories: [
      { key: 1450, value: '人文社科' },
      { key: 1451, value: '经管励志' },
      { key: 1452, value: '文学艺术' },
      { key: 1453, value: '生活' },
      { key: 1454, value: '教育' }
    ]
  }
]

var bookSource = JSON.stringify({
  name: "得间小说",
  url: "idejian.com",
  version: 100,
  ranks: ranks
})