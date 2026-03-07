#include <iostream>
#include <string>
#include <queue>
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
        void placeBuyOrder(const Order* const order);
        void placeSellOrder(const Order* const order);
        void executeOrder(Order* order);
        void matchOrders();
};