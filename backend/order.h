#ifndef ORDER_H
#define ORDER_H

#include <string>
class User;
using namespace std;

// action dropdown on frontend 
// tiffany note: remove cancel from the frontend dropdown 
enum OrderType {
    BUY,
    SELL
};
// order type dropdown on frontend
enum OrderStatus {
    PENDING,
    EXECUTED,
    CANCELLED
};
// data structure "Order" containing information for each order 
struct Order {
    User* user;             // pointer to the user who placed the order 
    int id;                 // unique order id 
    string ticker;          // ex. AAPL
    OrderType buyOrSell; 
    OrderStatus status;
    double price;           // user's price offer per stock 
    int quantity;           // number of shares 
    long long timestamp;    // time when the order is placed 
};
#endif