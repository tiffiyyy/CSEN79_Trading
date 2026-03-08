#ifndef USER_H
#define USER_H
#include <string>
#include <vector>
#include "order.h"
#include "portfolio.h"
using namespace std;

// Data structure called "User" containing user information. 
class User {
    private:
        string username;            // unique username 
        int id;                     // unique id for each user 
        vector<Order*> orders;      // history of current and past transactions
        Portfolio portfolio;        // stock portfolio (shares/company, balance)
    public:
        // contructors 
        User(string username);

        // helper functions
        string getUsername() const;
        const vector<Order*>& getOrders() const;
        Portfolio& getPortfolio();
        const Portfolio& getPortfolio() const;
        int getID(); 

        // add to user's order history 
        void addOrder(Order* order);
};
#endif