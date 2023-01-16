//转换时间戳
function timestampToTime(timestamp) {
  if(timestamp.toString().length == 13) var date = new Date(timestamp);
  else var date = new Date(timestamp * 1000);
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1):date.getMonth()+1) + '-';
  var D = (date.getDate()< 10 ? '0'+date.getDate():date.getDate())+ ' ';
  var h = (date.getHours() < 10 ? '0'+date.getHours():date.getHours())+ ':';
  var m = (date.getMinutes() < 10 ? '0'+date.getMinutes():date.getMinutes()) + ':';
  var s = date.getSeconds() < 10 ? '0'+date.getSeconds():date.getSeconds();
  return Y+M+D+h+m+s;
}

const UserId = localStorage.getItem("UserId")
const UserToken = localStorage.getItem("UserToken")
const user_token = UserToken ? `${UserId}/${UserToken}` : ""

const ua = "Mozilla/5.0 (Linux; Android 13; Mi 13 Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.5414.85 Mobile Safari/537.36"

const headers = [`user-agent:cxss-8kana/73 android/12 channel/1 sign/7be94c772cd149bf3737ebdfc97575df (Xiaomi, Mi 10, 1080*2206, 5972dfe17191bf23)`,`user-token: ${user_token}`]

/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
  let response = POST(`https://inf.8kana.com/book/search`, {data: `UserId=${UserId}&Keyword=${key}&SearchType=3&Page=1`,headers})
  let $ = JSON.parse(response).data
  let array = []
  $.Books.forEach((child) => {
    array.push({
      name: child.BookName,
      author: child.AuthorName,
      cover: child.BookCover,
      detail: child.BookId
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
  let response = POST("https://inf.8kana.com/Works/book", {data: `UserId=${UserId}&BookId=${url}&Type=1`,headers})
  let $ = JSON.parse(response).data
  let book = {
    summary: $.Info.Note,
    status: $.Info.SeriesStatus == 1 ? '连载' : '完结',
    category: $.Info.ClassName,
    words: $.Info.TotalWords,
    update: timestampToTime($.Info.LastModifyTime),
    lastChapter: $.Read.NewChapterName,
    catalog: url
  }
  return JSON.stringify(book)
}

/**
 * 目录
 * @params {string} url
 * @returns {[{name, url, vip}]}
 */
const catalog = (url) => {
  let response = POST("https://inf.8kana.com/book/newcatalog", {data: `BookId=${url}&UpdateTime=0&ChapterNo=0&UserId=${UserId}`,headers})
  let $ = JSON.parse(response).data
  let array = []
  let v = []
  $.ChapterList.forEach((chapter) => {
    if (JSON.stringify(v).indexOf(chapter.VolumeTitle) == -1) {
      array.push({
        name: chapter.VolumeTitle
     	})
      v.push(chapter.VolumeTitle)
    }
    array.push({
      name: chapter.Title,
      url: `a?bookId=${url}&chapterId=${chapter.ChapterId}`,
      vip: chapter.IsVip === "1"
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
  let response = POST("https://inf.8kana.com/long/readbook", {data: `UserId=${UserId}&bookId=${url.query("bookId")}&chapterId=${url.query("chapterId")}&lastModifyTime=0`,headers})
  let $ = JSON.parse(response)
  //未购买返回403和自动订阅地址
  if ($.msg == '付费章节，需要购买') throw JSON.stringify({
    code: 403,
    message: `https://www.8kana.com/read/${url.query("chapterId")}.html?ua=${ua}`
  })
  return $.data.chapters.sections.join("\n")
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
  let response = POST(`https://inf.8kana.com/User/userinfo`,{data:`UserId=${UserId}`,headers})
  let $ = JSON.parse(response)
  if ($.msg === "用户Id不能为空！") throw JSON.stringify({
    code: 401
  })
  return JSON.stringify({
    basic: [
      {
        name: "账号",
        value: $.data.UserNickname,
        url: `https://www.8kana.com/member/index/index/${UserId}?ua=${ua}`
      },
      {
        name: '余额',
        value: $.data.UserCoin,
        url: `https://www.8kana.com/member/wallet?ua=${ua}`
      },
      {
        name: '月票',
        value: $.data.MonthNum,
        url: `https://www.8kana.com/member/wallet?ua=${ua}`
      },
      {
        name: '推荐票',
        value: $.data.RecommendNum,
        url: `https://www.8kana.com/member/wallet?ua=${ua}`
      }
    ],
    extra: [
      {
        name: '书架',
        type: 'books',
        method: 'bookshelf'
      }
    ]
  })
}

/**
 * 书架
 * @param {页码} page
 * @returns {[{name, author, cover, detail}]}
 */
const bookshelf = (page) => {
  let response = POST(`https://inf.8kana.com/Bookshelf/newIndex`,{data:`UserId=${UserId}&Page=${page + 1}`,headers})
  let $ = JSON.parse(response)
  let books = $.data.map(book => ({
    name: book.BookName,
    author: book.AuthorName,
    cover: book.BookCover,
    detail: book.BookId
  }))
  return JSON.stringify({
    end: $.data.length === 0,
    books: books
  })
}

/**
 * 排行榜
 * @param {页码} page
 * @returns {[{name, author, cover, detail}]}
 */
const rank = (title, category, page) => {
  let response = POST(`https://inf.8kana.com/book/channel`, {data: `Sex=1&Class0Id=${title}&VipType=&SeriesStatus=0&SearchType=1&Page=${page + 1}`,headers})
  let $ = JSON.parse(response)
  let books = $.data.books.map(book => ({
    name: book.BookName,
    author: book.AuthorName,
    cover: book.BookCover,
    detail: book.BookId
    }))
    return JSON.stringify({
      end: $.data.books.length === 0,
      books: books
    })
}

const ranks = [{
        title: {
            key: '3',
            value: '烧脑'
        }
    },
    {
        title: {
            key: '6',
            value: '神州'
        }
    },
    {
        title: {
            key: '1',
            value: '轻幻想'
        }
    },
    {
        title: {
            key: '2',
            value: '重幻想'
        }
    },
    {
        title: {
            key: '4',
            value: '轻小说'
        }
    }
]

const login = (args) => {
  if(!args) return "账号或者密码不能为空!"
  let response = POST(`https://inf.8kana.com/Passport/login`,{data: `UserName=${args[0]}&Password=${args[1]}`,headers})
  let $ = JSON.parse(response)
  if($.code != 1) return $.msg
  localStorage.setItem("UserId", $.data.UserId)
  localStorage.setItem("UserToken", $.data.UserToken)
}

var bookSource = JSON.stringify({
  name: '不可能的世界',
  url: '8kana.com',
  version: 106,
  authorization: JSON.stringify(['account','password']),
  cookies: [".8kana.com"],
  ranks: ranks
})