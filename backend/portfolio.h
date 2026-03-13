#ifndef PORTFOLIO_H
#define PORTFOLIO_H
#include <string>
#include <unordered_map>
using namespace std;

// Data structure "Portfolio": one user's holdings and cash.
// Invariance: balance >= 0; for each ticker in stockQuantities, value > 0.
struct Portfolio {
    unordered_map<string, int> stockQuantities;  // maps ticker -> number of shares
    // total $ avail for each portfolio (since no external payment method) 
    double balance = 0.0; 

    // Increase shares held for ticker.
    // Pre: quantity > 0. Post: stockQuantities[ticker] increased by quantity.
    void addShares(const string& ticker, int quantity) {
        if (quantity <= 0) return;
        stockQuantities[ticker] += quantity;
    }

    // Decrease shares held for ticker; remove entry if count reaches 0.
    // Pre: quantity > 0; stockQuantities[ticker] >= quantity. Post: invariance is preserved.
    void removeShares(const string& ticker, int quantity) {
        if (quantity <= 0) return;
        auto it = stockQuantities.find(ticker);
        if (it != stockQuantities.end()) {
            it->second -= quantity;
            if (it->second <= 0) {
                stockQuantities.erase(it);
            }
        }
    }

    // Return number of shares held for ticker; 0 if not present.
    // Pre: none. Post: result >= 0.
    int getShares(const string& ticker) const {
        auto it = stockQuantities.find(ticker);
        if (it != stockQuantities.end()) {
            return it->second;
        }
        return 0;
    }
};
#endif