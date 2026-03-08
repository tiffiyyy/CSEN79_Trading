#ifndef ORDER_H
#define ORDER_H
#include <string>
class User;
using namespace std;
enum OrderType {
    BUY,
    SELL
};
enum OrderStatus {
    PENDING,
    EXECUTED,
    CANCELLED
};
struct Order {
    User* user;
    string ticker;
    OrderType buyOrSell;
    OrderStatus status;
    double price;
    int quantity;
    long long timestamp;
};
#endif