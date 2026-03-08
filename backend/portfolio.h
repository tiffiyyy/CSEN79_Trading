#ifndef PORTFOLIO_H
#define PORTFOLIO_H
#include <string>
#include <unordered_map>
using namespace std;

struct Portfolio {
    unordered_map<string, int> stockQuantities;
    double balance = 0.0;

    void addShares(const string& ticker, int quantity) {
        if (quantity <= 0) return;
        stockQuantities[ticker] += quantity;
    }

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