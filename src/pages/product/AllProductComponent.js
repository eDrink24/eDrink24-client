import React, { useEffect, useState } from 'react';
import './AllProductComponent.css';
import FooterComponent from '../../components/footer/FooterComponent.js';
import { useNavigate, useParams } from 'react-router-dom';

const categoryList = ['와인', '양주', '전통주', '논알콜', '안주'];

const AllProductComponent = () => {
    const { category1 } = useParams();
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('와인');
    const navigate = useNavigate();

    useEffect(() => {
        if(category1)    
            selectCategory1(selectedCategory);
    }, [selectedCategory]);

    //카테고리1에 따른 전체제품 보여주기
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
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

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

    const handleCategory1Click = (category1) => {
        setSelectedCategory(category1);
        navigate(`/eDrink24/allproduct/${category1}`);
    }

    const returnHome = () => {
        navigate(`/eDrink24`);
    }

    //제품사진 클릭했을 때 제품상세보기
    const handleProductClickEvent = (productId) => {
        // products 배열에서 클릭된 제품을 찾음
        const clickedProduct = products.find(product => product.productId === productId); //find메소드는 배열을 순회하며, 제공된 조건에 맞는 첫번째 요소 반환
                                                                                          //여기서는 product.productId === productId 조건을 사용하여 클릭된 제품의 ID와 일치하는 제품을 찾음
        //클릭된 제품이 존재할 경우, 해당 제품의 category2 값을 얻음
        if (clickedProduct) {
            const category2 = clickedProduct.category2;
            navigate(`/eDrink24/allproduct/${selectedCategory}/${category2}/${productId}`); //${selectedCategory}=${category1}
        } else {
            console.error('제품을 찾지 못했습니다.');
        }
    };

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
                {categoryList.map((category1,idx) => (
                    <button
                        key={idx}
                        onClick={()=>handleCategory1Click(category1)}
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