import React from "react";
import ProductManagementApp from "./ProductManagementApp"
 
const ProductList = () => {
  return (
    <div>
         <h1>Product Management</h1>
      <table className="table d-table w-100 m-3">
        <thead className="d-table w-100">
          <tr >
            <th className="bg-transparent border-0">Product</th>
            <th className="bg-transparent border-0">Discount</th>
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
