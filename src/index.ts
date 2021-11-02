/** @format */

import fs from 'fs'
import puppeteer from 'puppeteer'
import request from 'request'
import xlsx from 'node-xlsx'
import { timeout } from './utils'

const list = xlsx.parse('./123.xlsx')
// console.log(list[0])
const sheet1Data = list[0].data

// const urls = ['https://item.jd.com/100016685050.html', 'https://item.jd.com/100016312728.html']

const urls: any = []
sheet1Data.forEach((item: any) => {
  if (item[0].indexOf('https') > -1) {
    urls.push(item[0])
  }
})
console.log(urls)


async function main() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    devtools: true,
    headless: false, // 有浏览器界面启动
    slowMo: 100, // 放慢浏览器执行速度，方便测试观察
  })
  const page = await browser.newPage()

  for (let index = 0; index < urls.length; index++) {
    const pageUrl = urls[index]
    await page.goto(pageUrl, {
      waitUntil: 'networkidle2', // 等待网络空闲时，在跳转加载页面
    })
    await timeout(1)

    const result = await page.evaluate(() => {
      const res = []
      const specImg = document.querySelector('#spec-img') as HTMLImageElement
      console.log(specImg.src)
      res.push(specImg.src)
      return res
    })

    result.forEach((item) => {
      writeImage(item, pageUrl)
    })

    console.log(result)
  }
}

function writeImage(url: string, pageUrl: string) {
  const pageUrlMatch = pageUrl.match(/com\/(.*)\.html/)
  const goodsId = pageUrlMatch && pageUrlMatch[1] || 'test'
  const writeStream = fs.createWriteStream(`./images/${goodsId}${url.slice(url.lastIndexOf('.'))}`)
  const readStream = request(url)

  readStream.pipe(writeStream)
  readStream.on('end', () => {
    console.log('下载成功')
  })
  readStream.on('error', (error: any) => {
    console.log(error)
  })
  writeStream.on('finish', () => {
    console.log('文件写入成功')
    writeStream.end()
  })
}

main()
