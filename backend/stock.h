#include <iostream>
#include <string>
#include <queue>
#include "order.h"
using namespace std;
class Stock {
    private:
        string ticker;
        priority_queue<Order*, vector<Order*>, greater<Order*>> buyOrders;
        priority_queue<Order*, vector<Order*>, less<Order*>> sellOrders;
    public:
        Stock(string ticker);
        string getTicker();
        void placeBuyOrder(Order* order);
        void placeSellOrder(Order* order);
        void executeOrder(Order* order);
};