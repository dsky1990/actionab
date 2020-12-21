// require package
const Crawler = require("crawler");
const request = require('https');
const axios = require('axios')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('data/pc_mc.json')
const db = low(adapter)

// 判断方向是否一致
function checkType(type) {
  return type.includes('多') 
}

//code
const crawlerContruct = new Crawler({
  maxConnections : 10,
  rateLimit: 1000*60,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36',
  // This will be called for each crawled page
  callback : function (error, res, done) {
    if(error){
        console.error('Crawler: ', error);
    }
    // var $ = res.$;
    done();
  }
});

const coins = ['BTC', 'ETH']

coins.forEach(coin => {
  crawlerContruct.queue([{
    uri: `https://www.abuquant.com/report/abu_context/output_coin_day_ln/report/${coin}/pc_mc.html`,
    // The global callback won't be called
    callback: function (error, res, done) {
      if(error){
        console.error(error);
      }else{
        request.get(`https://api.hoolgd.com/open/v1/trade/market?symbol=${coin}-USDT`, resp => {
          resp.on('data', d => {
            const data = JSON.parse(d)
            if(data.code == 0) { // success
              const price = data.data[0].price
              console.log(`${coin} price:`, price)
              const $ = res.$
              const date = new Date().toISOString().substr(0, 10) + ' ' + new Date().toTimeString().substr(0, 8)
              const time = new Date().getTime()
              $(".layui-table").find('tbody').children('tr').map((inde, ele) => {
                const tdArray = $(ele).find('td').get()
                const type = $(tdArray[3]).find('font').text()
                if(type && type != '中性') {
                  const lable = $(tdArray[0]).text()
                  console.log(`${coin}:`, lable, '->', type)
                  const coinData = db.get(`${coin}.latest.${lable}`).value()
                  if(coinData) {
                    if(checkType(coinData.type) != checkType(type)) { // 方向变化
                      db.set(`${coin}.latest.${lable}`, {
                        date,
                        time,
                        price,
                        type
                      }).write()
                      let isRight = true
                      if(checkType(coinData.type)) {
                        if(price < coinData.price) {
                          isRight = false
                        }
                      } else {
                        if(price > coinData.price) {
                          isRight = false
                        }
                      }
                      let earn = 0
                      if(checkType(coinData.type)) { // 之前是开多
                        earn = price - coinData.price
                      } else { // 之前是开空
                        earn = coinData.price - price 
                      }
                      db.get(`${coin}.data.${lable}`).push({
                        openPrice: coinData.price,
                        openType: coinData.type,
                        openTime: coinData.time,
                        openDate: coinData.date,
                        closePrice: price,
                        closeType: type,
                        closeTime: time,
                        closeDate: date,
                        isRight,
                        earn
                      }).write()
                      const money = db.get(`${coin}.money.${lable}`).value()
                      db.set(`${coin}.money.${lable}`, Number(earn) + Number(money)).write()
                      const desp = `【开单时间】：${coinData.date}\n【开单价格】：${coinData.price}\n【开单方向】：${coinData.type}\n【平仓时间】：${date}\n【平仓价格】：${price}\n【本单预测】：${isRight?'成功':'失败'}\n【本单盈利】：${earn}`.replace(/[\n\r]/g, '\n\n')
                      axios({
                        method: 'post',
                        url: 'https://sc.ftqq.com/SCU102219Td0de373942dc1dab1e83c321ebf73a4a5eed8ad5df9fe.send',
                        headers: {
                          'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: `text=${coin}|${lable}|平仓&desp=${desp}`
                      }).catch(err => {
                        console.log(err)
                      });
                    }
                  } else { // 初始化数据
                    db.set(`${coin}.data.${lable}`, []).write()
                    db.set(`${coin}.money.${lable}`, 0).write()
                    db.set(`${coin}.latest.${lable}`, {
                      date,
                      time,
                      price,
                      type
                    }).write()
                    const desp = `【开单时间】：${date}\n【开单价格】：${price}\n【开单方向】：${type}`.replace(/[\n\r]/g, '\n\n')
                    axios({
                      method: 'post',
                      url: 'https://sc.ftqq.com/SCU102219Td0de373942dc1dab1e83c321ebf73a4a5eed8ad5df9fe.send',
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                      },
                      data: `text=${coin}|${lable}|${type}&desp=${desp}`
                    }).catch(err => {
                      console.log(err)
                    });
                  }
                }
              })
            } else { // request error
              console.log(JSON.parse(d))          
            }
          })
        })
      }
      done();
    }
  }]);
})