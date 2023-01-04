require('crypto-js')

//转换更新时间 时间戳
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

const time = Math.round(Date.now()/1000)

const headers = [`Authorization: Bearer ${localStorage.getItem('auth')}`,`deviceIdentify: 00000000000000000000000000000000`,`timestamp: ${time}`,`signature: ${CryptoJS.MD5("00000000000000000000000000000000" + time + "9495ef469eb3e7ae8ef3").toString().toUpperCase()}`,"deviceType:android"]

//搜索
const search = (key) => {
  let response = GET(`https://android-api.xrzww.com/api/searchAll?search_type=novel&search_value=${key}&page=1&pageSize=20`,{headers})
  let $ = JSON.parse(response).data
  let array = []
  $.data.forEach((child) => {
    array.push({
      name: child.novel_name,
      author: child.novel_author,
      cover: `http://oss.xrzww.com${child.novel_cover}`,
      detail: `https://android-api.xrzww.com/api/detail?novel_id=${child.novel_id}`
    })
  })
  return JSON.stringify(array)
}

//详情  
const detail = (url) => {
  let response = GET(url,{headers})
  let $ = JSON.parse(response).data
  let book = {
    summary: $.novel_info,
    status: $.novel_process == 1 ? '连载' : '完结',
    category: $.novel_tags.replace(/,/g," "),
    words: $.novel_wordnumber,
    update: timestampToTime($.novel_uptime),
    lastChapter: $.novel_newcname,
    catalog: `https://android-api.xrzww.com/api/novelDirectory?nid=${$.novel_id}&orderBy=asc`
  }
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let response = GET(url,{headers})
  let $ = JSON.parse(response)
  let array = []
  $.data.forEach((booklet) => {
    array.push({ name: booklet.volume_name })
    booklet.chapter_list.forEach((chapter) => {
      array.push({
        name: chapter.chapter_name,
        url: `https://android-api.xrzww.com/api/readNew?chapter_id=${chapter.chapter_id}&nid=${chapter.chapter_nid}&chapter_order=${chapter.chapter_order}&vid=${chapter.chapter_vid}`,
        vip: chapter.chapter_ispay == 1
      })
    })
  })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
  let response = GET(url,{headers})
  let $ = JSON.parse(response)
  //未购买返回403和自动订阅地址
  if ($.message == "订阅后再阅读") throw JSON.stringify({
    code: 403,
    message: `https://h5.xrzww.com/#/pages/bookread/index?data={"nid":${$.data.chapter_nid},"vid":${$.data.chapter_vid},"chapter_id":${$.data.chapter_id},"chapter_order":${$.data.chapter_order}}`
  })
  return $.data.content.trim()
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
    let $ = JSON.parse(GET(`https://android-api.xrzww.com/api/getUserInfo`,{headers}))
    if ($.message === '请登录后再访问') throw JSON.stringify({
        code: 401
    })
    return JSON.stringify({
        basic: [
            {
                name: '账号',
                value: $.data.user_nickname,
                url: ''
            },
            {
                name: '书币',
                value: $.data.user_gold2,
                url: '',
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
  let response = GET(`https://android-api.xrzww.com/api/getBookshelfListNew`,{headers})
  let $ = JSON.parse(response).data
  let books = $.data.map(book => ({
    name: book.novel_name,
    author: book.novel_author,
    cover: `http://oss.xrzww.com${book.novel_cover}`,
    detail: `https://android-api.xrzww.com//api/detail?novel_id=${book.novel_id}`
  }))
  return JSON.stringify({books})
}

//排行榜
const rank = (title, category, page) => {
  let response = GET(`https://android-api.xrzww.com/api/getTypeNovel?novel_sex=${title}&second_type=${category}&page=${page + 1}`,{headers})
  let $ = JSON.parse(response)
  let books = []
  $.data.data.forEach((child) => {
    books.push({
      name: child.novel_name,
      author: child.novel_author,
      cover: `https://oss.xrzww.com${child.novel_cover}`,
      detail: `https://android-api.xrzww.com/api/detail?novel_id=${child.novel_id}`,
    })
  })
  return JSON.stringify({
    end: $.data.current_page == $.data.last_page,
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
      { key: "1", value: "玄幻" },
      { key: "2", value: "仙侠" },
      { key: "3", value: "都市" },
      { key: "4", value: "历史" },
      { key: "5", value: "科幻" },
      { key: "6", value: "奇幻" },
      { key: "7", value: "军事" },
      { key: "11", value: "悬疑" },
      { key: "14", value: "武侠" },
      { key: "9", value: "泛次元" }
    ]
  },
  {
    title: {
      key: '2',
      value: '女频'
    },
    categories: [
      { key: "129", value: "悬疑" },
      { key: "135", value: "衍生" },
      { key: "134", value: "魔幻" },
      { key: "77", value: "现言" },
      { key: "80", value: "古言" },
      { key: "81", value: "幻言" },
      { key: "82", value: "情感" },
      { key: "83", value: "现实" }
    ]
  }
]

const login = (args) => {
  if(!args) return "账号或者密码不能为空"
  let response = GET(`https://android-api.xrzww.com/api/login?user_name=${args[0]}&user_password=${args[1]}`)
  let $ = JSON.parse(response)
  if($.code == 400) return "账号或密码错误"
  localStorage.setItem("auth", $.data.token)
}

var bookSource = JSON.stringify({
  name: "息壤中文网",
  url: "xrzww.com",
  version: 107,
  authorization: JSON.stringify(['account','password']),
  cookies: ["xrzww.com"],
  ranks: ranks
})
