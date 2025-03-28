import React, { useEffect, useState } from "react";
import axios from "axios";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8003/api/products/") // Gọi API từ API Gateway
            .then(response => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi khi gọi API:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h2>Danh sách sản phẩm</h2>
            {loading ? <p>Đang tải...</p> : (
                <ul>
                    {products.map(product => (
                        <li key={product.id}>{product.name} - {product.price} VND</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Products;
