import React from 'react';
import './AllProduct.css';

const products = [
    {
        id: 1,
        name: '샤토 생 미셀 컬럼비아 밸리 리슬링',
        price: '31,000 원',
        rating: 4.9,
        reviews: 166,
        image: 'assets/products/1.png', // 실제 이미지 경로로 대체
    },
    {
        id: 2,
        name: '뵈브 클리코 옐로 레이블',
        price: '119,000 원',
        rating: 4.7,
        reviews: 132,
        image: 'assets/products/2.png', // 실제 이미지 경로로 대체
    },
    {
        id: 3,
        name: '프레시넷 이탈리아 로제',
        price: 'price',
        rating: 4.9,
        reviews: 55,
        image: 'assets/products/3.png', // 실제 이미지 경로로 대체
    },
    {
        id: 4,
        name: '벤돔 마드모아젤',
        price: 'price',
        rating: 4.8,
        reviews: 102,
        image: 'assets/products/4.png', // 실제 이미지 경로로 대체
    },
];


const AllProduct = () => {
    return (
        <div className="allproduct-container">
            <div className="home-header"> {/* 상단 네비게이션 바 */}
                <div className="navigation-bar">
                    <button className="back-button">
                        <img src="assets/common/backIcon.png" alt="Back" className="nav-bicon" /> {/* 뒤로 가기 아이콘 */}
                    </button>
                    <div className="logo-box">
                        <img src="assets/common/emart24_logo.png" alt="eMart24" className="nav-logo" /> {/* 로고 이미지 */}
                    </div>
                    <button className="cart-button">
                        <img src="assets/common/cartIcon.png" alt="Cart" className="nav-cicon" /> {/* 장바구니로 가기 아이콘 */}
                    </button>
                </div>
            </div>
            <div className="allproduct-body">
                {/* 카테고리 바 */}
                <div className="filter-bar">
                    <button className="filter-button selected">와인 전체</button>
                    <button className="filter-button">레드</button>
                    <button className="filter-button">샴페인</button>
                    <button className="filter-button">화이트</button>
                    <button className="filter-button">로제</button>
                    <button className="filter-button">국산</button>
                </div>
                {/* 오늘픽업 체크박스 / 인기순,신상품,등등 */}
                <div className="click-container">
                    <div className="container1">
                        <input id="today-pickup" type="checkbox"/>
                        <label for="today-pickup">오늘픽업</label>
                    </div>
                    <div className="container2">
                        <select>
                            <option value="">신상품순</option>
                            <option value="">판매량순</option>
                            <option value="">평점순</option>
                            <option value="">리뷰순</option>
                            <option value="">낮은가격순</option>
                            <option value="">높은가격순</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {products.map(products => (
                <div className="product-card" key={products.id}>
                    <img src={products.image} alt={products.name} className="product-image" />
                    <div className="product-info">
                        <div className="product-rating">
                            <span className="star">★</span> {products.rating} ({products.reviews})
                        </div>
                        <div className="product-name">{products.name}</div>
                        <div className="product-price">{products.price}</div>
                        <div className="product-tag">오늘픽업</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AllProduct;
