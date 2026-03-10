#include "mongoose_dependencies/mongoose.h"
using namespace std;
#include "stock.h"
#include "user.h"
#include "order.h"
#include "market.h"
#include <ctime>
#include <fstream>

struct OrderRequest {
    char symbol[16];
    char order_type[16];
    double shares;
    double user_id;
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
static unordered_map<string, int> usernameToId;
static unordered_map<int, User*> idToUser;

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

    // Basic safety check: ensure the required fields actually exist
    if (req->shares <= 0 || req->user_id == 0 || req->symbol[0] == '\0') {
        return false;
    }

    return true;
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
      
      // Validate body
      if (hm->body.len == 0) {
        log_api(true, "\tError: Empty request body\n");
        mg_http_reply(c, 400, "Content-Type: application/json\r\n", 
                      "{\"error\": \"Empty request body\"}\n");
        return;
      }
      
      log_api(true, "\tBody size: %lu, Body: %.*s\n", (unsigned long)hm->body.len, 
             (int)hm->body.len, hm->body.buf);
      
      // Parse username from JSON body
      char *username_ptr = mg_json_get_str(hm->body, "$.name");
      if (!username_ptr) {
        log_api(true, "\tError: Failed to parse username from JSON\n");
        mg_http_reply(c, 400, "Content-Type: application/json\r\n", 
                      "{\"error\": \"Missing username\"}\n");
        return;
      }
      
      log_api(true, "\tParsed username_ptr: %p\n", (void*)username_ptr);
      
      char username_buffer[256];
      memset(username_buffer, 0, sizeof(username_buffer));
      snprintf(username_buffer, sizeof(username_buffer) - 1, "%s", username_ptr);
      username_buffer[sizeof(username_buffer) - 1] = '\0';
      
      log_api(true, "\tUsername buffer: '%s'\n", username_buffer);
      
      string username(username_buffer);
      log_api(true, "\tString username created: '%s'\n", username.c_str());
      
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

      // Validate body
      if (hm->body.len == 0) {
        log_api(true, "\tError: Empty request body\n");
        mg_http_reply(c, 400, "Content-Type: application/json\r\n",
                      "{\"error\": \"Empty request body\"}\n");
        return;
      }

      log_api(true, "\tBody size: %lu, Body: %.*s\n", (unsigned long)hm->body.len,
              (int)hm->body.len, hm->body.buf);

      // Parse username from JSON body
      char *username_ptr = mg_json_get_str(hm->body, "$.name");
      if (!username_ptr) {
        log_api(true, "\tError: Failed to parse username from JSON\n");
        mg_http_reply(c, 400, "Content-Type: application/json\r\n",
                      "{\"error\": \"Missing username\"}\n");
        return;
      }

      char username_buffer[256];
      memset(username_buffer, 0, sizeof(username_buffer));
      snprintf(username_buffer, sizeof(username_buffer) - 1, "%s", username_ptr);
      username_buffer[sizeof(username_buffer) - 1] = '\0';

      string username(username_buffer);
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
      newOrder->user = user;
      newOrder->ticker = string(req.symbol);
      newOrder->buyOrSell = BUY;
      newOrder->status = PENDING;
      newOrder->price = 0; // Market order
      newOrder->quantity = (int)req.shares;
      newOrder->timestamp = time(NULL);

      // Place the order in market and match
      if (market.placeOrder(newOrder)) {
        market.matchTicker(string(req.symbol));
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
      newOrder->user = user;
      newOrder->ticker = string(req.symbol);
      newOrder->buyOrSell = SELL;
      newOrder->status = PENDING;
      newOrder->price = 0; // Market order
      newOrder->quantity = (int)req.shares;
      newOrder->timestamp = time(NULL);

      // Place the order in market and match
      if (market.placeOrder(newOrder)) {
        market.matchTicker(string(req.symbol));
        mg_http_reply(c, 200, "Content-Type: application/json\r\n", 
                      "{\"status\": \"success\", \"message\": \"Sell order placed\"}\n");
      } else {
        mg_http_reply(c, 500, "Content-Type: application/json\r\n", 
                      "{\"error\": \"Failed to place order\"}\n");
      }
      return;
    }

    if (mg_match(hm->uri, mg_str("/api/cancel"), NULL)) {
      if (!mg_match(hm->method, mg_str("POST"), NULL)) {
        mg_http_reply(c, 405, "", "{\"error\": \"Method not allowed\"}\n");
        return; 
      }

      struct OrderRequest req;
      if (!parse_order_request(hm, &req)) {
          mg_http_reply(c, 400, "", "{\"error\": \"Invalid JSON payload\"}\n");
          return;
      }

      log_api(true, "Cancel order received: User %lu wants to cancel orders for %s\n", 
             (unsigned long)req.user_id, req.symbol);

      // Get the stock from market
      Stock* stock = market.getStock(string(req.symbol));
      if (stock == NULL) {
          mg_http_reply(c, 400, "Content-Type: application/json\r\n", 
                        "{\"error\": \"Stock not found\"}\n");
          return;
      }

      // Note: Actual cancel logic would require finding specific orders by user_id
      // and marking them as CANCELLED. Implementation depends on how orders are tracked.
      // For now, return success as the infrastructure is being built.
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

  //START WEB SERVER
  struct mg_mgr mgr;  
  mg_mgr_init(&mgr);  
  mg_http_listen(&mgr, "http://0.0.0.0:8000", ev_handler, NULL);
  for (;;) {
    mg_mgr_poll(&mgr, 1000);  
  }
  return 0;

  
}