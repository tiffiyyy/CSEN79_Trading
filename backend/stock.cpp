#include "stock.h"
using namespace std;

Stock::Stock(
    string newTicker, 
    priority_queue<Order*, vector<Order*>, BuyOrderCmp> newBuyOrders,
    priority_queue<Order*, vector<Order*>, SellOrderCmp> newSellOrders,
    double newLastTradedPrice){
        ticker = newTicker;
        buyOrders = newBuyOrders;
        sellOrders = newSellOrders;
        lastTradedPrice = newLastTradedPrice;
            }
string Stock::getTicker() {
    return ticker;
}
double Stock::getLastTradedPrice() {
    return lastTradedPrice;
}
void Stock::setLastTradedPrice(double newLastTradedPrice) {
    lastTradedPrice = newLastTradedPrice;
}
void Stock::placeBuyOrder(const Order* const order) {
    buyOrders.push(order);
}
void Stock::placeSellOrder(const Order* const order) {
    sellOrders.push(order);
}
void Stock::executeOrder(Order* incomingOrder) {

    if (!incomingOrder || incomingOrder->ticker != ticker || incomingOrder->quantity <= 0) return;

    if (incomingOrder->buyOrSell == BUY) placeBuyOrder(incomingOrder);
    else placeSellOrder(incomingOrder);

    while (!buyOrders.empty() && !sellOrders.empty()) {
        Order* buyOrder = buyOrders.top();
        Order* sellOrder = sellOrders.top();
        if (buyOrder->price >= sellOrder->price) {
            int quantity = min(buyOrder->quantity, sellOrder->quantity);
            buyOrder->quantity -= quantity;
            sellOrder->quantity -= quantity;
        }
    }
    


}
void Stock::matchOrders() {
    while (!buyOrders.empty() && !sellOrders.empty()) {
        Order* buyOrder = buyOrders.top();
        Order* sellOrder = sellOrders.top();
        if (buyOrder->price >= sellOrder->price) {
            int quantity = min(buyOrder->quantity, sellOrder->quantity);
            buyOrder->quantity -= quantity;
            sellOrder->quantity -= quantity;
        }
    }
}
