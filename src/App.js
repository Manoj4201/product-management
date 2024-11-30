import "./App.css";
import ProductList from "../src/components/ProductList";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<ProductList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
