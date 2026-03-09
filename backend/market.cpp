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
    if (!order->user || order->quantity <= 0) {
        return false;
    }

    Stock* stock = getStock(order->ticker);
    if (!stock) {
        return false; // Stock not found
    }

    Portfolio& portfolio = order->user->getPortfolio();
    
    if (order->buyOrSell == BUY) {
        // For buy orders, calculate required cash upfront
        double pricePerShare = order->price;
        
        // For market orders (price = 0), use last traded price
        if (pricePerShare <= 0) {
            pricePerShare = stock->getLastTradedPrice();
            // If stock has never been traded, use a default or small price
            if (pricePerShare <= 0) {
                pricePerShare = 100.0; // Default estimate
            }
        }
        
        double requiredCash = pricePerShare * order->quantity;
        if (portfolio.balance < requiredCash) {
            return false; // Not enough cash
        }
        
        // Reserve the cash by deducting it immediately
        portfolio.balance -= requiredCash;
    } else {
        // For sell orders, reserve the shares
        if (!portfolio.removeShares(order->ticker, order->quantity)) {
            return false; // Not enough shares
        }
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

