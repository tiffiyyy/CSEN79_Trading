#include "stock.h"
#include <algorithm>
#include "user.h"
using namespace std;

// constructor 
Stock::Stock(string newTicker) : ticker(newTicker), lastTradedPrice(0.0) {}


// helper functions 
string Stock::getTicker() {
    return ticker;
}

double Stock::getLastTradedPrice() {
    return lastTradedPrice;
}

void Stock::setLastTradedPrice(double newLastTradedPrice) {
    lastTradedPrice = newLastTradedPrice;
}


// update balance 
void Stock::balance(int price, Portfolio& buy, Portfolio& sell) {
    buy.balance -= price; 
    sell.balance += price; 
} 


// execute buy market order 
void Stock::buyMarketOrder(Order *order) {
    if (sellOrders.empty()) return; 
    Order* sellOrder = sellOrders.top();
    Portfolio& buyerPortfolio = order->user->getPortfolio();
    Portfolio& sellerPortfolio = sellOrder->user->getPortfolio();
    int price; 
    int qty; 
    order->status = PENDING; 
    while (order->quantity > 0 && order->buyOrSell == BUY) {
        // if the top sell order cannot completely fulfill the buy order 
        if (sellOrder->quantity < order->quantity) {
            qty = std::min(sellOrder->quantity, order->quantity); 
            price = sellOrder->quantity * sellOrder->price; 
            balance(price, buyerPortfolio, sellerPortfolio); 
            order->quantity -= qty; 
            buyerPortfolio.addShares(order->ticker, qty); 
            sellerPortfolio.removeShares(order->ticker, qty); 
            sellOrder->quantity = 0; 
            sellOrders.pop();
            sellOrder = sellOrders.top();
        }
        // if the top sell order can fulfill the buy order 
        else {
            price = order->quantity * sellOrder->price; 
            balance(price, buyerPortfolio, sellerPortfolio); 
            sellOrder->quantity -= order->quantity; 
            buyerPortfolio.addShares(order->ticker, order->quantity); 
            sellerPortfolio.removeShares(order->ticker, order->quantity); 
            order->quantity = 0; 
        }
    }
    if (order->quantity == 0) {
        order->status = EXECUTED; 
    }
}


// execute sell market order 
void Stock::sellMarketOrder(Order *order) {
    if (buyOrders.empty()) return; 
    Order* buyOrder = buyOrders.top();
    Portfolio& buyerPortfolio = buyOrder->user->getPortfolio();
    Portfolio& sellerPortfolio = order->user->getPortfolio();
    int price; 
    int qty; 
    order->status = PENDING; 
    while (order->quantity > 0 && order->buyOrSell == SELL) {
        // if the top sell order cannot completely fulfill the buy order 
        if (buyOrder->quantity < order->quantity) {
            qty = std::min(buyOrder->quantity, order->quantity); 
            price = buyOrder->quantity * buyOrder->price; 
            balance(price, buyerPortfolio, sellerPortfolio); 
            order->quantity -= qty; 
            buyerPortfolio.addShares(order->ticker, qty); 
            sellerPortfolio.removeShares(order->ticker, qty); 
            buyOrder->quantity = 0; 
            buyOrders.pop();
            buyOrder = buyOrders.top();
        }
        // if the top sell order can fulfill the buy order 
        else {
            price = order->quantity * buyOrder->price; 
            balance(price, buyerPortfolio, sellerPortfolio); 
            buyOrder->quantity -= order->quantity; 
            buyerPortfolio.addShares(order->ticker, order->quantity); 
            sellerPortfolio.removeShares(order->ticker, order->quantity); 
            order->quantity = 0; 
        }
    }
    if (order->quantity == 0) {
        order->status = EXECUTED; 
    }
}


// pushes buy order onto the buy pq 
void Stock::placeBuyOrder(Order* order) {
    if (!order) return;
    order->status = PENDING;
    buyOrders.push(order);
}


// pushes sell order onto the sell pq 
void Stock::placeSellOrder(Order* order) {
    if (!order) return;
    order->status = PENDING;
    sellOrders.push(order);
}


// 
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


// cancels a pending limit order 
void Stock::cancelOrder(Order* order) {
    if (!order) return; 
    if (order->status != PENDING) return; 
    order->status = CANCELLED; 
    return; 
}


// matches top buy order with top sell order and fulfills the respective orders 
    // updates the price, portfolio, and balance 
    // any left over money offerred by the buy order will be returned to the user 
// returns make_pair(buyOrder, sellOrder)
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