#include "user.h"

// constructor 
User::User(string username) : username(username) {}


// helper functions 
string User::getUsername() const {
    return username;
}

const vector<Order*>& User::getOrders() const {
    return orders;
}

Portfolio& User::getPortfolio() {
    return portfolio;
}

const Portfolio& User::getPortfolio() const {
    return portfolio;
}

int User::getID() {
    return id; 
}


// add to user's order history 
void User::addOrder(Order* order) {
    if (!order) return;
    orders.push_back(order);
}