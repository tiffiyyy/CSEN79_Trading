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

// "Stock" container: one company's buy/sell order priority queues and last traded price.
// Invariance: ticker non-empty; buyOrders/sellOrders contain valid Order*; lastTradedPrice >= 0.
class Stock {
    private:
        string ticker;                  // company symbol 
        // priority queue of all buy orders associated with this company 
        priority_queue<Order*, vector<Order*>, BuyOrderCmp> buyOrders; 
        // priority queue of all sell orders associated with this company 
        priority_queue<Order*, vector<Order*>, SellOrderCmp> sellOrders;
        // last price paid per stock (determines change over time)
        double lastTradedPrice; 
    
    public:
// CONSTRUCTOR 
        // Pre: ticker non-empty. Post: empty buy/sell books, lastTradedPrice 0.
        Stock(string ticker);

// HELPER FUNCTIONS 
        // Pre: none; setLastTradedPrice: newLastTradedPrice >= 0 
        string getTicker();
        double getLastTradedPrice();
        void setLastTradedPrice(double newLastTradedPrice);

// MEMBER FUNCTIONS 
        // Update buy/sell portfolios after trade at price. 
        // Pre: price >= 0; buy/sell refer to counterparties.
        void balance(int price, Portfolio& buy, Portfolio& sell);

    // for the next five functions: Pre: order non-null, order->ticker == ticker.
        // Push buy limit order onto buy queue. 
        void placeBuyOrder(Order* order);
        // Push sell limit order onto sell queue. 
        void placeSellOrder(Order* order);
        // Execute buy market order (match to best sell). 
        void buyMarketOrder(Order *order);
        // Execute sell market order (match to best buy). 
        void sellMarketOrder(Order *order);
        // Attempts to execute one limit order, using matchOrders to fulfill orders. 
        bool executeOrder(Order* order);

        // Mark a pending limit order cancelled. Pre: order exists this stock's pq.
        void cancelOrder(Order* order);
        // Pop best buy and best sell if they match; 
        // return pair (buy, sell) or invalid pair if no match.
        pair<Order*, Order*> matchOrders();
  
};
#endif