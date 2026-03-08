#ifndef STOCK_H
#define STOCK_H
#include <queue>
#include <string>
#include <utility>
#include "order.h"
using namespace std;

struct BuyOrderCmp {
    bool operator()(const Order* a, const Order* b) const {
        if (a->price == b->price) return a->timestamp > b->timestamp; 
        return a->price < b->price; 
    }
};

struct SellOrderCmp {
    bool operator()(const Order* a, const Order* b) const {
        if (a->price == b->price) return a->timestamp > b->timestamp; 
        return a->price > b->price; 
    }
};
class Stock {
    private:
        string ticker;
        priority_queue<Order*, vector<Order*>, BuyOrderCmp> buyOrders;
        priority_queue<Order*, vector<Order*>, SellOrderCmp> sellOrders;
        double lastTradedPrice;
    public:
        Stock(string ticker);
        string getTicker();
        double getLastTradedPrice();
        void setLastTradedPrice(double newLastTradedPrice);
        void placeBuyOrder(Order* order);
        void placeSellOrder(Order* order);
        void executeOrder(Order* order);
        pair<Order*, Order*> matchOrders();
};
#endif