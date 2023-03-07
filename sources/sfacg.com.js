require('crypto-js')

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
}

let nonce = uuid().toUpperCase()
let timestamp = Math.round(new Date())
let devicetoken = "173fac4e-b7a5-366f-bc35-9899b7afd6f3"
let sign = CryptoJS.MD5(nonce + timestamp + devicetoken.toUpperCase() + "FMLxgOdsfxmN!Dt4").toString().toUpperCase()

const headers = ["authorization:Basic YW5kcm9pZHVzZXI6MWEjJDUxLXl0Njk7KkFjdkBxeHE=", "accept:application/vnd.sfacg.api+json;version=1", `user-agent:boluobao/4.9.42(android;32)/XIAOMI/${devicetoken}/XIAOMI`, `sfsecurity:nonce=${nonce}&timestamp=${timestamp}&devicetoken=${devicetoken.toUpperCase()}&sign=${sign}`]

//搜索
const search = (key) => {
    let response = GET(`https://api.sfacg.com/search/novels/result/new?q=${key}&expand=novels,comics,albums,chatnovelstags,typeName,authorName,intro,latestchaptitle,latestchapintro,tags,sysTags&sort=hot&page=0&size=12&systagids=&isFinish=-1&updateDays=-1`, {
        headers
    })
    let $ = JSON.parse(response)
    let array = []
    $.data.novels.forEach((child) => {
        array.push({
            name: child.novelName,
            author: child.authorName,
            cover: child.novelCover,
            detail: child.novelId,
        })
    })
    return JSON.stringify(array)
}

//详情
const detail = (url) => {
    let response = GET(`https://api.sfacg.com/novels/${url}?expand=chapterCount,bigBgBanner,bigNovelCover,typeName,intro,fav,ticket,pointCount,tags,sysTags,signlevel,discount,discountExpireDate,totalNeedFireMoney,rankinglist,originTotalNeedFireMoney,firstchapter,latestchapter,latestcommentdate,essaytag,auditCover,preOrderInfo,customTag,topic,unauditedCustomtag,homeFlag,isbranch,essayawards`, {
        headers
    })
    let $ = JSON.parse(response).data
    let book = {
        summary: $.expand.intro,
        status: $.isFinish == false ? '连载' : '完结',
        category: $.expand.sysTags.map((item) => {
            return item.tagName
        }).join(" ") || $.expand.typeName,
        words: $.charCount,
        update: $.lastUpdateTime.replace("T", " "),
        lastChapter: $.expand.latestChapter.title,
        catalog: $.novelId
    }
    return JSON.stringify(book)
}

//目录
const catalog = (url) => {
    let response = GET(`https://api.sfacg.com/novels/${url}/dirs?expand=originNeedFireMoney`, {
        headers
    })
    let $ = JSON.parse(response)
    let array = []
    $.data.volumeList.forEach((booklet) => {
        array.push({
            name: booklet.title
        })
        booklet.chapterList.forEach((chapter) => {
            array.push({
                name: chapter.title,
                url: chapter.chapId,
                vip: chapter.isVip == true
            })
        })
    })
    return JSON.stringify(array)
}

//章节
const chapter = (url) => {
    let response = GET(`https://api.sfacg.com/Chaps/${url}?expand=content,needFireMoney,originNeedFireMoney,tsukkomi,chatlines,isbranch&autoOrder=true`, {
        headers
    })
    let $ = JSON.parse(response)
    //未购买返回403和自动订阅地址
    if ($.status.msg == "请支持作者的辛勤写作,VIP章节必须登录后才可阅读" || $.status.msg == "请支持作者的辛勤写作,VIP章节必须购买后才可阅读") throw JSON.stringify({
        code: 403,
        message: `https://m.sfacg.com/c/${$.data.chapId}/`
    })
    return $.data.expand.content.trim().replace(/\[img.*?\]/g, '<img src="').replace(/\[.*img\]/g, '"/>')
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
    let response = GET(`https://api.sfacg.com/user?expand=vipInfo,welfareCoin,isRealNameAuth,realnameinfo,changeNickNameInfo,welfareMoney,redpacketCode,useWelfaresys,usedRedpacketCode,hasOrderChapWithFireMoney,hasUnlockChapWithAd,hasActiveUnlockChapWithAd,hasOrderedVipChaps,hasPaidFirstTime,growup,newVip`, {
        headers
    })
    let response2 = GET(`https://api.sfacg.com/user/money`, {
        headers
    })
    let $ = JSON.parse(response).data
    let a = JSON.parse(response2).data
    return JSON.stringify({
        basic: [{
                name: "账号",
                value: $.nickName,
                url: "https://m.sfacg.com/my/"
            },
            {
                name: "火券",
                value: a.fireMoneyRemain,
                url: "https://m.sfacg.com/pay/"
            },
            {
                name: "代券",
                value: a.couponsRemain,
                url: "https://m.sfacg.com/pay/"
            }
        ],
        extra: [{
            name: "书架",
            type: "books",
            method: "bookshelf"
        }]
    })
}

/**
 * 我的书架
 * @param {页码} page 
 */
const bookshelf = (page) => {
    let response = GET(`https://api.sfacg.com/user/Pockets?expand=novels,albums,comics,discount,discountExpireDate`, {
        headers
    })
    let a = JSON.parse(response).data
    let aa = a.filter(item => {
        return item.typeId === 2
    })
    let aaa = []
    aa.forEach((book) => {
        aaa.push(book.expand.novels)
    })
    let ab = [].concat.apply([], aaa)
    let $ = ab.filter(item => {
        return item.categoryId == 0
    })
    let books = []
    $.forEach((book) => {
        books.push({
            name: book.novelName,
            author: book.authorName,
            cover: book.novelCover,
            detail: book.novelId,
        })
    })
    return JSON.stringify({
        books
    })
}

//排行榜
const rank = (title, category, page) => {
    let response = GET(`https://api.sfacg.com/novels/${title}/sysTags/novels?expand=typeName,sysTags,intro,discount,discountExpireDate&updatedays=-1&size=20&isfree=both&charcountbegin=0&systagids=&sort=latest&page=${page}&isfinish=both&charcountend=0`, {
        headers
    })
    let a = JSON.parse(response)
    let $ = a.data.filter(item => {
        return item.categoryId == 0
    })
    let books = []
    $.forEach((child) => {
        books.push({
            name: child.novelName,
            author: child.authorName,
            cover: child.novelCover,
            detail: child.novelId,
        })
    })
    return JSON.stringify({
        end: a.data.length === 0,
        books: books
    })
}


const ranks = [{
        title: {
            key: '21',
            value: '魔幻'
        }
    },
    {
        title: {
            key: '22',
            value: '玄幻'
        }
    },
    {
        title: {
            key: '23',
            value: '古风'
        }
    },
    {
        title: {
            key: '24',
            value: '科幻'
        }
    },
    {
        title: {
            key: '25',
            value: '校园'
        }
    },
    {
        title: {
            key: '26',
            value: '都市'
        }
    },
    {
        title: {
            key: '27',
            value: '游戏'
        }
    },
    {
        title: {
            key: '29',
            value: '悬疑'
        }
    }
]

const login = (args) => {
    if (!args) return "账号或者密码不能为空"
    let data = JSON.stringify({
        password: args[1],
        shuMeiId: "",
        username: args[0]
    })
    let response = POST(`https://api.sfacg.com/sessions`, {
        data,
        headers
    })
    let $ = JSON.parse(response)
    if ($.status.httpCode != 200) return $.status.msg
}

var bookSource = JSON.stringify({
    name: "SF",
    url: "sfacg.com",
    version: 112,
    authorization: JSON.stringify(['account', 'password']),
    cookies: [".sfacg.com"],
    ranks: ranks
})