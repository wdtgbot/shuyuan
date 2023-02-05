/**
 * 搜索
 * @params {string} key
 * @returns {[{name, author, cover, detail}]}
 */
const search = (key) => {
    let response = GET(`https://masiro.me/admin/loadMoreNovels?page=1&keyword=${key}`)
    let $ = HTML.parse(JSON.parse(response).html)
    let array = []
    $(".layui-card").forEach((child) => {
        let $ = HTML.parse(child)
        array.push({
            name: $(".layui-card-header").text(),
            author: $(".author").text().replace("作者: ", ""),
            cover: `https://masiro.me${$(".n-img").attr("lay-src")}`,
            detail: `https://masiro.me${$("a").attr("href")}`
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
    let response = GET(url)
    let $ = HTML.parse(response)
    let book = {
        summary: $(".brief").text().replace("简介：", ""),
        status: $(".n-status").text().replace("状态 : ", ""),
        category: $(".tags").text().replace("标签 : ", ""),
        words: $(".n-chapters").text().replace("字数 : ", "").replace(/字共.+话/, ""),
        update: $(".s-font").text(),
        lastChapter: $(".nw-a").text(),
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
    let response = GET(url)
    let $ = HTML.parse(response)
    let array = []
    $(".chapter-ul > li").forEach((booklet) => {
        let $ = HTML.parse(booklet)
        if ($(".chapter-box").text()) array.push({
            name: $(".chapter-box").attr("id")
        })
        $("ul > a").forEach((chapter) => {
            let $ = HTML.parse(chapter)
            array.push({
                name: $(".episode-box > span:nth-child(1)").text(),
                url: `https://masiro.me${$("a").attr("href")}`
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
    let response = GET(url)
    let $ = HTML.parse(response)
    return $(".nvl-content")
}

/**
 * 个人
 * @returns {[{url, nickname, recharge, balance[{name, coin}], sign}]}
 */
const profile = () => {
    let response = GET("https://masiro.me/admin/userCenterShow")
    let $ = HTML.parse(response)
    return JSON.stringify({
        basic: [{
            name: "账号",
            value: $(".user-name-info").text(),
            url: "https://masiro.me/admin/userCenterShow"
        }],
        extra: [{
            name: "书架",
            type: "books",
            method: "bookshelf"
        }]
    })
}

/**
 * 我的书架
 * @param {string} page
 * @returns {[{name, author, cover, detail}]}
 */
const bookshelf = (page) => {
    let response = GET(`https://masiro.me/admin/loadMoreNovels?page=${page + 1}&collection=1`)
    let res = JSON.parse(response)
    let $ = HTML.parse(res.html)
    let books = []
    $(".layui-card").forEach((child) => {
        let $ = HTML.parse(child)
        books.push({
            name: $(".layui-card-header").text(),
            author: $(".author").text().replace("作者: ", ""),
            cover: `https://masiro.me${$(".n-img").attr("lay-src")}`,
            detail: `https://masiro.me${$("a").attr("href")}`
        })
    })
    return JSON.stringify({
        end: res.page == res.pages,
        books: books
    })
}

var bookSource = JSON.stringify({
    name: "真白萌",
    url: "masiro.me",
    version: 100,
    authorization: "https://masiro.me/admin/auth/login",
    cookies: [".masiro.me"]
})
