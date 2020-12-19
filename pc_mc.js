const Crawler = require("crawler");
const request = require('https');

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
              console.log(`${coin} price:`, data.data[0].price)
              const $ = res.$
              $(".layui-table").find('tbody').children('tr').map((inde, ele) => {
                const tdArray = $(ele).find('td').get()
                if($(tdArray[3]).find('font').text()) {
                  console.log(`${coin}:`, $(tdArray[0]).text(), '->', $(tdArray[3]).find('font').text())
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