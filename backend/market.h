#ifndef MARKET_H
#define MARKET_H
#include <string>
#include <unordered_map>

#include "order.h"
#include "stock.h"
#include "user.h"

using namespace std;

// "Market": central book of stocks and users; routes and places orders.
// Invariance: tickers in stocksMap are unique; usernames in usersMap are unique; 
// each Stock satisfies the Stock invariance.
class Market {
   private:
    unordered_map<string, Stock> stocksMap;   // maps ticker -> company stock profile pq
    unordered_map<string, User> usersMap;     // maps username -> user

   public:
// CONSTRUCTOR 
   // Pre: Stock and User have default constructor. 
    Market() = default;

// MEMBER FUNCTIONS 
    // Add a stock order book. 
    // Pre: ticker non-empty. Post: true if added, false if already present.
    bool addStock(const string& ticker);
    // Remove stock and its book. 
    // Pre: ticker non-empty. Post: true if removed, false if not found.
    bool removeStock(const string& ticker);

    // Get stock by ticker; nullptr if not found. Pre: none.
    Stock* getStock(const string& ticker);
    // Same function as above but output will be "read only"
    const Stock* getStock(const string& ticker) const;

    // Adds user to the usersMap when they register an account. 
    // Pre: user has valid username. Post: true if added, false if username exists.
    bool addUser(const User& user);
    // Get user by username; nullptr if not found. Pre: none.
    User* getUser(const string& username);

    // Route order to correct stock and place (limit or market). 
    // Pre: order non-null, ticker exists, user exists. 
    // Post: order executed or queued; true on success.
    bool placeOrder(Order* order);
};

#endif