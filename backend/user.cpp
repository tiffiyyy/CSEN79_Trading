#include "user.h"

User::User(string username) : username(username) {}

string User::getUsername() const {
    return username;
}

const vector<Order*>& User::getOrders() const {
    return orders;
}

void User::addOrder(Order* order) {
    if (!order) return;
    orders.push_back(order);
}

Portfolio& User::getPortfolio() {
    return portfolio;
}

const Portfolio& User::getPortfolio() const {
    return portfolio;
}
