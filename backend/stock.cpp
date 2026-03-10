#include "stock.h"
#include <algorithm>
#include <limits>
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

// pushes buy order onto the buy pq (limit order) 
void Stock::placeBuyOrder(Order* order) {
    if (!order) return;
    order->status = PENDING;
    buyOrders.push(order);
}


// pushes sell order onto the sell pq (limit order) 
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
    // Note: This function doesn't remove the order from the priority queue.
    // A proper implementation would require a way to invalidate or remove
    // orders from the middle of the heap, which std::priority_queue doesn't support.
    // For now, we mark it as cancelled, and it will be ignored during matching.
    // This can lead to stale, cancelled orders accumulating in the queues.
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

    while (!buyOrders.empty() && buyOrders.top()->status != PENDING) {
        buyOrders.pop();
    }
    while (!sellOrders.empty() && sellOrders.top()->status != PENDING) {
        sellOrders.pop();
    }

    if (buyOrders.empty() || sellOrders.empty()) {
        return make_pair(nullptr, nullptr);
    }

    Order* buyOrder = buyOrders.top();
    Order* sellOrder = sellOrders.top();

    if (buyOrder->price < sellOrder->price) {
        return make_pair(nullptr, nullptr);
    }

    Portfolio& buyerPortfolio = buyOrder->user->getPortfolio();
    Portfolio& sellerPortfolio = sellOrder->user->getPortfolio();

    // Determine trade price. For this simple model, the resting order's price is used.
    // A market buy will execute at the best sell price. A market sell at the best buy price.
    double tradePrice;
    if (buyOrder->timestamp < sellOrder->timestamp) { // sellOrder is incoming, buyOrder was resting
        tradePrice = buyOrder->price;
    } else { // buyOrder is incoming, sellOrder was resting
        tradePrice = sellOrder->price;
    }

    int quantity = min(buyOrder->quantity, sellOrder->quantity);
    double tradeValue = tradePrice * quantity;

    // Check for sufficient funds and shares BEFORE executing the trade
    if (buyerPortfolio.balance < tradeValue || sellerPortfolio.getShares(ticker) < quantity) {
        // This indicates a problem (e.g. insufficient funds for a market order that moved price).
        // A robust system might cancel the problematic order. Here, we just fail the match.
        return make_pair(nullptr, nullptr);
    }

    // Atomically update portfolios
    buyerPortfolio.balance -= tradeValue;
    sellerPortfolio.balance += tradeValue;
    buyerPortfolio.addShares(ticker, quantity);
    sellerPortfolio.removeShares(ticker, quantity);

    buyOrder->quantity -= quantity;
    buyOrder->totalValue += tradeValue;
    sellOrder->quantity -= quantity;
    sellOrder->totalValue += tradeValue;

    if (buyOrder->quantity == 0) {
        buyOrder->status = EXECUTED;
        buyOrder->executionPrice = buyOrder->totalValue / buyOrder->initialQuantity;
        buyOrders.pop();
    }
    if (sellOrder->quantity == 0) {
        sellOrder->status = EXECUTED;
        sellOrder->executionPrice = sellOrder->totalValue / buyOrder->initialQuantity;
        sellOrders.pop();
    }

    return make_pair(buyOrder, sellOrder);
}