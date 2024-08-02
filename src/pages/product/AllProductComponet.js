import React, { useEffect, useState } from 'react';
import './AllProductComponent.css';
import FooterComponent from '../../components/footer/FooterComponent.js';
import { useNavigate } from 'react-router-dom';

const AllProductComponent = () => {
    const [products, setProducts] = useState([]);
    const [category2, setCategory2] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        allProducts();
    }, []);

    //전체 제품 보여주기
    const allProducts = async () => {
        try {
            const response = await fetch('http://localhost:8090/eDrink24/showAllProduct', {
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

    //카테고리별로 제품 보여주기
    async function selectCategory2(category2) {
        setCategory2(category2);
        const response = await fetch(`http://localhost:8090/eDrink24/showProductByCategory2/${category2}`, {
            method: "GET"
        });

        if (response.ok) {
            const resData = await response.json();
            setProducts(resData);
        } else {
            console.error('Error fetching data:', response.statusText);
        }
    }

    //사이드바 선택한거에 따라서 제품 보여주기
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

    //제품사진 클릭했을 때 제품상세보기
    const handleProductClickEvent = (productId) => {
        console.log("products", products);
        navigate(`/eDrink24/allproduct/${productId}`);
    };

    return (
        <div className="allproduct-container">
            <div className="allproduct-home-header"> {/* 상단 네비게이션 바 */}
                <div className="allproduct-navigation-bar">
                    <button className="allproduct-back-button" onClick={() => { navigate(-1) }}>
                        <img src="assets/common/backIcon.png" alt="Back" className="allproduct-nav-bicon" /> {/* 뒤로 가기 아이콘 */}
                    </button>
                    <div className="allproduct-logo-box">
                        <img src="assets/common/emart24_logo.png" alt="eMart24" className="allproduct-nav-logo" /> {/* 로고 이미지 */}
                    </div>
                    <button className="allproduct-cart-button">
                        <img src="assets/common/cartIcon.png" alt="Cart" className="allproduct-nav-cicon" /> {/* 장바구니로 가기 아이콘 */}
                    </button>
                </div>
            </div>
            <div className="allproduct-body">
                {/* 카테고리 바 */}
                <div className="allproduct-filter-bar">
                    <button onClick={allProducts} className="allproduct-filter-button selected">와인 전체</button>
                    <button onClick={() => selectCategory2('레드와인')} className="allproduct-filter-button">레드</button>
                    <button className="allproduct-filter-button">샴페인</button>
                    <button onClick={() => selectCategory2('화이트와인')} className="allproduct-filter-button">화이트</button>
                    <button className="allproduct-filter-button">로제</button>
                    <button className="allproduct-filter-button">국산</button>
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
                <div className="allproduct-product-card" key={product.productId} onClick={() => handleProductClickEvent(product.productId)}>
                    <img src={product.defaultImage} alt={product.productName} className="allproduct-product-defaultImage" />

                    <div className="allproduct-product-info">
                        <div className="allproduct-product-rating">
                            <span className="allproduct-star">★</span>
                        </div>
                        <div className="allproduct-product-enrollDate">{product.enrollDate}</div>
                        <div className="allproduct-product-name">{product.productName}</div>
                        <div className="allproduct-product-price">{product.price} 원</div>
                        <div className="allproduct-product-tag">오늘픽업</div>
                    </div>
                </div>
            ))}

            <FooterComponent />
        </div>
    );
}

export default AllProductComponent;
