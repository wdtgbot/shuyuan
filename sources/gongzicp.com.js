require('crypto-js')

let token = localStorage.getItem("token")
let imei = localStorage.getItem("imei")

function rand_str() {
    let len = 16
    let text = ""
    let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length))
    return text
}

function gettoken() {
    let randStr = Math.round(new Date() / 1000)
    let requestKey = CryptoJS.SHA256(`${randStr}android_020501fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√`).toString().slice(10, 42)
    let headers = ["referer:https://www.gongzicp.com", `requestKey:${requestKey}`, `randStr:${randStr}`, "client:android", `imei:${imei}`, "version:android_020501", "token:", "User-Agent:chang pei yue du/2.5.1 (Android 13; Mi 12; Xiaomi)"]
    let response = GET("https://api1.gongzicp.com/common/getToken", {
        headers
    })
    let $ = JSON.parse(response)
    return $.data.token
}

/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
    let timestamp = Math.round(new Date() / 1000)
    let nonce = timestamp + (Math.floor(Math.random() * 9000000) + 1000000).toString()
    let requestKey = CryptoJS.SHA256(`collEnd=0&collStart=0&finishType=0&keyword=${encodeURIComponent(key)}&novelSell=0&novelType=0&page=1&sortType=1&wordType=0${timestamp}${nonce}${imei}android_020501fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√${token}`).toString().slice(10, 42)
    let headers = ["referer:https://www.gongzicp.com", `requestKey:${requestKey}`, "client:android", `imei:${imei}`, `nonce:${nonce}`, "version:android_020501", `timestamp:${timestamp}`, `token:${token}`, "User-Agent:chang pei yue du/2.5.1 (Android 13; Mi 12; Xiaomi)"]
    let response = GET(`https://api1.gongzicp.com/v3/search/novels?novelSell=0&wordType=0&sortType=1&collEnd=0&novelType=0&page=1&collStart=0&keyword=${encodeURIComponent(key)}&finishType=0`, {
        headers
    })
    let $ = JSON.parse(response)
    let array = []
    $.data.list.forEach((child) => {
        array.push({
            name: child.novel_name,
            author: child.novel_author,
            cover: child.novel_cover,
            detail: child.novel_id
        })
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let timestamp = Math.round(new Date() / 1000)
    let nonce = timestamp + (Math.floor(Math.random() * 9000000) + 1000000).toString()
    let requestKey = CryptoJS.SHA256(`id=${url}${timestamp}${nonce}${imei}android_020501fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√${token}`).toString().slice(10, 42)
    let headers = ["referer:https://www.gongzicp.com", `requestKey:${requestKey}`, "client:android", `imei:${imei}`, `nonce:${nonce}`, "version:android_020501", `timestamp:${timestamp}`, `token:${token}`, "User-Agent:chang pei yue du/2.5.1 (Android 13; Mi 12; Xiaomi)"]
    let response = GET(`https://api1.gongzicp.com/v3/novel/detail?id=${url}`, {
        headers
    })
    let $ = JSON.parse(response).data
    let book = {
        summary: $.novel_info,
        status: $.novel_process,
        category: $.type_names.replaceAll(",", " "),
        words: $.novel_wordnumber,
        update: $.novel_uptime,
        lastChapter: $.novel_newcname,
        catalog: $.novel_id
    }
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let randStr = Math.round(new Date() / 1000)
    let requestKey = CryptoJS.SHA256(`nid=${url}&order=1${randStr}android_020501fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√${token}`).toString().slice(10, 42)
    let headers = ["referer:https://www.gongzicp.com", `requestKey:${requestKey}`, `randStr:${randStr}`, "client:android", `imei:${imei}`, "version:android_020501", `token:${token}`, "User-Agent:chang pei yue du/2.5.1 (Android 13; Mi 12; Xiaomi)"]
    let response = GET(`https://api1.gongzicp.com/apiv2/novel/getNovelDetailChapterList?nid=${url}&order=1`, {
        headers
    })
    let $ = JSON.parse(response)
    let array = []
    let volume = []
    $.data.forEach((chapter) => {
        if (JSON.stringify(volume).indexOf(chapter.chapter_volume_name) == -1) {
            array.push({
                name: chapter.chapter_volume_name
            })
            volume.push(chapter.chapter_volume_name)
        }
        array.push({
            name: chapter.chapter_name,
            url: `a?bid=${url}&cid=${chapter.chapter_id}`,
            vip: chapter.chapter_ispay == 1
        })
    })
    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let randStr = Math.round(new Date() / 1000)
    let requestKey = CryptoJS.SHA256(`chapter_ids=${url.query("cid")}&nid=${url.query("bid")}${randStr}android_020501fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√${token}`).toString().slice(10, 42)
    let headers = ["referer:https://www.gongzicp.com", `requestKey:${requestKey}`, `randStr:${randStr}`, "client:android", `imei:${imei}`, "version:android_020501", `token:${token}`, "User-Agent:chang pei yue du/2.5.1 (Android 13; Mi 12; Xiaomi)"]
    let response = GET(`https://api1.gongzicp.com/apiv2/novel/getNovelChapterContents?nid=${url.query("bid")}&chapter_ids=${url.query("cid")}`, {
        headers
    })
    let $ = JSON.parse(response)
    //未购买返回403和自动订阅地址
    if ($.data[url.query("cid")].chapter_ispay === 1) throw JSON.stringify({
        code: 403,
        message: `https://www.gongzicp.com/read-${url.query("cid")}.html`
    })
    return $.data[url.query("cid")].content.trim()
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
    let randStr = Math.round(new Date() / 1000)
    let requestKey = CryptoJS.SHA256(`${randStr}android_020501fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√${token}`).toString().slice(10, 42)
    let headers = ["referer:https://www.gongzicp.com", `requestKey:${requestKey}`, `randStr:${randStr}`, "client:android", `imei:${imei}`, "version:android_020501", `token:${token}`, "User-Agent:chang pei yue du/2.5.1 (Android 13; Mi 12; Xiaomi)"]
    let response = GET("https://api1.gongzicp.com/apiv2/user/getUserInfo", {
        headers
    })
    let $ = JSON.parse(response).data
    return JSON.stringify({
        basic: [{
                name: '账号',
                value: $.nick_name,
                url: 'https://www.gongzicp.com/user/home'
            },
            {
                name: '玉佩',
                value: $.gold,
                url: 'https://www.gongzicp.com/user/charge',
            },
            {
                name: '海星',
                value: $.rec_ticket,
                url: 'https://www.gongzicp.com/user/charge',
            }
        ]
    })
}

//排行榜
const rank = (title, category, page) => {
    let randStr = Math.round(new Date() / 1000)
    let requestKey = CryptoJS.SHA256(`date_type=${category}&novel_type_id=0&page=${page+1}&ranking_type_id=${title}${randStr}android_020501fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√${token}`).toString().slice(10, 42)
    let headers = ["referer:https://www.gongzicp.com", `requestKey:${requestKey}`, `randStr:${randStr}`, "client:android", `imei:${imei}`, "version:android_020501", `token:${token}`, "User-Agent:chang pei yue du/2.5.1 (Android 13; Mi 12; Xiaomi)"]
    let response = GET(`https://api1.gongzicp.com/apiv2/novel/ranking?novel_type_id=0&ranking_type_id=${title}&date_type=${category}&page=${page + 1}`, {
        headers
    })
    let $ = JSON.parse(response)
    let books = []
    $.data.forEach((child) => {
        books.push({
            name: child.novel_name,
            author: child.novel_author,
            cover: child.novel_cover,
            detail: child.novel_id,
        })
    })
    return JSON.stringify({
        end: $.data.length === 0,
        books: books
    })
}


const ranks = [{
        title: {
            key: '1',
            value: '畅销榜'
        },
        categories: [{
                key: "1",
                value: "昨日"
            },
            {
                key: "2",
                value: "7天"
            },
            {
                key: "3",
                value: "30天"
            }
        ]
    },
    {
        title: {
            key: '2',
            value: '上架榜'
        },
        categories: [{
                key: "1",
                value: "昨日"
            },
            {
                key: "2",
                value: "7天"
            }
        ]
    },
    {
        title: {
            key: '3',
            value: '人气榜'
        },
        categories: [{
                key: "2",
                value: "7天"
            },
            {
                key: "3",
                value: "30天"
            }
        ]
    },
    {
        title: {
            key: '5',
            value: '完结榜'
        },
        categories: [{
                key: "5",
                value: "本月"
            },
            {
                key: "6",
                value: "本季"
            },
            {
                key: "7",
                value: "本年"
            }
        ]
    },
    {
        title: {
            key: '6',
            value: '风云榜'
        },
        categories: [{
                key: "2",
                value: "7天"
            },
            {
                key: "3",
                value: "30天"
            },
            {
                key: "8",
                value: "总榜"
            }
        ]
    },
    {
        title: {
            key: '16',
            value: '新锐榜'
        },
        categories: [{
                key: "81",
                value: "新人"
            },
            {
                key: "82",
                value: "热读"
            }
        ]
    },
    {
        title: {
            key: '7',
            value: '新书榜'
        },
        categories: [{
                key: "1",
                value: "昨日"
            },
            {
                key: "2",
                value: "7天"
            }
        ]
    },
    {
        title: {
            key: '9',
            value: '萌新榜'
        },
        categories: [{
                key: "1",
                value: "昨日"
            },
            {
                key: "2",
                value: "7天"
            }
        ]
    },
    {
        title: {
            key: '10',
            value: '赞赏榜'
        },
        categories: [{
                key: "4",
                value: "本周"
            },
            {
                key: "5",
                value: "本月"
            },
            {
                key: "8",
                value: "总榜"
            }
        ]
    }
]

const login = (args) => {
    localStorage.setItem("imei", rand_str())
    if (!args[1]) {
        localStorage.setItem("token", gettoken())
        return "以游客身份登录"
    } else {
        let data = JSON.stringify({
            password: args[1],
            ncode: "86",
            username: args[0]
        })
        let randStr = Math.round(new Date() / 1000)
        let requestKey = CryptoJS.SHA256(`${data}${randStr}android_020501fss≤Â˜ı≥fhggh*&^%^ÇÏÍÎÍADΩ≈Ç≈√${token}`).toString().slice(10, 42)
        let headers = ["referer:https://www.gongzicp.com", `requestKey:${requestKey}`, `randStr:${randStr}`, "client:android", `imei:${imei}`, "version:android_020501", `token:${token}`, "User-Agent:chang pei yue du/2.5.1 (Android 13; Mi 12; Xiaomi)"]
        let response = POST("https://api1.gongzicp.com/apiv2/login/userLogin", {
            data,
            headers
        })
        let $ = JSON.parse(response)
        if ($.code === -1) return "请先只输入账号登录，进行游客登录"
        if ($.code != 1) return $.msg
        localStorage.setItem("token", $.data.token)
    }
}

var bookSource = JSON.stringify({
    name: "长佩阅读",
    url: "gongzicp.com",
    version: 103,
    authorization: JSON.stringify(['account', 'password']),
    cookies: [".gongzicp.com"],
    ranks: ranks
})
