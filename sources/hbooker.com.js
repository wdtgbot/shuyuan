require('crypto-js')

const decrypt = function (data, key) {
  let iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000')
  key = CryptoJS.SHA256(key ? key : 'zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn')
  let decrypted = CryptoJS.AES.decrypt(data, key, {
    mode: CryptoJS.mode.CBC,
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

const login_token = localStorage.getItem('loginToken')
const account = localStorage.getItem('account')
const app_version = "1.5.581"
const device_token = "shuke_"

const headers = ["user-agent:Android  com.kuangxiang.novel  1.5.581,Xiaomi, Mi 12"]

/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
  let response = POST('https://sk.hbooker.com/bookcity/get_filter_search_book_list',{data:`app_version=${app_version}&count=30&device_token=${device_token}&login_token=${login_token}&key=${key}&account=${account}`,headers})
  let $ = JSON.parse(decrypt(response)).data
  let array = []
  $.book_list.forEach((child) => {
    array.push({
      name: child.book_name,
      author: child.author_name,
      cover: child.cover,
      detail: child.book_id,
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
  let response = POST('https://sk.hbooker.com/book/get_info_by_id',{data:`app_version=${app_version}&device_token=${device_token}&book_id=${url}&login_token=${login_token}&account=${account}`,headers})
  let $ = JSON.parse(decrypt(response)).data.book_info
  let book = {
    summary: $.description,
    status: $.up_status == '1' ? '完结' : '连载',
    category: $.tag.replaceAll(","," "),
    words: $.total_word_count,
    update: $.uptime,
    lastChapter: $.last_chapter_info.chapter_title,
    catalog: $.book_id,
  }
  return JSON.stringify(book)
}

/**
 * 目录
 * @params {string} url
 * @returns {[{name, url, vip}]}
 */
const catalog = (url) => {
  let dres = JSON.parse(decrypt(POST('https://sk.hbooker.com/book/get_division_list',{data:`app_version=${app_version}&device_token=${device_token}&login_token=${login_token}&book_id=${url}&account=${account}`,headers}))).data
  let dlist = dres.division_list
  let array = []
  dlist.forEach((d) => {
    array.push({
      name: d.division_name,
    })
    let response = POST('https://sk.hbooker.com/chapter/get_updated_chapter_by_division_id',{data:`app_version=${app_version}&device_token=${device_token}&division_id=${d.division_id}&login_token=${login_token}&account=${account}`,headers})
    let $ = JSON.parse(decrypt(response)).data.chapter_list
    //过滤未审核章节
    let result = $.filter(function(item) {
      return item.is_valid == 1
    });
    result.forEach((chapter) => {
      array.push({
        name: chapter.chapter_title,
        url: chapter.chapter_id,
        vip: chapter.is_paid == 1
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
  let kres = JSON.parse(decrypt(POST(`https://sk.hbooker.com/chapter/get_chapter_cmd`,{data:`app_version=${app_version}&device_token=${device_token}&chapter_id=${url}&login_token=${login_token}&account=${account}`,headers})))
  let key = kres.data.command
  let response = POST(`https://sk.hbooker.com/chapter/get_cpt_ifm`,{data:`chapter_command=${key}&app_version=${app_version}&device_token=${device_token}&chapter_id=${url}&login_token=${login_token}&account=${account}`,headers})
  let $ = JSON.parse(decrypt(response)).data
  let txt = $.chapter_info.txt_content
  txt = decrypt(txt, key)
  txt = txt.trim()
  ps = $.chapter_info.author_say
  //未购买返回 403 和自动订阅地址
  if ($.chapter_info.auth_access == 0) throw JSON.stringify({
    code: 403,
    message: `https://wap.ciweimao.com/chapter/${url}`
  })
  return txt + "\r\n" + ps
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
  let response = POST('https://sk.hbooker.com/reader/get_my_info',{data:`app_version=${app_version}&device_token=${device_token}&login_token=${login_token}&account=${account}`,headers})
  let $ = JSON.parse(decrypt(response)).data
  return JSON.stringify({
    basic: [{
      name: '账号',
      value: $.reader_info.reader_name,
    },
    {
      name: '猫饼干',
      value: $.prop_info.rest_hlb-$.prop_info.rest_gift_hlb,
      url: 'https://wap.ciweimao.com/recharge/index',
    },
    {
      name: '代币',
      value: $.prop_info.rest_gift_hlb,
      url: 'https://wap.ciweimao.com/recharge/index',
    },
    {
      name: '推荐票',
      value: $.prop_info.rest_recommend,
    },
    {
      name: '月票',
      value: $.prop_info.rest_yp,
    },
    {
      name: '刀片',
      value: $.prop_info.rest_total_blade,
    },
    ],
    extra: [{
      name: '自动签到',
      type: 'permission',
      method: 'sign',
      times: 'day',
    },
    {
      name: '书架',
      type: 'books',
      method: 'bookshelf'
    }
    ],
  })
}

//书架
const bookshelf = () => {
  let shelves = JSON.parse(decrypt(POST('https://sk.hbooker.com/bookshelf/get_shelf_list',{data:`app_version=${app_version}&device_token=${device_token}&login_token=${login_token}&account=${account}`,headers}))).data
  let books = []
  shelves.shelf_list.forEach((shelf) => {
    let response = POST('https://sk.hbooker.com/bookshelf/get_shelf_book_list_new',{data:`app_version=${app_version}&device_token=${device_token}&count=99999&shelf_id=${shelf.shelf_id}&page=0&login_token=${login_token}&account=${account}&order=last_read_time`,headers})
    let $ = JSON.parse(decrypt(response)).data
    $.book_list.forEach((book) => {
      books.push({
        name: book.book_info.book_name,
        author: book.book_info.author_name,
        cover: book.book_info.cover,
        detail: book.book_info.book_id
      })
    })
  })
  return JSON.stringify({books})
}

const sign = () => {
  let response = POST('https://sk.hbooker.com/task/get_sign_record',{data:`app_version=${app_version}&device_token=${device_token}&login_token=${login_token}&account=${account}`,headers})
  let $ = JSON.parse(decrypt(response)).data
  let d = new Date()
  let date =
    d.getFullYear() +
    '-' +
    (d.getMonth() + 1).toString().padStart(2, '0') +
    '-' +
    d.getDate().toString().padStart(2, '0')
  let robj = $.sign_record_list.find((r) => r.date == date)
  if (robj.is_signed != '0') return true
  POST('https://sk.hbooker.com/reader/get_task_bonus_with_sign_recommend',{data:`app_version=${app_version}&device_token=${device_token}&task_type=1&login_token=${login_token}&account=${account}`,headers})
  return true
}

const ranks = [
  {
  title: {
    key: 'no_vip_click',
    value: '点击榜',
  },
  categories: [{
    key: 'week',
    value: '周榜'
  },
  {
    key: 'month',
    value: '月榜'
  },
  ],
},
{
  title: {
    key: 'fans_value',
    value: '畅销榜',
  },
  categories: [{
    key: 'week',
    value: '24 时'
  },
  {
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'yp',
    value: '月票榜',
  },
  categories: [{
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'yp_new',
    value: '新书榜',
  },
},
{
  title: {
    key: 'favor',
    value: '收藏榜',
  },
  categories: [{
    key: 'week',
    value: '三日'
  },
  {
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'recommend',
    value: '推荐榜',
  },
  categories: [{
    key: 'week',
    value: '周榜'
  },
  {
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'blade',
    value: '刀片榜',
  },
  categories: [{
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'word_count',
    value: '更新榜',
  },
  categories: [{
    key: 'week',
    value: '周榜'
  },
  {
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'tsukkomi',
    value: '吐槽榜',
  },
  categories: [{
    key: 'week',
    value: '周榜'
  },
  {
    key: 'month',
    value: '月榜'
  },
  {
    value: '总榜',
    key: 'total'
  },
  ],
},
{
  title: {
    key: 'complet',
    value: '完本榜',
  },
  categories: [{
    key: 'month',
    value: '月榜'
  }],
},
{
  title: {
    key: 'track_read',
    value: '追读榜',
  },
  categories: [{
    key: 'week',
    value: '三日'
  }],
},
]

const rank = (title, category, page) => {
  let array = []
  let response = POST('https://sk.hbooker.com/bookcity/get_rank_book_list',{data:`time_type=${category}&app_version=${app_version}&device_token=${device_token}&count=20&page=${page}&login_token=${login_token}&category_index=0&account=${account}&order=${title}`,headers})
  let $ = JSON.parse(decrypt(response))
  $.data.book_list.forEach((r) => {
    array.push({
      name: r.book_name,
      author: r.author_name,
      cover: r.cover,
      detail: r.book_id
    })
  })
  return JSON.stringify({
    end: $.data.book_list.length == 0,
    books: array
  })
}

const login = (args) => {
  if (!args) return '参数不能为空'
  let response = POST('https://sk.hbooker.com/signup/login', {data:`login_name=${args[0]}&app_version=${app_version}&passwd=${args[1]}&device_token=${device_token}&login_token=&account=`,headers})
  let $ = JSON.parse(decrypt(response))
  if ($.tip) return $.tip
  let loginToken = $.data.login_token
  let account = $.data.reader_info.account
  localStorage.setItem('loginToken', loginToken)
  localStorage.setItem('account', account)
}

var bookSource = JSON.stringify({
  name: '刺猬猫阅读',
  url: 'hbooker.com',
  version: 112,
  authorization: JSON.stringify(['account', 'password']),
  cookies: ['.hbooker.com'],
  ranks: ranks
})
