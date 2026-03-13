#ifndef ORDER_H
#define ORDER_H

#include <string>
class User;
using namespace std;

enum OrderType {
    BUY,   // order to purchase shares
    SELL   // order to sell shares
};

enum OrderStatus {
    PENDING,   // queued in book, not yet filled
    EXECUTED,  // fully or partially filled
    CANCELLED  // user cancelled; no longer in book
};

// Data structure "Order": one trading order (limit or market).
// Invariance: id is unique; price >= 0; quantity > 0; initialQuantity > 0; 
// users are assumed to be non-null for valid orders.
struct Order {
    User* user;             // pointer to the user who placed the order
    int id;                 // unique order id
    string ticker;          // symbol associated with each company (ex. AAPL) 
    OrderType buyOrSell;    // defines whether the order is buying or selling stocks 
    OrderStatus status;     // current state: PENDING, EXECUTED, or CANCELLED 
    double price;           // user's price offer per stock
    int quantity;           // number of shares (remaining)
    long long timestamp;    // time when the order is placed
    int initialQuantity;    // original quantity (unchanged after creation)
    double totalValue;      // filled value so far
    double executionPrice;  // price at which (partial) fill occurred
};
#endif