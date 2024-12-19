import React from "react";
import ProductManagementApp from "./ProductManagementApp";

const ProductList = () => {
  return (
    <div>
      <h1>Add Product</h1>
      <table className="table d-table w-100 m-3" cellSpacing="10px">
        <thead className="d-table w-100">
          <tr>
            <th className="border-0 bg-transparent"></th>
            <th className="bg-transparent border-0">Product</th>
            <th className="bg-transparent border-0">Discount</th>
            <th className="border-0 bg-transparent"></th>

          </tr>
        </thead>
        <tbody className="d-table w-100">
          <ProductManagementApp />
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
