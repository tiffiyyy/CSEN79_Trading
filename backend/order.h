#include <string>
#pragma once
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
    int userId; //using userId over user* to avoid errors when deleting users
    string ticker;
    OrderType buyOrSell;
    OrderStatus status;
    double price;
    int quantity;
    long long timestamp;
    //hello
};