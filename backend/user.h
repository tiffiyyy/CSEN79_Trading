#ifndef USER_H
#define USER_H
#include <string>
#include <vector>
#include "order.h"
#include "portfolio.h"
using namespace std;

class User {
    private:
        string username;
        vector<Order*> orders;
        Portfolio portfolio;
    public:
        User(string username);
        string getUsername() const;
        const vector<Order*>& getOrders() const;
        void addOrder(Order* order);
        Portfolio& getPortfolio();
        const Portfolio& getPortfolio() const;
};
#endif