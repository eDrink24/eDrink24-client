import React, { useEffect, useState } from 'react';
import './AdminOrderComponent.css';
import FooterComponent from '../../components/footer/FooterComponent.js';
import { useNavigate, useParams } from 'react-router-dom';

const categoryList = ['와인', '양주', '전통주', '논알콜', '안주'];

const AdminOrderComponent = () => {
    const { category1 } = useParams();
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('와인');
    const [quantity, setQuantity] = useState(0);
    const [showQuantityModal, setShowQuantityModal] = useState(false); // 수량 입력 토글창
    const [selectedProductId, setSelectedProductId] = useState(null); // 발주할 productId 저장
    const [adminOrderList, setAdminOrderList] = useState([]);
    const navigate = useNavigate();
    const storeId = 1; // (내일 LocalStorage 데이터로 변경)

    useEffect(() => {
        if (selectedCategory)    
            selectCategory1(selectedCategory);
    }, [selectedCategory]);

    // 카테고리1에 따른 전체제품 보여주기
    const selectCategory1 = async (category1) => {
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showProductByCategory1/${category1}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const resData = await response.json();
            setProducts(resData);

            // AdminOrderList 업데이트
            const newAdminOrderList = resData.map(product => ({
                storeId: 1,  // 나중에 수정
                productId: product.productId,
                InventoryQuantity: 0,  // 초기 수량 0
            }));

            setAdminOrderList(newAdminOrderList);
            console.log('Updated Admin Order List:', newAdminOrderList);

        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // 발주하기 버튼 클릭 시 수량 입력 창 띄우기
    const handleOrderClick = (productId) => {
        setSelectedProductId(productId);
        setShowQuantityModal(true);
    };

    const handleQuantityChange = (e) => {
        setQuantity(Number(e.target.value));
    };
    

    // 발주 요청
    const handleAdminOrder = async () => {
        if (selectedProductId && quantity > 0) {
            // adminOrderList에서 선택된 productId의 quantity 업데이트
            const updatedOrderList = adminOrderList.map(item =>
                item.productId === selectedProductId ? { ...item, InventoryQuantity: quantity } : item
            );
            setAdminOrderList(updatedOrderList);

            // InventoryDTO 생성
            const InventoryDTO = {
                storeId: 1,
                productId: selectedProductId,
                quantity: quantity
            };
            try {
                const response = await fetch(`http://localhost:8090/eDrink24/updateOrInsertInventory/${storeId}/${selectedProductId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(InventoryDTO) // InventoryDTO에 맞게 수량을 전송
                    
                });
                console.log("AAAAAAAAAA:", InventoryDTO);

                const contentType = response.headers.get('Content-Type');
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to place order: ${errorText}`);
                }

                // 응답이 JSON인지 확인
                if (contentType && contentType.includes('application/json')) {
                    const jsonResponse = await response.json();
                    console.log('Order placed successfully:', jsonResponse);
                } else {
                    // JSON이 아닌 응답 처리
                    const textResponse = await response.text();
                    console.log('Received non-JSON response:', textResponse);
                }

                // 주문 성공 후 수량 입력 창 닫기 및 초기화
                setShowQuantityModal(false);
                setQuantity(0);
            } catch (error) {
                console.error('Error placing order:', error);
            }
        } else {
            alert("Please enter a valid quantity.");
        }
    };

    // 사이드바 선택한거에 따라서 제품 보여주기
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
        setProducts(sortedProduct);
    };

    // const handleCategory1Click = (category1) => {
    //     setSelectedCategory(category1);
    //     navigate(`/eDrink24/allproduct/${category1}`);
    // }

    
    const handleCategory1Click = async (category1) => {
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showProductByCategory1/${category1}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const resData = await response.json();
            setProducts(resData);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    

    const returnHome = () => {
        navigate(`/eDrink24`);
    }

    // 제품사진 클릭했을 때 제품상세보기

    return (
        <div className="allproduct-container">
            <div className="allproduct-home-header"> {/* 상단 네비게이션 바 */}
                <div className="allproduct-navigation-bar">
                    <button className="allproduct-back-button" onClick={returnHome}>
                        <img src="assets/common/backIcon.png" alt="Back" className="allproduct-nav-bicon" /> {/* 뒤로 가기 아이콘 */}
                    </button>
                    <div className="allproduct-logo-box">
                        <img src="assets/common/emart24_logo.png" alt="eMart24" className="allproduct-nav-logo" /> {/* 로고 이미지 */}
                    </div>
                    <button className="allproduct-cart-button">
                        <img src="assets/common/cartIcon.png" alt="Cart" className="allproduct-nav-cicon" onClick={() => { navigate('/eDrink24/basket') }} /> {/* 장바구니로 가기 아이콘 */}
                    </button>
                </div>
            </div>
            <div className="allproduct-body">
                {/* 카테고리 바*/}
                <div className="allproduct-filter-bar">
                {categoryList.map((category1, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleCategory1Click(category1)}
                        className={`allproduct-filter-button ${selectedCategory === category1 ? 'selected' : ''}`}
                    >
                        {category1}
                    </button>
                ))}
                </div>
                {/* 오늘픽업 체크박스 / 인기순,신상품,등등 */}
                <div className="allproduct-click-container">
                    <div className="allproduct-container1">
                        <input id="today-pickup" type="checkbox" />
                        <label htmlFor="today-pickup">오늘픽업</label>
                    </div>
                    <div className="allproduct-container2">
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
            </div>

            {products.map(product => (
                <div className="allproduct-product-card" key={product.productId} >
                    <img src={product.defaultImage} alt={product.productName} className="allproduct-product-defaultImage" />

                    <div className="allproduct-product-info">
                        <div className="allproduct-product-rating">
                            <span className="allproduct-star">★</span>
                        </div>
                        <div className="allproduct-product-enrollDate">{product.enrollDate}</div>
                        <div className="allproduct-product-name">{product.productName}</div>
                        <div className="allproduct-product-price">{Number(product.price).toLocaleString()} 원</div>
                        <button className="checkout-button" onClick={() => handleOrderClick(product.productId)}>
                            발주하기
                        </button>
                    </div>
                </div>
            ))}

            <FooterComponent />

            {/* 수량 입력 창 */}
            {showQuantityModal && (
                <div className="quantity-modal">
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
        </div>
    );
}

export default AdminOrderComponent;
