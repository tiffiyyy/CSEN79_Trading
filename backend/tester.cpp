#include "market.h"
#include <iostream> 

using namespace std;

void runTest()
{
    Market market;

    market.addStock("NVDA");
    market.addStock("AAPL");
    market.addStock("MCD");

    cout << market.getStock("NVDA") << endl << market.getStock("AAPL") << endl << market.getStock("MCD") << endl;
    
    market.addUser(User("Linus"));
    market.addUser(User("Tiffany"));
    market.addUser(User("Nate"));
    if(market.addUser(User("Nate")) == false) //to test for duplicates
    {
        cout << "BigNate already exists" << endl;
    }
    market.addUser(User("Kobe"));

    User *linus = market.getUser("Linus");
    User *tiffany = market.getUser("Tiffany");
    User *nate = market.getUser("Nate");
    User *kobe = market.getUser("Kobe");

    linus->getPortfolio().balance = 100000;
    tiffany->getPortfolio().balance = 100000;
    nate->getPortfolio().balance = 100000;
    kobe->getPortfolio().balance = 100000;

    linus->getPortfolio().addShares("NVDA", 50);
    tiffany->getPortfolio().addShares("NVDA", 20);  //these two will be sellers

    Order* order1 = new Order;
    order1->user = nate;
    order1->ticker = "NVDA";
    order1->buyOrSell = BUY;
    order1->price = 100;
    order1->quantity = 15;
    order1->timestamp = 1;

    Order* order2 = new Order;
    order2->user = linus;
    order2->ticker = "NVDA";
    order2->buyOrSell = SELL;
    order2->price = 95;
    order2->quantity = 15;
    order2->timestamp = 2;

    Order* order3 = new Order;
    order3->user = kobe;
    order3->ticker = "NVDA";
    order3->buyOrSell = BUY;
    order3->price = 97;
    order3->quantity = 5;
    order3->timestamp = 3;

    Order* order4 = new Order;
    order4->user = tiffany;
    order4->ticker = "NVDA";
    order4->buyOrSell = SELL;
    order4->price = 97;
    order4->quantity = 5;
    order4->timestamp = 4;

    //so we have 4 orders placed, 2 buy and 2 sell
    //1. Nate-BUY, $100, 15 shares,
    //2. Linus, SELL, $95, 15 shares,
    //3. kobe, BUY $97, 5 shares
    //4. tiffany, SELL< $97, 5 shares

    market.placeOrder(order1);
    market.placeOrder(order2);
    market.placeOrder(order3);
    market.placeOrder(order4);

    cout << linus->getUsername() << ": " << endl;
    cout << "Balance: " << linus->getPortfolio().balance << endl;
    for (auto it = linus->getPortfolio().stockQuantities.begin();
         it != linus->getPortfolio().stockQuantities.end(); ++it) {
        cout << it->first << ": " << it->second << endl;
    }

    cout << tiffany->getUsername() << ": " << endl;
    cout << "Balance: " << tiffany->getPortfolio().balance << endl;
    for (auto it = tiffany->getPortfolio().stockQuantities.begin();
         it != tiffany->getPortfolio().stockQuantities.end(); ++it) {
        cout << it->first << ": " << it->second << endl;
    }
    
    cout << nate->getUsername() << ": " << endl;
    cout << "Balance: " << nate->getPortfolio().balance << endl;
    for (auto it = nate->getPortfolio().stockQuantities.begin();
         it != nate->getPortfolio().stockQuantities.end(); ++it) {
        cout << it->first << ": " << it->second << endl;
    }
     
    cout << kobe->getUsername() << ": " << endl;
    cout << "Balance: " << kobe->getPortfolio().balance << endl;
    for (auto it = kobe->getPortfolio().stockQuantities.begin();
         it != kobe->getPortfolio().stockQuantities.end(); ++it) {
        cout << it->first << ": " << it->second << endl;
    }
}

int main() {
    runTest();
    return 0;
}


