#include "market.h"

bool Market::addStock(const string& ticker) {
    if (stocksMap.find(ticker) != stocksMap.end()) {
        return false; // Stock already exists
    }
    stocksMap[ticker] = Stock(ticker);
    return true;
}

bool Market::removeStock(const string& ticker) {
    if (stocksMap.find(ticker) == stocksMap.end()) {
        return false; // Stock not found
    }
    stocksMap.erase(ticker);
    return true;
}

Stock* Market::getStock(const string& ticker) {
    if (stocksMap.find(ticker) == stocksMap.end()) {
        return nullptr; // Stock not found
    }
    return &stocksMap[ticker];
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
    usersMap[user.getUsername()] = user;
    return true;
}

User* Market::getUser(const string& username){
    if(usersMap.find(username) == usersMap.end()){
        return nullptr; // User not found
    }
    return &usersMap[username];
}

bool Market::placeOrder(const Order* order) {
    Stock* stock = getStock(order->ticker);
    if (!stock) {
        return false; // Stock not found
    }
    if(order->buyorSell == BUY){
        stock->placeBuyOrder(order);
    }
    else {
        stock->placeSellOrder(order);
    }
    return true;
}

void Market::matchTicker(const string& ticker){
    if(stocksMap.find(ticker) == stocksMap.end()){
        return; // Stock not found
    }
    stocksMap[ticker].matchOrders(usersMap);
}

