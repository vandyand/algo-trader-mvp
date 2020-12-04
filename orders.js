import axios from 'axios';

// const defaultOrder = {
// order: {
//     units,
//     instrument,
//     timeInForce: "FOK",
//     type: "MARKET",
//     positionFill: "DEFAULT",
// }
// }

// const tpslOrder = {
// order: {
//     type: ["TAKE_PROFIT","STOP_LOSS"][0],
//     tradeID: "",
//     price: "",
// }
// }

export const executeMarketOrder = (instrument, units) => {
    return axios({
        method: "post",
        url: `${url}/${accountId}/orders`,
        headers,
        data: body,
    })
        .then((res) => {
            console.log(res.data);
            return res.data;
        })
        .catch((err) => console.log(err));
};


export const executeTPSLOrder = (
    instrument, units, range
) => {
    const order = defaultOrder;

    executeOrder(order)
        .then((res) => {
            // console.log("########### execute res:", res.lastTransactionID, "##############")
            const tradeID = res.lastTransactionID;
            const price = Number(res.orderFillTransaction.price)
            if (Number(res.orderFillTransaction.units) >= 0) {
                tp.order.price = price + range;
                sl.order.price = price - range;
            } else {
                tp.order.price = price - range;
                sl.order.price = price + range;
            }
            tp.order.tradeID = sl.order.tradeID = tradeID;
            executeOrder(tp)
            executeOrder(sl)
        })
};

export const executeOrders = () => {
    const orders = 
}