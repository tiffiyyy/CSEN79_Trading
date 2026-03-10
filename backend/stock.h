#ifndef STOCK_H
#define STOCK_H
#include <queue>
#include <string>
#include <utility>
#include "order.h"
#include "portfolio.h"
using namespace std;

// functor to sort the buy priority queue 
struct BuyOrderCmp {
    bool operator()(const Order* a, const Order* b) const {
        if (a->price == b->price) return a->timestamp > b->timestamp; 
        return a->price < b->price; 
    }
};

// functor to sort the sell priority queue 
struct SellOrderCmp {
    bool operator()(const Order* a, const Order* b) const {
        if (a->price == b->price) return a->timestamp > b->timestamp; 
        return a->price > b->price; 
    }
};

// "Stock" container storing the buy and sell orders per company  
class Stock {
    private:
        string ticker;
        priority_queue<Order*, vector<Order*>, BuyOrderCmp> buyOrders;
        priority_queue<Order*, vector<Order*>, SellOrderCmp> sellOrders;
        double lastTradedPrice;         // last price paid per stock (determines change over time)
    public:
        // constructor 
        Stock(string ticker);

        // helper functions 
        string getTicker();
        double getLastTradedPrice();
        void setLastTradedPrice(double newLastTradedPrice);

        // update balance 
        void balance(int price, Portfolio& buy, Portfolio& sell); 
        // execute buy market order 
        void buyMarketOrder(Order *order); 
        // execute sell market order 
        void sellMarketOrder(Order *order); 
        // pushes buy order onto the buy pq 
        void placeBuyOrder(Order* order);
        // pushes sell order onto the sell pq 
        void placeSellOrder(Order* order);
        // 
        void executeOrder(Order* order);
        // cancels a pending limit order 
        void cancelOrder(Order* order); 
        // 
        pair<Order*, Order*> matchOrders();
};
#endif