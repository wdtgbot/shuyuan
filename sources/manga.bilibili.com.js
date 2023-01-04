const baseUrl = "https://manga.bilibili.com"

//搜索
const search = (key) => {
  let data = JSON.stringify({
    searchWord: key,
    pageNum: 1,
    pageSize: 20,
    bangumiOffset: 0,
    isFilter: false,
    order: -1,
    styleId: -1,
    areaId: -1,
    isFinish: -1,
    isFree: -1
  })
  let response = POST(`${baseUrl}/twirp/comic.v1.Comic/SearchMainComprehensive?version=4.9.5&device=android`,{data})
  let $ = JSON.parse(response).data
  let array = []
  $.comic.list.forEach((child) => {
    array.push({
      name: child.title.replace("<em class=\"keyword\">","").replace("</em>",""),
      author: child.author_name.join(" ").replace("<em class=\"keyword\">","").replace("</em>",""),
      cover: child.vertical_cover,
      detail: child.id
    })
  })
  return JSON.stringify(array)
}

//详情  
const detail = (url) => {
  let data = JSON.stringify({
    comicId: url
  })
  let response = POST(`https://manga.bilibili.com/twirp/comic.v1.Comic/ComicDetail?version=4.9.5&device=android`,{data})
  let $ = JSON.parse(response).data
  let book = {
    summary: $.evaluate,
    status: $.is_finish == 0 ? '连载' : '完结',
    category: $.styles.join(" "),
    catalog: url
  }
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let data = JSON.stringify({
    comicId: url
  })
  let response = POST(`https://manga.bilibili.com/twirp/comic.v1.Comic/ComicDetail?version=4.9.5&device=android`,{data})
  let $ = JSON.parse(response).data
  let array = []
  $.ep_list.reverse().forEach((chapter) => {
    array.push({
      name: chapter.short_title + " " + chapter.title,
      url: `a?bid=${url}&cid=${chapter.id}`,
      vip: chapter.pay_mode == 1
    })   
  })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
  let data = JSON.stringify({
    ep_id: url.query('cid')
  })
  let response = POST(`${baseUrl}/twirp/comic.v1.Comic/GetImageIndex?device=pc&platform=web`,{data})
  let $ = JSON.parse(response)
  //未购买返回403和自动订阅地址
  if ($.msg == "need buy episode") throw JSON.stringify({
    code: 403,
    message: `https://manga.bilibili.com/mc${url.query('bid')}/${url.query('cid')}?ua=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.1054.62 Safari/537.36`
  })
  return $.data.images.map((item)=>{
    let da = JSON.stringify({
    urls: `[\"${item.path}@1100w.webp\"]`
  })
    let res = POST(`${baseUrl}/twirp/comic.v1.Comic/ImageToken?device=pc&platform=web`,{data:da})
    let v = JSON.parse(res)
    let token = v.data[0].token
    return '<img src="https://manga.hdslb.com' + item.path + `@1100w.webp?token=${token}"/>` 
  }).join("\n")
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
  let $ = JSON.parse(POST(`${baseUrl}/twirp/user.v1.User/GetWallet?device=pc&platform=web`,{data:'{}'})).data
  let u = JSON.parse(GET(`https://api.bilibili.com/x/web-interface/nav`)).data
    return JSON.stringify({
        basic: [
            {
                name: '账号',
                value: u.uname,
                url: 'https://manga.bilibili.com/account-center#/account-info'
            },
            {
                name: '漫币',
                value: $.remain_gold,
                url: '',
            },
            {
                name: '漫读券',
                value: $.remain_coupon,
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
  let data = JSON.stringify({
    page_num: page + 1,
    page_size: 15,
    order: 1,
    wait_free: 0
  })
  let response = POST(`${baseUrl}/twirp/bookshelf.v1.Bookshelf/ListFavorite?device=pc&platform=web`,{data})
  let $ = JSON.parse(response)
  let books = $.data.map(book => ({
    name: book.title,
    author: book.comic_id,
    cover: book.vcover,
    detail: book.comic_id
  }))
  return JSON.stringify({
    end: $.data.length == 0,
    books: books
  })
}

//排行榜
const rank = (title, category, page) => {
  let data = JSON.stringify({
    styleId:title,
    areaId:-1,
    isFinish:-1,
    order:0,
    pageNum:page + 1,
    pageSize:39,
    isFree:-1
  })
  let response = POST(`${baseUrl}/twirp/comic.v1.Comic/ClassPage?version=4.9.5&device=android`,{data})
  let $ = JSON.parse(response)
  let books = []
  $.data.forEach((child) => {
    books.push({
      name: child.title,
      author: child.season_id,
      cover: child.vertical_cover,
      detail: child.season_id
    })
  })
  return JSON.stringify({
    end:  $.data.length == 0,
    books: books
  })
}


const ranks = [
    {
        title: {
            key: '999',
            value: '热血'
        }
    },
    {
        title: {
            key: '997',
            value: '古风'
        }
    },
    {
        title: {
            key: '1016',
            value: "玄幻"
        }
    },
    {
        title: {
            key: '998',
            value: '奇幻'
        }
    },
    {
        title: {
            key: '1023',
            value: '悬疑'
        }
    },
    {
        title: {
            key: '1002',
            value: '都市'
        }
    },
    {
        title: {
            key: '1096',
            value: '历史'
        }
    },
    {
        title: {
            key: '1063',
            value: '架空'
        }
    },
    {
        title: {
            key: '1060',
            value: '青春'
        }
    },
    {
        title: {
            key: '1054',
            value: '西幻'
        }
    },
    {
        title: {
            key: '1048',
            value: '现代'
        }
    },
    {
        title: {
            key: '1015',
            value: '科幻'
        }
    },
    {
        title: {
            key: '1028',
            value: '正能量'
        }
    },
    {
        title: {
            key: '1092',
            value: '武侠仙侠'
        }
    },
    {
        title: {
            key: '1088',
            value: '游戏竞技'
        }
    },
    {
        title: {
            key: '1081',
            value: '悬疑灵异'
        }
    }
]

var bookSource = JSON.stringify({
  name: "哔哩哔哩漫画",
  url: "manga.bilibili.com",
  version: 101,
  authorization: "https://passport.bilibili.com/login",
  cookies: [".bilibili.com"],
  ranks:ranks
})
