//搜索
const search = (key) => {
  let response = POST(`https://api.midukanshu.com/fiction/search/search`,{data:`keyword=${key}`})
  let array = []
  let $ = JSON.parse(response)
  $.data.forEach((child) => {
    array.push({
      name: child.title,
      author: child.author,
      cover: child.cover,
      detail: child.book_id,
    })
  })
  return JSON.stringify(array)
}

//详情
const detail = (url) => {
  let response = POST(`https://api.midukanshu.com/fiction/book/getDetail`,{data:`book_id=${url}`})
  let $ = JSON.parse(response).data
  let book = {
    summary: $.description,
    status: $.updateStatus == "完结" ? "完结" : "连载",
    category: $.tags.map((item)=>{ return item.name}).join(" ") || $.category,
    words: $.word_count,
    update: $.updateStatus.replace("更新于",""),
    catalog: `https://book.midureader.com/book/chapter_list/100/${$.book_id}.txt`
  }
  return JSON.stringify(book)
}

//目录
const catalog = (url) => {
  let response = GET(url)
  let $ = JSON.parse(response)
  let array = []
  $.forEach(chapter => {
    array.push({
      name: chapter.title,
      url: `https://book.midureader.com/book/chapter/master/${chapter.bookId}_${chapter.chapterId}.txt`
    })
  })
  return JSON.stringify(array)
}

//章节
const chapter = (url) => {
  let response = GET(url)
  return response.trim()
}

var bookSource = JSON.stringify({
  name: "米读小说",
  url: "midukanshu.com",
  version: 101
})
