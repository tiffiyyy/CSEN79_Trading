#include "market.h"

bool Market::addStock(const string& ticker) {
    if (stocksMap.find(ticker) != stocksMap.end()) {
        return false; // Stock already exists
    }
    return stocksMap.emplace(ticker, Stock(ticker)).second;
}

bool Market::removeStock(const string& ticker) {
    if (stocksMap.find(ticker) == stocksMap.end()) {
        return false; // Stock not found
    }
    stocksMap.erase(ticker);
    return true;
}

Stock* Market::getStock(const string& ticker) {
    auto it = stocksMap.find(ticker);
    if (it == stocksMap.end()) {
        return nullptr; // Stock not found
    }
    return &it->second;
}

const Stock* Market::getStock(const string& ticker) const {
    if (stocksMap.find(ticker) == stocksMap.end()) {
        return nullptr; // Stock not found
    }
    return &stocksMap.at(ticker);
}

bool Market::addUser(const User& user){
    if(usersMap.find(user.getUsername()) != usersMap.end()){
        return false; // User already exists
    }
    return usersMap.emplace(user.getUsername(), user).second;
}

User* Market::getUser(const string& username){
    auto it = usersMap.find(username);
    if(it == usersMap.end()){
        return nullptr; // User not found
    }
    return &it->second;
}

bool Market::placeOrder(Order* order) {
    if (!order) {
        return false;
    }
    if (!order->user || order->price <= 0 || order->quantity <= 0) {
        return false;
    }

    Portfolio& portfolio = order->user->getPortfolio();
    if (order->buyOrSell == BUY) {
        double requiredCash = order->price * order->quantity;
        if (portfolio.balance < requiredCash) {
            return false;
        }
    } else {
        auto it = portfolio.stockQuantities.find(order->ticker);
        if (it == portfolio.stockQuantities.end() || it->second < order->quantity) {
            return false;
        }
    }

    Stock* stock = getStock(order->ticker);
    if (!stock) {
        return false; // Stock not found
    }
    order->user->addOrder(order);
    stock->executeOrder(order);
    return true;
}

void Market::matchTicker(const string& ticker){
    Stock* stock = getStock(ticker);
    if(!stock){
        return; // Stock not found
    }
    while (true) {
        pair<Order*, Order*> matchedOrders = stock->matchOrders();
        if (!matchedOrders.first || !matchedOrders.second) {
            break;
        }
        stock->setLastTradedPrice(matchedOrders.second->price);
    }
}

