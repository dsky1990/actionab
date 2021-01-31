const fs = require('fs');
const finalData = JSON.parse(fs.readFileSync('data/pc_final.json'))
const mcData = JSON.parse(fs.readFileSync('data/pc_mc.json'))

Object.keys(finalData).forEach(key => {
  const finalInData = finalData[key].data
  const finalMoney = finalData[key].money
  Object.keys(finalInData).forEach(keyin => {
    const len = finalInData[keyin].length
    if(len > 0) {
      let time = 0
      finalInData[keyin].forEach(val => {
        if(val.isRight) {
          time++
        }
      })
      if(time/len>= 0.55 && finalMoney[keyin] >= 0) {
        console.log(`${key}-${keyin}开单${len}次，预测成功${time}次， 准确率${Number(time/len*100).toFixed(2)}%，${finalMoney[keyin] >= 0 ? '盈利' :'亏损'}${finalMoney[keyin]}`)
      }
    } 
  })
})
Object.keys(mcData).forEach(key => {
  const mcInData = mcData[key].data
  const mcMoney = mcData[key].money
  Object.keys(mcInData).forEach(keyin => {
    const len = mcInData[keyin].length
    if(len > 0) {
      let time = 0
      mcInData[keyin].forEach(val => {
        if(val.isRight) {
          time++
        }
      })
      if(time/len >= 0.55 && mcMoney[keyin] >= 0) {
        console.log(`${key}-${keyin}开单${len}次，预测成功${time}次， 准确率${Number(time/len*100).toFixed(2)}%，${mcMoney[keyin] >= 0 ? '盈利': '亏损'}${mcMoney[keyin]}`)
      }
    } 
  })
})
