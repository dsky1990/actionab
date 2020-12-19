const Crawler = require("crawler");
const request = require('axios');

const crawlerContruct = new Crawler({
  maxConnections : 10,
  rateLimit: 1000*20,
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

crawlerContruct.queue([{
  uri: 'https://www.abuquant.com/report/abu_context/output_coin_day_ln/report/BTC/pc_mc.html',
  // The global callback won't be called
  callback: function (error, res, done) {
    request.get('https://api.hoolgd.com/open/v1/trade/market?symbol=BTC-USDT').then(function (response) {
      // handle success
      const data = response.data
      if(data.code == 0) {
        console.log(response.data.data);
      }
    })
    if(error){
      console.error(error);
    }else{
      const $ = res.$
      $(".layui-table").find('tbody').children('tr').map((inde, ele) => {
        const tdArray = $(ele).find('td').get()
        if($(tdArray[3]).find('font').text()) {
          console.log('BTC:', $(tdArray[0]).text(), '->', $(tdArray[3]).find('font').text())
        }
      })
    }
    done();
  }
}]);

crawlerContruct.queue([{
  uri: 'https://www.abuquant.com/report/abu_context/output_coin_day_ln/report/ETH/pc_mc.html',
  // The global callback won't be called
  callback: function (error, res, done) {
      if(error){
        console.error(error);
      }else{
        const $ = res.$
        $(".layui-table").find('tbody').children('tr').map((inde, ele) => {
          const tdArray = $(ele).find('td').get()
          if($(tdArray[3]).find('font').text()) {
            console.log('ETH:', $(tdArray[0]).text(), '->', $(tdArray[3]).find('font').text())
          }
        })
      }
      done();
  }
}]);