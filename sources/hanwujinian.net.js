const headers = ["version:5.7.1","User-Agent:okhttp/3.11.0"]

const uid = localStorage.getItem("uid") ? localStorage.getItem("uid") : "0"

const tp_token = localStorage.getItem("tp_token")

function getauthor(bid) {
  let response = POST("https://api.hanwujinian.net/api.php/api/book_app/bookInfos",{data:`bookId=${bid}&uid=${uid}`,headers})
  let $ = JSON.parse(response).data
  return $.author
}

//搜索
const search = (key) => {
  let response = POST("https://api.hanwujinian.net/api.php/api/search_app/searchResult",{data:`search=${key}&uid=${uid}&offset=0&limit=20&type=0`,headers})
  let $ = JSON.parse(response)
  let array = []
  $.data.book.forEach((child) => {
    array.push({
      name: child.bookname,
      author: child.author,
      cover: child.pic,
      detail: child.bookid
    })
  })
  return JSON.stringify(array)
}

//详情  
const detail = (url) => {
  let response = POST("https://api.hanwujinian.net/api.php/api/book_app/bookInfos",{data:`bookId=${url}&uid=${uid}`,headers})
  let $ = JSON.parse(response).data
  let book = {
    summary: $.bookIntro,
    status: $.isEnd == false ? '连载' : '完结',
    category: $.bookLabel.replaceAll("|"," "),
    words: $.bookSize,
    update: $.updateTime,
    lastChapter: $.chapterName,
    catalog: $.bookId 
  }
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let response = POST("https://api.hanwujinian.net/api.php/api/book_app/chapterListWithUserStatus",{data:`bookId=${url}&uid=${uid}&offset=0&limit=0`,headers})
  let $ = JSON.parse(response)
  let array = []
  $.data.chapterlist.forEach((chapter) => {
    if(chapter.chapterType == 1) array.push({
      name: chapter.chapterName  
    })
    else array.push({
      name: chapter.chapterName,
      url: `aid=${chapter.bookId}&uid=${uid}&cid=${chapter.chapterId}`,
      vip: chapter.isVip == true
    })
  })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
  let response = POST("https://api.hanwujinian.net/api.php/api/book_app/read",{data:url,headers})
  let $ = JSON.parse(response).data
  //未购买返回403和自动订阅地址
  if ($.isvip == 1&&$.isbuy != 1) throw JSON.stringify({
    code: 403,
    message: `http://wap.hanwujinian.com/read/${$.bookId}/${$.chapterid}`
  })
  if($.notice) return $.content.trim() + "\n" + "作者有话说：" + "\n" + $.notice
  else return $.content.trim()
  
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
    let response = POST("https://api.hanwujinian.net/api.php/api/user_app/index/",{data:`uid=${uid}&token=${tp_token}`,headers})
    let $ = JSON.parse(response)
    return JSON.stringify({
        basic: [
            {
                name: '账号',
                value: $.userUname,
                url: 'http://wap.hanwujinian.com/index.php/wap/user/index'
            },
            {
                name: '虫币',
                value: $.egold,
                url: 'http://wap.hanwujinian.com/index.php/wap/pay/payWechatWap',
            },
            {
                name: '阅读币',
                value: $.luckeyMoney,
                url: 'http://wap.hanwujinian.com/index.php/wap/user/index'
            },
            {
                name: '纪年点',
                value: $.points,
                url: 'http://wap.hanwujinian.com/index.php/wap/user/index',
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
 * 我的书架
 * @param {页码} page 
 */
const bookshelf = (page) => {
  let response = POST("https://api.hanwujinian.net/api.php/api/bookcase_app/bookcaseList",{data:`uid=${uid}&limit=1000&offset=0&lastupdate=0&ordername=0`,headers})
  let $ = JSON.parse(response)
  let books = $.data.bookdata.map(book => ({
    name: book.bookName,
    author: getauthor(book.bookId),
    cover: book.bookImage,
    detail: book.bookId
  }))
  return JSON.stringify({books})
}

//排行榜
const rank = (title, category, page) => {
  let response = POST("https://api.hanwujinian.net/api.php/api/home_app/rankDetailList",{data:`name=${title}&period=${category}`,headers})
  let $ = JSON.parse(response)
  let books = []
  $.data.forEach((child) => {
    books.push({
      name: child.bookName,
      author: child.author,
      cover: child.bookImage,
      detail: child.articleId
    })
  })
  return JSON.stringify({books})
}


const ranks = [
  {
    title: {
      key: 'sale',
      value: '热销榜'
    },
    categories: [
      { key: "day", value: "日榜" },
      { key: "week", value: "周榜" },
      { key: "month", value: "月榜" }
    ]
  },
  {
    title: {
      key: 'collect',
      value: '收藏榜'
    },
    categories: [
      { key: "day", value: "日榜" },
      { key: "week", value: "周榜" },
      { key: "month", value: "月榜" }
    ]
  },
  {
    title: {
      key: 'end',
      value: '完结榜'
    },
    categories: [
      { key: "day", value: "日榜" },
      { key: "week", value: "周榜" },
      { key: "month", value: "月榜" }
    ]
  },
  {
    title: {
      key: 'fame',
      value: '人气榜'
    },
    categories: [
      { key: "day", value: "日榜" },
      { key: "week", value: "周榜" },
      { key: "month", value: "月榜" }
    ]
  },
  {
    title: {
      key: 'potential',
      value: '潜力榜'
    },
    categories: [
      { key: "day", value: "日榜" },
      { key: "week", value: "周榜" },
      { key: "month", value: "月榜" }
    ]
  },
  {
    title: {
      key: 'sign',
      value: '签约榜'
    },
    categories: [
      { key: "day", value: "日榜" },
      { key: "week", value: "周榜" },
      { key: "month", value: "月榜" }
    ]
  },
  {
    title: {
      key: 'click',
      value: '点击榜'
    },
    categories: [
      { key: "day", value: "日榜" },
      { key: "week", value: "周榜" },
      { key: "month", value: "月榜" }
    ]
  },
  {
    title: {
      key: 'reward',
      value: '打赏榜'
    },
    categories: [
      { key: "week", value: "周榜" },
      { key: "month", value: "月榜" }
    ]
  },
  {
    title: {
      key: 'update',
      value: '更新榜'
    },
    categories: [
      { key: "day", value: "日榜" },
      { key: "week", value: "周榜" },
      { key: "month", value: "月榜" }
    ]
  },
  {
    title: {
      key: 'vip',
      value: '包月榜'
    },
    categories: [
      { key: "month", value: "月榜" }
    ]
  }
]

const login = (args) => {
    if(!args) return "账号或者密码不能为空"
    let response = POST("https://api.hanwujinian.net/api.php/api/login_app/login",{data:`deviceid=0000000000000000000000000000000000000000&username=${args[0]}&password=${args[1]}`,headers})
    let $ = JSON.parse(response)
    if($.status != 1) return $.msg
    localStorage.setItem("tp_token", $.data.tp_token)
    localStorage.setItem("uid", $.data.uid.toString())
}

var bookSource = JSON.stringify({
  name: "寒武纪年小说",
  url: "hanwujinian.net",
  version: 104,
  authorization: JSON.stringify(['account','password']),
  cookies: [".hanwujinian.net"],
  ranks: ranks
})
