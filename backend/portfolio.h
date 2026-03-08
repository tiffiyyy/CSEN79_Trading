#ifndef PORTFOLIO_H
#define PORTFOLIO_H
#include <string>
#include <unordered_map>
using namespace std;

// Data structure called "Portfolio" containing user stock portfolio 
struct Portfolio {
    // string = ticker value; int = num share of each stock 
    unordered_map<string, int> stockQuantities;
    // total credit available to spend (since credit card is not linked to account for purchases)
    double balance = 0.0;

    // increase the num of shares owned per company 
    void addShares(const string& ticker, int quantity) {
        if (quantity <= 0) return;
        stockQuantities[ticker] += quantity;
    }

    // decrease the num of shares owned per company 
    bool removeShares(const string& ticker, int quantity) {
        if (quantity <= 0) return false;
        auto it = stockQuantities.find(ticker);
        if (it == stockQuantities.end() || it->second < quantity) return false;
        it->second -= quantity;
        if (it->second == 0) stockQuantities.erase(it);
        return true;
    }
};
#endif