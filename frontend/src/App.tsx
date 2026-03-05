import { BrowserRouter, Routes, Route} from 'react-router-dom'; 
import {Home} from "./pages/Home"; 
import {Selection} from "./pages/Selection"; 
import {Transaction} from "./pages/Transaction"; 
import Header from "./components/Header"; 
import "./App.css"; 

function App() {
  return (
    <>
      <BrowserRouter>
        <Header/>
        <Routes>
          <Route path="/" element={<Home />}/> 
          <Route path="/selection" element={<Selection />}/>
          <Route path="/transaction" element={<Transaction />}/> 
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
