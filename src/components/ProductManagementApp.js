import React, { useState, useEffect, useCallback, useRef } from "react";
import { Row, Button, Modal, Form, Card } from "react-bootstrap";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import icon from "../images/6-dots.png"
import edit from "../images/edit.png"
import context from "react-bootstrap/esm/AccordionContext";

// Configuration Constants
const API_CONFIG = {
  BASE_URL: "https://stageapi.monkcommerce.app/task/products/search?",
  KEY: "72njgfa948d9aS7gs5", // Note: Replace with actual API key
  PAGINATION_LIMIT: 10,
};

/**
 * DraggableProduct Component
 * Renders an individual product row with drag-and-drop functionality
 *
 * @param {Object} props - Component props
 * @param {Object} props.product - Product details
 * @param {number} props.index - Product index in the list
 * @param {Function} props.moveProduct - Function to reorder products
 * @param {Function} props.removeProduct - Function to remove a product
 */

const DraggableProduct = ({
  product,
  index,
  moveProduct,
  removeProduct,
  openProductPicker,
  editingIndex,
  removeProducts,
  lengthofItems,
}) => {
  const [, ref] = useDrag({ type: "PRODUCT", item: { index } });
  const [, drop] = useDrop({
    accept: "PRODUCT",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveProduct(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  // State to toggle variant visibility
  const [showVariants, setShowVariants] = useState(false);

  return (
    <>
      {/* Main Product Row */}
      <tr
        ref={(node) => ref(drop(node))}
        className="mb-2 d-table w-80 position-relative bg-transparent"
      >
        <td className="text-nowrap px-2 me-1 shadow-none border-0 bg-transparent">
          <span className="d-flex align-items-center p-2 ">
            <img src={icon} alt="Product Icon" className="me-2" /> {index + 1}.
          </span>
        </td>
        {/* Product Title and Edit Button */}
        <td className="text-nowrap border-0 px-2 w-50 bg-transparent">
          <div className="p-2 d-flex justify-content-between product-title"> <span className="product-text">
            {product.title}
          </span>
            <button className="btn p-0 d-flex" onClick={() => openProductPicker(index)}>
              <img src={edit} alt="Product Icon" className="me-2" />
            </button></div>
        </td>
        {/* Discount Input Section */}
        <td className="discount-input-wrapper px-2 border-0">
          {product.id !== "001" ? (
            <div className="w-100">
              <input className="w-30 discount-inputfeild p-1 border-0 me-3" />
              <select className="w-50 border-0 p-1 discount-select">
                <option>%off</option>
                <option>flat</option>
              </select>
            </div>
          ) : (
            <Button
              variant="outline-primary"
              className="me-2 p-1 px-3 w-100 addiscount-btn"
              onClick={() => openProductPicker(index)}
            >
              Add Discount
            </Button>
          )}
        </td>

        {/* Variants Toggle Button */}
        <div className={`justify-content-end w-100 text-end varints-btn bg-transparent ${product.id !== '001' ? '' : 'p-0'}`}>
          <button
            className={`border-0 bg-transparent text-primary show-variants-btn  ${product.id === "001" ? "d-none" : ""
              }`}
            variant="outline-info"
            onClick={() => setShowVariants(!showVariants)}
          >
            {showVariants ? (
              <>
                Hide Variants<i className="fa-solid fa-angle-up"></i>
              </>
            ) : (
              <>
                Show Variants<i className="fa-solid fa-angle-down"></i>
              </>
            )}
          </button>
        </div>

        {/* Remove Product Button (Hidden if only one product) */}
        <Button
          variant=""
          className={`me-2 position-absolute cancel-icon bg-transparent ${lengthofItems <= 1 ? "d-none" : "d-block"
            }`}
          onClick={() => removeProduct(index)}
        >
          <i className="fa-solid fa-xmark"></i>
        </Button>
      </tr>
      {/* Variants Rows */}
      {showVariants &&
        product.variants.map((variant, varIndex) => (
          <tr
            ref={(node) => ref(drop(node))}
            key={varIndex}
            className="mb-3 d-table w-80 position-relative ms-4 border-0"
          >
            <td className="text-nowrap px-2 me-1 shadow-none border-0 bg-transparent">
              <span className="d-flex align-items-center p-2 ">
                <img src={icon} alt="Product Icon" className="me-2" /> {varIndex + 1}.
              </span>
            </td>
            <td className="bg-transparent text-nowrap w-50 variant-title border-0 bg-transparent">
              <div className="p-2 d-flex justify-content-between product-title"> <span className="product-text">
                {variant.title}
              </span>
              </div>
            </td>
            <td className="bg-transparent w-50 p-2 border-0 d-flex w-100">
              <div className="w-100">
                <input className="w-30 discount-inputfeild p-1 border-0 me-2" />
                <select className="w-50 border-0 p-1 discount-select">
                  <option>%off</option>
                  <option>flat</option>
                </select>
              </div>
            </td>
            <Button
              variant=""
              className="me-2 position-absolute varinats-cancel-icon bg-transparent"
              onClick={() => removeProducts(index, varIndex)}
            >
              <i className="fa-solid fa-xmark"></i>
            </Button>
          </tr>
        ))}
    </>
  );
};

/**
 * ProductManagementApp Component
 * Main component for managing product selection, reordering, and discounts
 */
function ProductManagementApp() {
  // State Management
  const [products, setProducts] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [previouslySelectedVariants, setPreviouslySelectedVariants] = useState(
    []
  );
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Refs for component lifecycle and scroll management
  const isMountedRef = useRef(false);
  const modalBodyRef = useRef(null);

  // Function to update filtered products based on search term
  const updateFilteredProducts = useCallback(
    (products) => {
      const filtered = products.filter((product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    },
    [searchTerm]
  );

  // Fetch available products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_CONFIG.BASE_URL, {
        params: {
          search: searchTerm,
          page: page,
          limit: API_CONFIG.PAGINATION_LIMIT,
        },
        headers: { "x-api-key": API_CONFIG.KEY },
      });

      // Only update if component is still mounted
      if (!isMountedRef.current) return;

      // Process fetched products with variant selection tracking
      const fetchedProducts = response.data.map((product) => ({
        id: product.id,
        title: product.title,
        vendor: product.vendor,
        handle: product.handle,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          title: variant.title,
          price: variant.price,
          selected: previouslySelectedVariants.some(
            (prevVariant) => prevVariant.id === variant.id
          ),
        })),
        image: product.image.src,
      }));

      // Update product availability and pagination
      setHasMore(fetchedProducts.length > 0);
      setAvailableProducts((prevProducts) => [
        ...prevProducts,
        ...fetchedProducts,
      ]);
      updateFilteredProducts(fetchedProducts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  }, [
    searchTerm,
    page,
    previouslySelectedVariants,
    updateFilteredProducts,
  ]);

  // Lifecycle and data fetching management
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update filtered products when search term changes
  useEffect(() => {
    updateFilteredProducts(availableProducts);
  }, [searchTerm, availableProducts, updateFilteredProducts]);

  // Handle scroll pagination
  const handleScroll = useCallback(() => {
    const modalBody = modalBodyRef.current;
    if (!modalBody) return;

    // Check if scrolled to bottom
    const isAtBottom =
      modalBody.scrollHeight - modalBody.scrollTop <=
      modalBody.clientHeight + 20;

    if (isAtBottom && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, loading]);
  // Lifecycle and data fetching management
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounce search to reduce unnecessary API calls
  const handleSearch = useCallback(
    (term) => {
      setSearchTerm(term);
      setPage(1); // Reset page when searching
      setAvailableProducts([]); // Clear previous products
      setHasMore(true); // Reset has more flag
      fetchProducts(); // Fetch new products based on search term
    },
    [fetchProducts]
  );

  // Move product in the list
  const moveProduct = useCallback((fromIndex, toIndex) => {
    setProducts((prevProducts) => {
      const newProducts = [...prevProducts];
      const [movedProduct] = newProducts.splice(fromIndex, 1);
      newProducts.splice(toIndex, 0, movedProduct);
      return newProducts;
    });
  }, []);

  // Add empty product
  const addEmptyProduct = () => {
    setProducts([
      ...products,
      {
        title: "Select Product",
        id: "001",
      },
    ]);
  };

  // Remove a product
  const removeProduct = (index) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const removeProducts = (productIndex, variantIndex) => {
    const newProducts = [...products];
    newProducts[productIndex].variants = newProducts[
      productIndex
    ].variants.filter((_, i) => i !== variantIndex);
    setProducts(newProducts);
  };

  // Modify openProductPicker to capture previously selected variants
  const openProductPicker = (index) => {
    const currentProduct = products[index];
    const currentlySelectedVariants = currentProduct.variants || [];

    // Store these as previously selected variants
    setPreviouslySelectedVariants(currentlySelectedVariants);

    setEditingIndex(index);
    setAvailableProducts([]); // Reset products
    setPage(1); // Reset page
    setHasMore(true); // Reset has more flag
    fetchProducts(); // Fetch products with previous selection
    setShowProductPicker(true);
  };

  // Modify handleProductSelect to work with persistent selection
  const handleProductSelect = (isChecked, product) => {
    const updatedProducts = availableProducts.map((p) => {
      if (p.id === product.id) {
        return {
          ...p,
          variants: p.variants.map((variant) => ({
            ...variant,
            selected: isChecked,
          })),
        };
      }
      return p;
    });

    setAvailableProducts(updatedProducts);

    // Update selected variants
    setSelectedVariants((prevSelected) => {
      if (isChecked) {
        // Add all variants of this product
        const productsVariants = product.variants;
        return [...new Set([...prevSelected, ...productsVariants])];
      } else {
        // Remove all variants of this product
        return prevSelected.filter(
          (variant) => !product.variants.some((v) => v.id === variant.id)
        );
      }
    });
  };

  // Modify handleVariantSelect to update both availableProducts and selectedVariants
  const handleVariantSelect = (isChecked, product, variant) => {
    // Update availableProducts to reflect variant selection
    const updatedProducts = availableProducts.map((p) => {
      if (p.id === product.id) {
        return {
          ...p,
          variants: p.variants.map((v) =>
            v.id === variant.id ? { ...v, selected: isChecked } : v
          ),
        };
      }
      return p;
    });

    setAvailableProducts(updatedProducts);

    // Update selectedVariants
    setSelectedVariants((prevSelected) => {
      if (isChecked) {
        return [...prevSelected, variant];
      } else {
        return prevSelected.filter((v) => v.id !== variant.id);
      }
    });
  };

  // Function to handle canceling the selection
  const handleCancel = () => {
    setSelectedVariants([]);
    setShowProductPicker(false);
  };

  // Function to handle adding selected variants
  const handleAdd = () => {
    // Convert selected variants to full products
    const selectedProducts = selectedVariants.reduce((acc, variant) => {
      const product = availableProducts.find((p) =>
        p.variants.some((v) => v.id === variant.id)
      );

      if (product) {
        const existingProductIndex = acc.findIndex((p) => p.id === product.id);

        if (existingProductIndex === -1) {
          // Create a new product with only the selected variant
          acc.push({
            ...product,
            variants: [variant],
          });
        } else {
          // Add variant to existing product
          acc[existingProductIndex].variants.push(variant);
        }
      }

      return acc;
    }, []);

    // Update products list
    const newProducts = [...products];
    newProducts.splice(editingIndex, 1, ...selectedProducts);
    setProducts(newProducts);

    // Reset states
    setSelectedVariants([]);
    setShowProductPicker(false);
  };

  // Function to count selected variants
  const countSelectedVariants = useCallback(() => {
    return availableProducts.reduce((count, product) => {
      return (
        count + product.variants.filter((variant) => variant.selected).length
      );
    }, 0);
  }, [availableProducts]);

  // Example usage of countSelectedVariants
  useEffect(() => {
    const count = countSelectedVariants();
    setSelectedCount(count);
    console.log(`Number of selected variants: ${count}`);
  }, [selectedVariants, countSelectedVariants]);

  // Throttle function
  const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function (...args) {
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      }
      else {
        clearTimeout(lastFunc);
        setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now()
          }
        }, limit - (Date.now() - lastRan));
      }
    }
  };
  // throttle the handleSeacrch function 
  const throttleHandleSearch = useCallback(throttle(handleSearch, 300), [handleSearch]);
  return (
    <DndProvider backend={HTML5Backend}>
      {/* Product List */}
      {products.map((product, index) => (
        <DraggableProduct
          key={index}
          product={product}
          index={index}
          moveProduct={moveProduct}
          removeProduct={removeProduct}
          openProductPicker={openProductPicker}
          editingIndex={editingIndex}
          removeProducts={removeProducts}
          lengthofItems={products.length}
        />
      ))}

      {/* Add Product Button */}
      <div className="w-80 d-flex justify-content-end ">
        <Button className="addproduct-btn px-3" onClick={addEmptyProduct}>
          Add Product
        </Button>
      </div>

      {/* Product Picker Modal */}
      <Modal
        show={showProductPicker}
        onHide={() => setShowProductPicker(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Products</Modal.Title>
        </Modal.Header>
        <Modal.Body
          ref={modalBodyRef}
          onScroll={handleScroll}
          style={{
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          <Form.Control
            type="text"
            placeholder="Search products"
            value={searchTerm}
            onChange={(e) => throttleHandleSearch(e.target.value)}
            className="mb-3"
          />
          {filteredProducts.map((product) => {
            const anyVariantSelected = product.variants.some(
              (variant) => variant.selected
            );
            const allVariantsSelected = product.variants.every(
              (variant) => variant.selected
            );

            return (
              <Card key={product.id} className="mb-2 border-0">
                <Card.Body className="py-0">
                  <Row>
                    <div className="d-flex align-items-center mb-2">
                      <input
                        type="checkbox"
                        id={`product-${product.id}`}
                        className="me-2"
                        checked={allVariantsSelected || anyVariantSelected}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          handleProductSelect(isChecked, product);
                          product.variants.forEach((variant) => {
                            variant.selected = isChecked;
                          });
                          setSelectedVariants(
                            isChecked ? product.variants : []
                          );
                        }}
                      />
                      {product.image && (
                        <img
                          src={product.image}
                          alt=""
                          className="me-2"
                          style={{ maxWidth: "20px" }}
                        />
                      )}
                      <label htmlFor={`product-${product.id}`}>
                        {product.title}
                      </label>
                    </div>
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="d-flex align-items-center mb-2 justify-content-between ps-3"
                      >
                        <div style={{ display: "flex" }}>
                          <input
                            type="checkbox"
                            id={`variant-${variant.id}`}
                            className="me-2"
                            checked={variant.selected}
                            onChange={(e) =>
                              handleVariantSelect(
                                e.target.checked,
                                product,
                                variant
                              )
                            }
                          />
                          <div> {variant.title} </div>
                        </div>
                        <label htmlFor={`variant-${variant.id}`}>
                          <div className="d-flex">
                            {/* <div>{variant.avalible} Avalible</div> */}
                            <div className="ps-3">${variant.price}</div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            );
          })}
          {/* Loading indicator */}
          {loading && (
            <div className="text-center my-3">
              <span>Loading more products...</span>
            </div>
          )}

          {/* End of results indicator */}
          {!hasMore && availableProducts.length > 0 && (
            <div className="text-center my-3">
              <span>No more products to load</span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <div>{selectedCount} product selected</div>
          <div className="d-flex ">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="success" className="ms-2" onClick={handleAdd}>
              Add
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </DndProvider>

  );
}

export default ProductManagementApp;
