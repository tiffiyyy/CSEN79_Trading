import {useState} from "react"
import { Link } from "react-router-dom";
import "./Selection.css";
import type { numberNode } from "@google/model-viewer/lib/styles/parsers";

export function Selection() {
    const trade = ['-', 'x', 'y', 'z']; 
    const account = ['-', 1, 2, 3]; 
    const action = ['-', "Buy", "Sell", "Cancel"]; 
    const shares = ['-']; 
    const order = ['-', "Limit Order", "Market Order", "Cancel Order"]; 
    const [selectedTrade, setSelectedTrade] = useState('-'); 
    const [selectedAccount, setSelectedAccount] = useState('-'); 
    const [selectedAction, setSelectedAction] = useState('-'); 
    const [selectedShares, setSelectedShares] = useState('-'); 
    const [selectedOrder, setSelectedOrder] = useState('-'); 
    const [numShares, setNumShares] = useState('-'); 
    const [etf, setETF] = useState('-'); 

    return (
        <>
        <div className="page">
            {/* Note: is this going to be a react component that will accessed 
                through each stock page? or will they be able to select a stock and buy here */}

            {/* Create an [id].tsx that will return all information about selected stock. 
                This page will be for orders to be purchased. Button will activate transaction. */}
            
            {/* Button will activate transaction. Calculation will be based on value from [id].tsx */}
            <h2>Buy Stocks</h2>
            <div className="account-box">
                <div className="selections">
                    <p>TRADE</p>
                    <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)}>
                        {trade.map((trade) => (
                            <option key={trade} value={trade}>
                                {trade}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="selections">
                    <p>ACCOUNT</p>
                    <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                        {account.map((account) => (
                            <option key={account} value={account}>
                                {account}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="selections">
                    <div className="search">
                        <p>SEARCH ETF</p>
                        <input
                            type="string" placeholder="-" value={etf} min="1"
                            onChange={(e) => setETF(e.target.value)}
                            className="search-box"
                        />
                    </div>
                </div>
            </div>

            <div className="selections-box">
                <div className="selections">
                    <p>ACTION</p>
                    <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                        {action.map((act) => (
                            <option key={act} value={act}>
                                {act}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="selections">
                    <p>NUM SHARES</p>
                    <input
                        type="number" placeholder="0" value={numShares} min="1"
                        onChange={(e) => setNumShares(e.target.value)}
                        className="numShares"
                    />
                </div>

                <div className="selections">
                    <p>SHARES</p>
                    <select value={selectedShares} onChange={(e) => setSelectedShares(e.target.value)}>
                        {shares.map((shares) => (
                            <option key={shares} value={shares}>
                                {shares}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="selections">
                    <p>ORDER TYPE</p>
                    <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)}>
                        {order.map((order) => (
                            <option key={order} value={order}>
                                {order}
                            </option>
                        ))}
                    </select>
                </div>

            </div>

            <div className="est-value">
                <h2>Estimated Order Value</h2>
                <p>Value Here</p>
                {/* Add a calculation option to display the amounto of stocks being bought */}
                {/* The calculation should auto-update as someone inputs a number; est order val. */}

                {/* Revise to be just the action selected above. */}
                <Link to="/transaction">
                    <button disabled={selectedAction === '-'}>
                        {selectedAction === '-' ? "Select an Action" : selectedAction}
                    </button>
                </Link>
            </div>
        </div>
        </>
    )
}