#ifndef MARKET_H
#define MARKET_H
#include <string>
#include <unordered_map>

#include "order.h"
#include "stock.h"
#include "user.h"

using namespace std;
class Market {
   private:
    unordered_map<string, Stock> stocksMap;
    unordered_map<string, User> usersMap;

   public:
    Market() = default;

    bool addStock(const string& ticker);
    bool removeStock(const string& ticker);

    Stock* getStock(const string& ticker);
    const Stock* getStock(const string& ticker) const;

    bool addUser(const User& user);
    User* getUser(const string& username);
    
    bool placeOrder(Order* order);
    //void matchTicker(const string& ticker);
};


#endif