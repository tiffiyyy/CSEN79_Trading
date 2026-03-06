#include <string>
#include <vector>
#include "order.h"
#include "stock.h"
using namespace std;    
class User {
    private:
        int id;
        string username;
        string password;
        vector<Order*> orders;
        vector<Stock*> stocks;
    public:
        User(int id, string username, string password);
        int getId();
        string getUsername();
        vector<Order*> getOrders();
        vector<Stock*> getStocks();
};