require('crypto-js')

//转换更新时间 时间戳
function timestampToTime(timestamp) {
  var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1):date.getMonth()+1) + '-';
  var D = (date.getDate()< 10 ? '0'+date.getDate():date.getDate())+ ' ';
  var h = (date.getHours() < 10 ? '0'+date.getHours():date.getHours())+ ':';
  var m = (date.getMinutes() < 10 ? '0'+date.getMinutes():date.getMinutes()) + ':';
  var s = date.getSeconds() < 10 ? '0'+date.getSeconds():date.getSeconds();
  return Y+M+D+h+m+s;
}

//搜索
const search = (key) => {
  let sig = CryptoJS.MD5(`082DE6CF1178736AF28EB8065CDBE5ACapi_key=27A28A4D4B24022E543E&apn=ctnet&appId=ZHKXS&brand=&channelId=zh-zhh5&channelType=H5&clientVersion=7.2.6.11&fromRP=0&installId=&keyword=${key}&model=&modelName=&os=android&osVersion=31&pageNum=1&preChannelId=zh-zhh5&screenH=2206&screenW=1080&userId=0082DE6CF1178736AF28EB8065CDBE5AC`)
  let response = POST("https://api1.zongheng.com/api/booksearch/search",{data:`api_key=27A28A4D4B24022E543E&apn=ctnet&appId=ZHKXS&brand=&channelId=zh-zhh5&channelType=H5&clientVersion=7.2.6.11&fromRP=0&installId=&keyword=${key}&model=&modelName=&os=android&osVersion=31&pageNum=1&preChannelId=zh-zhh5&screenH=2206&screenW=1080&userId=0&sig=${sig}`})
  let $ = JSON.parse(response)
  let array = []
  $.result.bookList.forEach((child) => {
    array.push({
      name: child.originalName,
      author: child.authorName.replace(/<font.+'>/,"").replace("</font>",""),
      cover: child.picUrl,
      detail: child.bookId,
    })
  })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
  let sig = CryptoJS.MD5(`082DE6CF1178736AF28EB8065CDBE5ACapi_key=27A28A4D4B24022E543E&apn=ctnet&appId=ZHKXS&bookId=${url}&brand=&channelId=zh-zhh5&channelType=H5&clientVersion=7.2.6.11&installId=&model=&modelName=&os=android&osVersion=31&preChannelId=zh-zhh5&screenH=2206&screenW=1080&userId=0082DE6CF1178736AF28EB8065CDBE5AC`)
  let response = POST("https://api1.zongheng.com/api/book/bookInfo",{data:`api_key=27A28A4D4B24022E543E&apn=ctnet&appId=ZHKXS&bookId=${url}&brand=&channelId=zh-zhh5&channelType=H5&clientVersion=7.2.6.11&installId=&model=&modelName=&os=android&osVersion=31&preChannelId=zh-zhh5&screenH=2206&screenW=1080&userId=0&sig=${sig}`})
  let $ = JSON.parse(response).result
  let book = {
    summary: $.description,
    status: $.serialStatus == 0 ? '连载' : '完结',
    category: $.keywords ? $.categoryName + " " + $.keywords.replaceAll(","," ") : $.categoryName,
    words: $.totalWord,
    update: timestampToTime($.updateCptTime),
    lastChapter: $.updateCpt,
    catalog: $.bookId
  }
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let sig = CryptoJS.MD5(`082DE6CF1178736AF28EB8065CDBE5ACapi_key=27A28A4D4B24022E543E&apn=ctnet&appId=ZHKXS&bookId=${url}&brand=&channelId=zh-zhh5&channelType=H5&clientVersion=7.2.6.11&installId=&model=&modelName=&os=android&osVersion=31&preChannelId=zh-zhh5&screenH=2206&screenW=1080&userId=0082DE6CF1178736AF28EB8065CDBE5AC`)
  let response = POST("https://api1.zongheng.com/api/chapter/tomeChapterList",{data:`api_key=27A28A4D4B24022E543E&apn=ctnet&appId=ZHKXS&bookId=${url}&brand=&channelId=zh-zhh5&channelType=H5&clientVersion=7.2.6.11&installId=&model=&modelName=&os=android&osVersion=31&preChannelId=zh-zhh5&screenH=2206&screenW=1080&userId=0&sig=${sig}`})
  let $ = JSON.parse(response)
  let array = []
  $.result.tomeChapters.forEach((volume) => {
    array.push({ name: volume.tome.tomeName })
    volume.chapters.forEach((chapter) => {
      array.push({
        name: chapter.name,
        url: `https://book.zongheng.com/chapter/${url}/${chapter.chapterId}.html`,
        vip: chapter.isVip == 1
      })
    })
  })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
  let response = GET(url)
  let $ = HTML.parse(response)
  //未购买返回403和自动订阅地址
  if ($("#reader-order-box > h4").text() == "抱歉哦，本章节为VIP章节，需要订阅才可以继续阅读哦~") throw JSON.stringify({
    code: 403,
    message: url   
  })
  return $("div.content")
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
  let response = GET("https://home.zongheng.com/account")
  let $ = HTML.parse(response)
    return JSON.stringify({
        basic: [
            {
                name: '账号',
                value: $("p.name").remove("i,b,span").text(),
                url: 'https://home.zongheng.com/account'
            },
            {
                name: '纵横币',
                value: $("p.num > span:nth-child(1) > i:nth-child(1)").text(),
                url: 'https://pay.zongheng.com/',
            },
            {
                name: '月票',
                value: $("p.num > span:nth-child(2) > i:nth-child(1)").text(),
                url: '',
            },
            {
                name: '推荐票',
                value: $("p.num > span:nth-child(3) > i:nth-child(1)").text(),
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
  let response = GET("https://m.zongheng.com/h5/ajax/shelf/list")
  let $ = JSON.parse(response)
  let books = []
  $.shelflist.forEach((book) => {
    books.push({
      name: book.bookName,
      author: book.authorName,
      cover: `https://static.zongheng.com/upload/s_image${book.coverUrl}`,
      detail: book.bookId
    })
  })
  return JSON.stringify({books})
}

var bookSource = JSON.stringify({
  name: "纵横小说",
  url: "zongheng.com",
  version: 104,
  authorization: "https://passport.zongheng.com/",
  cookies: [".zongheng.com"],
})
