import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './AdminOrderComponent.css';

// 제품 카테고리 목록
const categoryList = ['와인', '양주', '전통주', '논알콜', '안주'];

const AdminOrderComponent = () => {
    const { category1 } = useParams(); // URL 파라미터에서 카테고리1 값 가져오기
    const [products, setProducts] = useState([]); // 제품 목록 상태
    const [selectedCategory, setSelectedCategory] = useState('와인'); // 선택된 카테고리 상태
    const [quantity, setQuantity] = useState(0); // 발주 수량 상태
    const [showQuantityModal, setShowQuantityModal] = useState(false); // 수량 입력 모달 표시 상태
    const [selectedProductId, setSelectedProductId] = useState(null); // 선택된 제품 ID 상태
    const [adminOrderList, setAdminOrderList] = useState([]); // 관리자 발주 목록 상태
    const [searchProduct, setSearchProduct] = useState(''); // 검색 입력 상태
    const navigate = useNavigate(); // 네비게이션 훅

    // 카테고리가 변경될 때마다 호출
    useEffect(() => {
        if (selectedCategory)
            selectCategory1(selectedCategory);
    }, [selectedCategory]);

    // 선택된 카테고리의 제품을 서버에서 가져오는 함수
    const selectCategory1 = async (category1) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showProductByCategory1/${category1}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const resData = await response.json();
            setProducts(resData);

            // 관리자 발주 목록 초기화
            const newAdminOrderList = resData.map(product => ({
                storeId: 1,
                productId: product.productId,
                InventoryQuantity: 0,
                productName: product.productName
            }));

            setAdminOrderList(newAdminOrderList);
            console.log('Updated Admin Order List:', newAdminOrderList);

        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // 발주 버튼 클릭 시 호출되는 함수
    const handleOrderClick = (productId) => {
        setSelectedProductId(productId);
        setShowQuantityModal(true); // 수량 입력 모달 표시
    };

    // 발주 수량 입력 핸들러
    const handleQuantityChange = (e) => {
        setQuantity(Number(e.target.value)); // 입력된 수량으로 상태 업데이트
    };

    // 발주 처리 함수
    const handleAdminOrder = async () => {
        const storeId = localStorage.getItem("currentStoreId"); // 현재 상점 ID 가져오기
        if (selectedProductId && quantity > 0) {
            const selectedProduct = products.find(product => product.productId === selectedProductId);

            if (!selectedProduct) {
                alert("Product not found."); // 제품이 없으면 알림
                return;
            }

            // 관리자 발주 목록에서 선택된 제품의 수량 업데이트
            const updatedOrderList = adminOrderList.map(item =>
                item.productId === selectedProductId ? { ...item, InventoryQuantity: quantity } : item
            );
            setAdminOrderList(updatedOrderList);

            // 발주 DTO 설정
            const InventoryDTO = {
                storeId,
                productId: selectedProductId,
                quantity: quantity,
                productName: selectedProduct.productName,
                adminOrderQuantity: quantity
            };
            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/updateOrInsertInventory/${storeId}/${selectedProductId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(InventoryDTO)
                });

                const contentType = response.headers.get('Content-Type');
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to place order: ${errorText}`);
                }

                if (contentType && contentType.includes('application/json')) {
                    const jsonResponse = await response.json();
                    console.log('Order placed successfully:', jsonResponse);
                } else {
                    const textResponse = await response.text();
                    console.log('Received non-JSON response:', textResponse);
                }

                setShowQuantityModal(false); // 모달 닫기
                setQuantity(0); // 수량 상태 초기화
            } catch (error) {
                console.error('Error placing order:', error);
            }
        } else {
            alert("Please enter a valid quantity."); // 유효하지 않은 수량 입력 시 알림
        }
    };

    // 제품 정렬 함수
    const handleSortEvent = (e) => {
        const sortOption = e.target.value;
        let sortedProduct = [...products];

        if (sortOption === '낮은가격순') {
            sortedProduct.sort((a, b) => a.price - b.price);
        }
        else if (sortOption === '높은가격순') {
            sortedProduct.sort((a, b) => b.price - a.price);
        }
        else if (sortOption === '신상품순') {
            sortedProduct.sort((a, b) => new Date(b.enrollDate) - new Date(a.enrollDate));
        }
        setProducts(sortedProduct); // 정렬된 제품 목록으로 상태 업데이트
    };

    // 카테고리 클릭 시 호출되는 함수
    const handleCategory1Click = async (category1) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showProductByCategory1/${category1}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const resData = await response.json();
            setProducts(resData); // 선택된 카테고리의 제품 목록으로 상태 업데이트
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // 홈으로 돌아가기 함수
    const returnHome = () => {
        navigate(`/`);
    }

    // 검색 입력 핸들러
    const handleSearchChange = (e) => {
        setSearchProduct(e.target.value); // 검색어 상태 업데이트
    };

    // 필터링된 제품 목록
    const filteredProducts = products.filter(product =>
        product.productName.toLowerCase().includes(searchProduct.toLowerCase())
    );

    return (
        <div className="adminorder-allproduct-container">
            <div className="adminorder-allproduct-home-header">
                <div className="adminorder-allproduct-navigation-bar">
                    <button className="adminorder-allproduct-back-button" onClick={returnHome}>
                        <img src="assets/common/backIcon.png" alt="Back" className="adminorder-allproduct-nav-bicon" />
                    </button>
                    <div className="adminorder-allproduct-logo-box">
                        <img src="assets/common/emart24_logo.png" alt="eMart24" className="adminorder-allproduct-nav-logo" />
                    </div>
                    <button className="adminorder-allproduct-cart-button">
                        <img src="assets/common/cartIcon.png" alt="Cart" className="adminorder-allproduct-nav-cicon" onClick={() => { navigate('/basket') }} />
                    </button>
                </div>
            </div>
            <div className="adminorder-allproduct-body">
                <div className="adminorder-allproduct-filter-bar">
                    {categoryList.map((category1, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleCategory1Click(category1)}
                            className={`adminorder-allproduct-filter-button ${selectedCategory === category1 ? 'selected' : ''}`}
                        >
                            {category1}
                        </button>
                    ))}
                </div>
                <div className="adminorder-allproduct-click-container">
                    <div className="adminorder-allproduct-container1">
                        <input id="today-pickup" type="checkbox" />
                        <label htmlFor="today-pickup">오늘픽업</label>
                    </div>
                    <div className="adminorder-allproduct-container2">
                        <select onChange={handleSortEvent}>
                            <option value="신상품순">신상품순</option>
                            <option value="판매량순">판매량순</option>
                            <option value="평점순">평점순</option>
                            <option value="리뷰순">리뷰순</option>
                            <option value="낮은가격순">낮은가격순</option>
                            <option value="높은가격순">높은가격순</option>
                        </select>
                    </div>
                </div>
                {/* 검색창 추가 */}
                <div className="adminorder-allproduct-search-bar">
                    <input
                        type="text"
                        placeholder="상품 이름 검색"
                        value={searchProduct}
                        onChange={handleSearchChange} // 검색 핸들러 호출
                        className="adminorder-allproduct-search-input"
                    />
                </div>
            </div>

            {/* 필터링된 제품 목록 렌더링 */}
            {filteredProducts.map(product => (
                <div className="adminorder-allproduct-product-card" key={product.productId}>
                    {/* < img src={product.defaultImage} alt={product.productName} className="adminorder-allproduct-product-defaultImage" /> */}

                    <div className="adminorder-allproduct-product-info">
                        <div className="adminorder-allproduct-product-enrollDate">{product.enrollDate}</div>
                        <div className="adminorder-allproduct-product-name">{product.productName}</div>
                        <div className="adminorder-allproduct-product-price">{product.price} 원</div>
                        <button onClick={() => handleOrderClick(product.productId)}>발주하기</button>
                    </div>
                </div>
            ))}

            {/* 수량 입력 모달 */}
            {showQuantityModal && (
                <div className="adminorder-quantity-modal">
                    <h3>발주할 수량을 입력하세요</h3>
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                    />
                    <button onClick={handleAdminOrder}>발주</button>
                    <button onClick={() => setShowQuantityModal(false)}>취소</button>
                </div>
            )}

            <FooterComponent />
        </div>
    );
}

export default AdminOrderComponent;
