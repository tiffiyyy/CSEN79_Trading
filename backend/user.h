#ifndef USER_H
#define USER_H
#include <string>
#include <vector>
#include "order.h"
#include "portfolio.h"
using namespace std;

// "User": one trader; owns a portfolio and order history.
// Invariant: username non-empty; id unique; portfolio satisfies Portfolio invariant.
class User {
    private:
        string username;            // unique username
        int id;                     // unique id for each user
        vector<Order*> orders;      // history of current and past orders
        Portfolio portfolio;        // holdings and balance
    
    public:
// CONSTRUCTOR 
        // Pre: username non-empty. Post: user with empty order list, default portfolio.
        User(string username);

// HELPER FUNCTIONS 
        // Return username. 
        string getUsername() const;
        // Return read-only reference to order history. 
        const vector<Order*>& getOrders() const;
        // Return mutable portfolio (for updating balance/shares). 
        Portfolio& getPortfolio();
        // Return read-only portfolio. 
        const Portfolio& getPortfolio() const;
        // Return unique user id. 
        int getID();

// MEMBER FUNCTION 
        // Append order to history. Pre: order non-null. Post: orders contains order.
        void addOrder(Order* order);
};
#endif