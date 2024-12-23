/**
 * 解析数据
 * @param {string} data - 原始数据
 * @returns {Object} - 解析后的数据
 */

function parseData(data) {
const result = [];
let offset = 0;  
let cost = 0;

while (offset < data.length) {
    // console.log(data)
    const swapStartIndex = data.indexOf('\x00\x08swap', offset);

    if (swapStartIndex === -1) break; // 没有找到更多的 swap 数据

    let segment = data.slice(swapStartIndex); // 从当前找到的 swap 开始

    // 解析 txid: 从 '\x01' 到 '\x02' 之间
    const txidPattern = /=yB(.*?)\x02/;
    const txidMatch = segment.match(txidPattern);
    let txid = txidMatch ? txidMatch[1] : null;


    txid = txid.replace(/^.*?\x01/, '');
    let currentOffset = txidMatch ? txidMatch.index + txidMatch[0].length : 0;

    // 解析 maker: 从 '\x02' 到 '\x02' 之间，排除 txid 部分
    const makerPattern = /[a-zA-Z](.*?)\x02/;
    let makerMatch = segment.slice(currentOffset).match(makerPattern);
    let maker = makerMatch ? makerMatch[1] : null;

    currentOffset += makerMatch ? makerMatch.index + makerMatch[0].length : 0;

    // 解析 timestamp: 从 '\x04' 到 '\x00' 之间，排除 maker 部分
    // const timestampPattern = /\x020\x02(.*?)\x02/;
    // let timestampMatch = segment.slice(currentOffset).match(timestampPattern);
    // let timestamp = timestampMatch ? timestampMatch[1] : null;
    // // timestamp = timestamp.replace(/\x16/g, '');
    // currentOffset += timestampMatch ? timestampMatch.index + timestampMatch[0].length : 0;

    // 查找 swap type (buy 或者 sell)
    const typePattern = /buy|sell/;
    let typeMatch = segment.slice(currentOffset).match(typePattern);
    const swapType = typeMatch ? typeMatch[0] : null;
    currentOffset += typeMatch ? typeMatch.index + typeMatch[0].length : 0;

    // 解析 priceusd: 从 '\x02' 到 '\x14' 之间，排除前面匹配的部分
    const pricePattern = /\x02[\x00-\x1F](.*?)\x02/;
    let priceMatch = segment.slice(currentOffset).match(pricePattern);
    let priceUsd = priceMatch ? priceMatch[1] : null;

    currentOffset += priceMatch ? priceMatch.index + priceMatch[0].length : 0;



    // 解析 usdamount: 从 '\x14' 到 '\x08' 之间，排除前面匹配的部分
    const usdAmountPattern = /\x02[\x00-\x1F](.*?)[\x00-\x1F]/;
    let usdAmountMatch = segment.slice(currentOffset).match(usdAmountPattern);
    let usdAmount = usdAmountMatch ? usdAmountMatch[1] : null;
    currentOffset += usdAmountMatch ? usdAmountMatch.index + usdAmountMatch[0].length : 0;
    // usdAmount = usdAmount.replace(/^[\x00-\x1F]+/, '');

    const tokenAmountPattern = /(.*?)[\x00-\x1F]/;
    let tokenAmountMatch = segment.slice(currentOffset).match(tokenAmountPattern);
    const tokenAmount = tokenAmountMatch ? tokenAmountMatch[1] : null;
    currentOffset += tokenAmountMatch ? tokenAmountMatch.index + tokenAmountMatch[0].length : 0;

    // 解析 solamount: 从 '\x08' 到 '\x00' 之间，排除前面匹配的部分
    const solAmountPattern = /(.*?)\x00/;
    let solAmountMatch = segment.slice(currentOffset).match(solAmountPattern);
    const solAmount = solAmountMatch ? solAmountMatch[1] : null;
    currentOffset += solAmountMatch ? solAmountMatch.index + solAmountMatch[0].length : 0;

    if(swapType == 'buy'){
        cost += parseFloat(usdAmount);
      }else{
        cost -= parseFloat(usdAmount);
      }

    result.push({
        txid,
        maker,
        // timestamp,
        swapType,
        priceUsd,
        usdAmount,
        tokenAmount,
        solAmount
    });

    offset = swapStartIndex + currentOffset;


    
}

return {result,cost};
}