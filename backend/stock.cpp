#include "stock.h"
#include <algorithm>
#include "user.h"
using namespace std;

Stock::Stock(string newTicker) : ticker(newTicker), lastTradedPrice(0.0) {}

string Stock::getTicker() {
    return ticker;
}

double Stock::getLastTradedPrice() {
    return lastTradedPrice;
}

void Stock::setLastTradedPrice(double newLastTradedPrice) {
    lastTradedPrice = newLastTradedPrice;
}

void Stock::placeBuyOrder(Order* order) {
    if (!order) return;
    order->status = PENDING;
    buyOrders.push(order);
}

void Stock::placeSellOrder(Order* order) {
    if (!order) return;
    order->status = PENDING;
    sellOrders.push(order);
}

void Stock::executeOrder(Order* incomingOrder) {
    if (!incomingOrder || incomingOrder->ticker != ticker || incomingOrder->quantity <= 0) {
        return;
    }

    if (incomingOrder->buyOrSell == BUY) {
        placeBuyOrder(incomingOrder);
    } else {
        placeSellOrder(incomingOrder);
    }

    while (true) {
        pair<Order*, Order*> matchedOrders = matchOrders();
        if (!matchedOrders.first || !matchedOrders.second) {
            break;
        }
        // Chosen policy: execute at resting sell price.
        setLastTradedPrice(matchedOrders.second->price);
    }
}


pair<Order* , Order*> Stock::matchOrders() {
    if (buyOrders.empty() || sellOrders.empty()) {
        return make_pair(nullptr, nullptr);
    }

    Order* buyOrder = buyOrders.top();
    Order* sellOrder = sellOrders.top();

    if (buyOrder->price < sellOrder->price) {
        return make_pair(nullptr, nullptr);
    }

    int quantity = min(buyOrder->quantity, sellOrder->quantity);
    double tradePrice = sellOrder->price;
    double tradeValue = tradePrice * quantity;

    Portfolio& buyerPortfolio = buyOrder->user->getPortfolio();
    Portfolio& sellerPortfolio = sellOrder->user->getPortfolio();

    if (buyerPortfolio.balance < tradeValue) {
        return make_pair(nullptr, nullptr);
    }
    if (!sellerPortfolio.removeShares(ticker, quantity)) {
        return make_pair(nullptr, nullptr);
    }

    buyerPortfolio.balance -= tradeValue;
    sellerPortfolio.balance += tradeValue;
    buyerPortfolio.addShares(ticker, quantity);

    buyOrder->quantity -= quantity;
    sellOrder->quantity -= quantity;

    if (buyOrder->quantity == 0) {
        buyOrder->status = EXECUTED;
        buyOrders.pop();
    }
    if (sellOrder->quantity == 0) {
        sellOrder->status = EXECUTED;
        sellOrders.pop();
    }

    return make_pair(buyOrder, sellOrder);
}