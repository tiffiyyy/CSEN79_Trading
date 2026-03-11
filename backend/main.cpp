#include "mongoose_dependencies/mongoose.h"
using namespace std;
#include <string>
#include "stock.h"
#include "user.h"
#include "order.h"
#include "market.h"
#include <limits>
#include <ctime>
#include <fstream>

struct OrderRequest {
    char symbol[16];
    char order_type[16];
    double shares;
    double user_id;
    double price;
};

// Global file pointer for logging
FILE* logFile = NULL;

// Logging function that writes to console and optionally to file
void log_api(bool logToFile, const char* format, ...) {
    va_list args;
    
    // Print to console
    va_start(args, format);
    vprintf(format, args);
    va_end(args);
    
    // Print to file if enabled and file is open
    if (logToFile && logFile) {
        va_start(args, format);
        vfprintf(logFile, format, args);
        va_end(args);
        fflush(logFile);
    }
}

static Market market;
static int nextUserId = 1;
static int nextOrderId = 1;
static unordered_map<string, int> usernameToId;
static unordered_map<int, User*> idToUser;
static unordered_map<string, string> symbolToCompany;

bool parse_order_request(struct mg_http_message *hm, struct OrderRequest *req) {
    // Zero out the memory so we don't end up with garbage data
    memset(req, 0, sizeof(struct OrderRequest));

    char *symbol_ptr = mg_json_get_str(hm->body, "$.symbol");
    char *type_ptr = mg_json_get_str(hm->body, "$.orderType");

    if (symbol_ptr) {
        snprintf(req->symbol, sizeof(req->symbol), "%s", symbol_ptr);
    }
    if (type_ptr) {
        snprintf(req->order_type, sizeof(req->order_type), "%s", type_ptr);
    }
    mg_json_get_num(hm->body, "$.shares", &req->shares);
    mg_json_get_num(hm->body, "$.userId", &req->user_id);
    mg_json_get_num(hm->body, "$.price", &req->price);

    // Basic safety check: ensure the required fields actually exist
    if (req->shares <= 0 || req->user_id == 0 || req->symbol[0] == '\0') {
        return false;
    }

    return true;
}

// Helper function to parse username from HTTP request
bool parse_username(struct mg_http_message *hm, string& username) {
    // Validate body
    if (hm->body.len == 0) {
        log_api(true, "\tError: Empty request body\n");
        return false;
    }

    log_api(true, "\tBody size: %lu, Body: %.*s\n", (unsigned long)hm->body.len,
            (int)hm->body.len, hm->body.buf);

    // Parse username from JSON body
    char *username_ptr = mg_json_get_str(hm->body, "$.name");
    if (!username_ptr) {
        log_api(true, "\tError: Failed to parse username from JSON\n");
        return false;
    }

    log_api(true, "\tParsed username_ptr: %p\n", (void*)username_ptr);

    char username_buffer[256];
    memset(username_buffer, 0, sizeof(username_buffer));
    snprintf(username_buffer, sizeof(username_buffer) - 1, "%s", username_ptr);
    username_buffer[sizeof(username_buffer) - 1] = '\0';

    username = string(username_buffer);
    log_api(true, "\tString username created: '%s'\n", username.c_str());

    return true;
}

void initialize_company_data() {
    symbolToCompany["SPY"] = "SPDR S&P 500 ETF Trust";
    symbolToCompany["QQQ"] = "Invesco QQQ Trust";
    symbolToCompany["IWM"] = "iShares Russell 2000 ETF";
    symbolToCompany["VTI"] = "Vanguard Total Stock Market ETF";
    symbolToCompany["VOO"] = "Vanguard S&P 500 ETF";
    symbolToCompany["EFA"] = "iShares MSCI EAFE ETF";
    symbolToCompany["EEM"] = "iShares MSCI Emerging Markets ETF";
    symbolToCompany["GLD"] = "SPDR Gold Shares";
    symbolToCompany["BND"] = "Vanguard Total Bond Market ETF";
    symbolToCompany["ARKK"] = "ARK Innovation ETF";
    symbolToCompany["XLF"] = "Financial Select Sector SPDR";
}

// Connection event handler function
static void ev_handler(struct mg_connection *c, int ev, void *ev_data) {
  if (ev == MG_EV_HTTP_MSG) {  // New HTTP request received
    log_api(false, "Received HTTP request\n");
    log_api(false, "URI: %.*s\n", (int) ((struct mg_http_message *) ev_data)->uri.len,
           ((struct mg_http_message *) ev_data)->uri.buf);
    struct mg_http_message *hm = (struct mg_http_message *) ev_data;  
    
    // Check for REST API calls

    //status endpoint
    if (mg_match(hm->uri, mg_str("/api/hello"), NULL)) {              
      mg_http_reply(c, 200, "", "{%m:%d}\n", MG_ESC("status"), 1);    
      return; 
    }

     if (mg_match(hm->uri, mg_str("/api/createAccount"), NULL)) {
      if (!mg_match(hm->method, mg_str("POST"), NULL)) {
        mg_http_reply(c, 405, "", "{\"error\": \"Method not allowed\"}\n");
        return; 
      }
      log_api(true, "Create account request received\n");
      
      string username;
      if (!parse_username(hm, username)) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n", 
                      "{\"error\": \"Missing username\"}\n");
        return;
      }

      // Check if username already exists in market
      User* existingUser = market.getUser(username);
      if (existingUser != NULL) {
        mg_http_reply(c, 200, "Content-Type: application/json\r\n", 
                      "{\"error\": \"name_taken\"}\n");
        return;
      }
      
      // Create new user and add to market
      log_api(true, "\tCreating new user...\n");
      User newUser(username);
      log_api(true, "\tNew user created\n");
      int userId = nextUserId++;
      usernameToId[username] = userId;
      
      if (market.addUser(newUser)) {
        log_api(true, "Account created for user: %s with ID: %d\n", username.c_str(), userId);
        idToUser[userId] = market.getUser(username);
        mg_http_reply(c, 200, "Content-Type: application/json\r\n", 
                      "{\"status\": \"success\", \"userId\": %d}\n", userId);
      } else {
        mg_http_reply(c, 500, "Content-Type: application/json\r\n", 
                      "{\"error\": \"Failed to create account\"}\n");
      }
      return;

     }

    if (mg_match(hm->uri, mg_str("/api/signIn"), NULL)) {
      if (!mg_match(hm->method, mg_str("POST"), NULL)) {
        mg_http_reply(c, 405, "", "{\"error\": \"Method not allowed\"}\n");
        return;
      }
      log_api(true, "Sign in request received\n");

      string username;
      if (!parse_username(hm, username)) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n",
                      "{\"error\": \"Missing username\"}\n");
        return;
      }
      log_api(true, "\tAttempting to sign in user: '%s'\n", username.c_str());

      // Check if username exists in market
      User* existingUser = market.getUser(username);
      if (existingUser == NULL) {
        mg_http_reply(c, 200, "Content-Type: application/json\r\n", "{\"error\": \"user_not_found\"}\n");
        return;
      }

      // User exists, get their ID
      int userId = usernameToId[username];
      log_api(true, "User '%s' signed in with ID: %d\n", username.c_str(), userId);
      mg_http_reply(c, 200, "Content-Type: application/json\r\n", "{\"status\": \"success\", \"userId\": %d}\n", userId);
      return;
    }

    if (mg_match(hm->uri, mg_str("/api/userData"), NULL)) {
      if (!mg_match(hm->method, mg_str("POST"), NULL)) {
        mg_http_reply(c, 405, "", "{\"error\": \"Method not allowed\"}\n");
        return;
      }

      double user_id_double;
      if (mg_json_get_num(hm->body, "$.userId", &user_id_double) == 0) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n",
                      "{\"error\": \"Missing userId\"}\n");
        return;
      }
      int user_id = (int)user_id_double;

      User* user = idToUser[user_id];
      if (!user) {
        mg_http_reply(c, 404, "Content-Type: application/json\r\n",
                      "{\"error\": \"User not found\"}\n");
        return;
      }

      const auto& stockQuantities = user->getPortfolio().stockQuantities;
      string json_str = "[";
      bool first = true;
      for (const auto& pair : stockQuantities) {
        const string& symbol = pair.first;
        int shares = pair.second;

        if (shares <= 0) continue;

        if (!first) {
            json_str += ",";
        }
        first = false;

        Stock* stock = market.getStock(symbol);
        double pricePerShare = stock ? stock->getLastTradedPrice() : 0.0;
        
        if (pricePerShare == 0.0) {
            pricePerShare = 100.0; 
        }

        double totalValue = shares * pricePerShare;
        string companyName = symbolToCompany.count(symbol) ? symbolToCompany[symbol] : "";

        char buffer[1024];
        mg_snprintf(buffer, sizeof(buffer),
            "{%m:%m,%m:%m,%m:%m,%m:%d,%m:%g,%m:%g,%m:%g,%m:%g}",
            MG_ESC("id"), MG_ESC(symbol.c_str()), MG_ESC("symbol"), MG_ESC(symbol.c_str()),
            MG_ESC("company"), MG_ESC(companyName.c_str()), MG_ESC("shares"), shares,
            MG_ESC("totalValue"), totalValue, MG_ESC("pricePerShare"), pricePerShare,
            MG_ESC("change"), 0.0, MG_ESC("changePercent"), 0.0);
        json_str += buffer;
      }
      json_str += "]";
      mg_http_reply(c, 200, "Content-Type: application/json\r\n", "%s", json_str.c_str());
      return;
    }

    if (mg_match(hm->uri, mg_str("/api/buy"), NULL)) {
      if (!mg_match(hm->method, mg_str("POST"), NULL)) {
        mg_http_reply(c, 405, "", "{\"error\": \"Method not allowed\"}\n");
        return; 
      }

      struct OrderRequest req;
      if (!parse_order_request(hm, &req)) {
          mg_http_reply(c, 400, "", "{\"error\": \"Invalid JSON payload\"}\n");
          return;
      }

      log_api(true, "Buy order received: User %lu wants to buy %f shares of %s (%s)\n", 
             (unsigned long)req.user_id, req.shares, req.symbol, req.order_type);

      User* user = idToUser[(int)req.user_id];
      if (!user) {
          mg_http_reply(c, 400, "Content-Type: application/json\r\n", 
                        "{\"error\": \"User not found\"}\n");
          return;
      }

      // Get the stock from market
      Stock* stock = market.getStock(string(req.symbol));
      if (stock == NULL) {
          mg_http_reply(c, 400, "Content-Type: application/json\r\n", 
                        "{\"error\": \"Stock not found\"}\n");
          return;
      }

      // Create a new order
      Order* newOrder = new Order();
      newOrder->id = nextOrderId++;
      newOrder->user = user;
      newOrder->ticker = string(req.symbol);
      newOrder->buyOrSell = BUY;
      newOrder->status = PENDING;
      newOrder->price = req.price;
      if (req.price == 0) { // Market order, make it aggressive
          newOrder->price = std::numeric_limits<double>::max();
      }
      newOrder->quantity = (int)req.shares;
      newOrder->initialQuantity = (int)req.shares;
      newOrder->timestamp = time(NULL);
      newOrder->totalValue = 0;
      newOrder->executionPrice = 0;

      // Place the order in market and match
      if (market.placeOrder(newOrder)) {
        user->addOrder(newOrder);
        mg_http_reply(c, 200, "Content-Type: application/json\r\n", 
                      "{\"status\": \"success\", \"message\": \"Buy order placed\"}\n");
      } else {
        mg_http_reply(c, 500, "Content-Type: application/json\r\n", 
                      "{\"error\": \"Failed to place order\"}\n");
      }
      return;
    }

    if (mg_match(hm->uri, mg_str("/api/sell"), NULL)) {
      if (!mg_match(hm->method, mg_str("POST"), NULL)) {
        mg_http_reply(c, 405, "", "{\"error\": \"Method not allowed\"}\n");
        return; 
      }

      struct OrderRequest req;
      if (!parse_order_request(hm, &req)) {
          mg_http_reply(c, 400, "", "{\"error\": \"Invalid JSON payload\"}\n");
          return;
      }

      log_api(true, "Sell order received: User %lu wants to sell %f shares of %s (%s)\n", 
             (unsigned long)req.user_id, req.shares, req.symbol, req.order_type);

      User* user = idToUser[(int)req.user_id];
      if (!user) {
          mg_http_reply(c, 400, "Content-Type: application/json\r\n", 
                        "{\"error\": \"User not found\"}\n");
          return;
      }

      // Get the stock from market
      Stock* stock = market.getStock(string(req.symbol));
      if (stock == NULL) {
          mg_http_reply(c, 400, "Content-Type: application/json\r\n", 
                        "{\"error\": \"Stock not found\"}\n");
          return;
      }

      // Create a new order
      Order* newOrder = new Order();
      newOrder->id = nextOrderId++;
      newOrder->user = user;
      newOrder->ticker = string(req.symbol);
      newOrder->buyOrSell = SELL;
      newOrder->status = PENDING;
      newOrder->price = req.price;
      newOrder->quantity = (int)req.shares;
      newOrder->initialQuantity = (int)req.shares;
      newOrder->timestamp = time(NULL);
      newOrder->totalValue = 0;
      newOrder->executionPrice = 0;

      // Place the order in market and match
      if (market.placeOrder(newOrder)) {
        user->addOrder(newOrder);
        mg_http_reply(c, 200, "Content-Type: application/json\r\n", 
                      "{\"status\": \"success\", \"message\": \"Sell order placed\"}\n");
      } else {
        mg_http_reply(c, 500, "Content-Type: application/json\r\n", 
                      "{\"error\": \"Failed to place order\"}\n");
      }
      return;
    }

    if (mg_match(hm->uri, mg_str("/api/transactions"), NULL)) {
      if (!mg_match(hm->method, mg_str("POST"), NULL)) {
        mg_http_reply(c, 405, "", "{\"error\": \"Method not allowed\"}\n");
        return;
      }

      double user_id_double;
      if (mg_json_get_num(hm->body, "$.userId", &user_id_double) == 0) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n",
                      "{\"error\": \"Missing userId\"}\n");
        return;
      }
      int user_id = (int)user_id_double;

      User* user = idToUser[user_id];
      if (!user) {
        mg_http_reply(c, 404, "Content-Type: application/json\r\n",
                      "{\"error\": \"User not found\"}\n");
        return;
      }

      const vector<Order*>& orders = user->getOrders();
      string json_str = "[";
      for (size_t i = 0; i < orders.size(); ++i) {
          Order* order = orders[i];
          if (i > 0) json_str += ",";
          
          const char* action = (order->buyOrSell == BUY) ? "buy" : "sell";
          
          bool isMarket = (order->price == 0 || (order->buyOrSell == BUY && order->price == std::numeric_limits<double>::max()));
          const char* orderType = isMarket ? "market" : "limit";

          const char* status_str;
          switch(order->status) {
            case PENDING: status_str = "pending"; break;
            case EXECUTED: status_str = "executed"; break;
            case CANCELLED: status_str = "cancelled"; break;
            default: status_str = "unknown";
          }

          double balanceChange = 0;
          if (order->status == EXECUTED) {
            balanceChange = order->totalValue;
            if (order->buyOrSell == BUY) balanceChange = -balanceChange;
          }
          
          char buffer[1024];
          int amount = (order->status == EXECUTED) ? order->initialQuantity : order->quantity;
          string order_id_str = to_string(order->id);
          mg_snprintf(buffer, sizeof(buffer),
              "{%m:%m,%m:%m,%m:%m,%m:%g,%m:%d,%m:%m,%m:%m,%m:%lld,%m:%m}",
              MG_ESC("id"), MG_ESC(order_id_str.c_str()), MG_ESC("action"), MG_ESC(action),
              MG_ESC("orderType"), MG_ESC(orderType), MG_ESC("balanceChange"), balanceChange,
              MG_ESC("amountBoughtSold"), amount, MG_ESC("symbol"), MG_ESC(order->ticker.c_str()),
              MG_ESC("company"), MG_ESC(""), MG_ESC("timestamp"), order->timestamp,
              MG_ESC("status"), MG_ESC(status_str));
          json_str += buffer;
      }
      json_str += "]";
      mg_http_reply(c, 200, "Content-Type: application/json\r\n", "%s", json_str.c_str());
      return;
    }

    if (mg_match(hm->uri, mg_str("/api/cancel"), NULL)) {
      if (!mg_match(hm->method, mg_str("POST"), NULL)) {
        mg_http_reply(c, 405, "", "{\"error\": \"Method not allowed\"}\n");
        return; 
      }

      double user_id_double;
      if (mg_json_get_num(hm->body, "$.userId", &user_id_double) == 0) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n", "{\"error\": \"Missing userId\"}\n");
        return;
      }
      int user_id = (int)user_id_double;

      double order_id_double;
      if (mg_json_get_num(hm->body, "$.orderId", &order_id_double) == 0) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n", "{\"error\": \"Missing orderId\"}\n");
        return;
      }
      int order_id_to_cancel = (int)order_id_double;

      log_api(true, "Cancel order received: User %d wants to cancel order %d\n", user_id, order_id_to_cancel);

      User* user = idToUser[user_id];
      if (!user) {
        mg_http_reply(c, 404, "Content-Type: application/json\r\n", "{\"error\": \"User not found\"}\n");
        return;
      }

      Order* order_to_cancel = nullptr;
      for (auto* order : user->getOrders()) {
          if (order->id == order_id_to_cancel) {
              order_to_cancel = order;
              break;
          }
      }

      if (!order_to_cancel || order_to_cancel->status != PENDING) {
          mg_http_reply(c, 400, "Content-Type: application/json\r\n", "{\"error\": \"Order not pending or not found\"}\n");
          return;
      }

      Stock* stock = market.getStock(order_to_cancel->ticker);
      if (stock) stock->cancelOrder(order_to_cancel);
      
      mg_http_reply(c, 200, "Content-Type: application/json\r\n", 
                    "{\"status\": \"success\", \"message\": \"Cancel order processed\"}\n");
      return;
    }

    if (mg_match(hm->uri, mg_str("/api/balance"), NULL)) {
      if (!mg_match(hm->method, mg_str("POST"), NULL)) {
        mg_http_reply(c, 405, "", "{\"error\": \"Method not allowed\"}\n");
        return; 
      }

      double user_id;
      if (mg_json_get_num(hm->body, "$.userId", &user_id) == 0) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n", 
                      "{\"error\": \"Missing userId\"}\n");
        return;
      }

      User* user = idToUser[(int)user_id];
      if (!user) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n", 
                      "{\"error\": \"User not found\"}\n");
        return;
      }

      double balance = user->getPortfolio().balance;
      mg_http_reply(c, 200, "Content-Type: application/json\r\n", 
                    "{\"balance\": %.2f}\n", balance);
      return;
    }

    if (mg_match(hm->uri, mg_str("/api/updateBalance"), NULL)) {
      if (!mg_match(hm->method, mg_str("POST"), NULL)) {
        mg_http_reply(c, 405, "", "{\"error\": \"Method not allowed\"}\n");
        return;
      }

      double user_id_double;
      if (mg_json_get_num(hm->body, "$.userId", &user_id_double) == 0) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n",
                      "{\"error\": \"Missing userId\"}\n");
        return;
      }
      int user_id = (int)user_id_double;

      double amount_to_add;
      if (mg_json_get_num(hm->body, "$.amount", &amount_to_add) == 0) {
        mg_http_reply(c, 400, "Content-Type: application/json\r\n",
                      "{\"error\": \"Missing amount\"}\n");
        return;
      }

      User* user = idToUser[user_id];
      if (!user) {
        mg_http_reply(c, 404, "Content-Type: application/json\r\n", "{\"error\": \"User not found\"}\n");
        return;
      }

      user->getPortfolio().balance += amount_to_add;
      log_api(true, "Updated balance for user %d by %.2f. New balance: %.2f\n", user_id, amount_to_add, user->getPortfolio().balance);
      mg_http_reply(c, 200, "Content-Type: application/json\r\n",
                    "{\"balance\": %.2f}\n", user->getPortfolio().balance);
      return;
    }

    // If they just go to domain then serve the app
    struct mg_http_serve_opts opts = {0};
    
    // the output folder generated by npm run build
    opts.root_dir = "frontend/dist"; 
    
    // If a user refreshes on a custom React route (e.g., /about), 
    // return to base react app so react router can handle it
    opts.page404 = "frontend/dist/index.html";
    
    // actually serve the requested resource 
    mg_http_serve_dir(c, hm, &opts);
  }
}


int main() {
  // Initialize logging
  logFile = fopen("api_usage.log", "a");
  if (!logFile) {
    printf("ERROR: Could not open api_usage.log for writing\n");
  } else {
    fprintf(logFile, "========== Market Server Started ==========\n");
    fflush(logFile);
    printf("Log file opened successfully at api_usage.log\n");
    log_api(true, "Server initialization logging started\n");
  }
  
  // Initialize market, stocks, users
  
  initialize_company_data();
  
  // Add template stocks from frontend
  market.addStock("SPY");
  market.addStock("QQQ");
  market.addStock("IWM");
  market.addStock("VTI");
  market.addStock("VOO");
  market.addStock("EFA");
  market.addStock("EEM");
  market.addStock("GLD");
  market.addStock("BND");
  market.addStock("ARKK");
  market.addStock("XLF");

  // Initialize company users for each stock to provide initial liquidity.
  // Each "company" will own all of its stock and be ready to sell it.
  vector<string> tickers = {"SPY", "QQQ", "IWM", "VTI", "VOO", "EFA", "EEM", "GLD", "BND", "ARKK", "XLF"};
  double initial_price = 100.0;
  int initial_shares = 1000000;

  log_api(true, "Initializing market with company accounts and liquidity...\n");
  for (const string& ticker : tickers) {
      string company_username = ticker + "_COMPANY";
      market.addUser(User(company_username));
      User* company_user = market.getUser(company_username);
      if (company_user) {
          // Give the company a lot of shares and money
          company_user->getPortfolio().addShares(ticker, initial_shares);
          company_user->getPortfolio().balance = 1000000000; // 1 billion dollars

          // Create a standing sell order to provide liquidity, like an IPO
          Order* sellOrder = new Order();
          sellOrder->id = nextOrderId++;
          sellOrder->user = company_user;
          sellOrder->ticker = ticker;
          sellOrder->buyOrSell = SELL;
          sellOrder->status = PENDING;
          sellOrder->price = initial_price; // Initial "IPO" price
          sellOrder->quantity = initial_shares;
          sellOrder->initialQuantity = initial_shares;
          sellOrder->timestamp = time(NULL);
          sellOrder->totalValue = 0;
          sellOrder->executionPrice = 0;

          market.placeOrder(sellOrder);
          log_api(true, "\t- Created %s with %d shares at $%.2f\n", company_username.c_str(), initial_shares, initial_price);
      }
  }

  //START WEB SERVER
  struct mg_mgr mgr;  
  mg_mgr_init(&mgr);  
  mg_http_listen(&mgr, "http://0.0.0.0:8000", ev_handler, NULL);
  for (;;) {
    mg_mgr_poll(&mgr, 1000);  
  }
  return 0;

  
}