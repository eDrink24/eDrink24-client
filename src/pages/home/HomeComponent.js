import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CarouselComponent from '../../components/Banner/CarouselComponent.js';
import FooterComponent from '../../components/footer/FooterComponent.js';
import MyplaceComponent from '../../components/mainMyplace/MyplaceComponent.js';
import OtherProductCardComponent from '../../components/ProductCard/OtherProductCardComponent.js';
import ProductCardComponent from '../../components/ProductCard/ProductCardComponent.js';
import "./HomeComponent.css";

function HomeComponent() {
    const { category1 } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [invToStore, setInvToStore] = useState([]);  // 재고 데이터 상태 정의

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:8090/eDrink24/showProductByCategory1/와인');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();

        // 재고 데이터를 API 호출을 통해서 가져옴
        const fetchInvByStoreId = async () => {
            const currentStoreId = localStorage.getItem("currentStoreId");
            if (currentStoreId) {
                try {
                    const response = await fetch(`http://localhost:8090/eDrink24/api/findInventoryByStoreId/${parseInt(currentStoreId)}`);
                    const invData = await response.json();
                    setInvToStore(invData);
                } catch (error) {
                    console.error('Error fetching inventory:', error);
                }
            } else {
                console.error('Store ID not found in localStorage');
            }
        };

        fetchInvByStoreId();
    }, []);

    // "오늘 픽업" 제품 필터링
    const todayPickupProducts = products.filter(product =>
        invToStore.some(inv => inv.productId === product.productId && inv.quantity > 0)
    );

    const handleDirectHome = () => {
        navigate("/");
    };

    const handleDirectCategory = () => {
        navigate("/category");
    };

    const handleDirectAllproduct = () => {
        navigate(`/allproduct/${category1}`);
    };

    return (
        <div className="homePage-container">
            <div className="homePage-nav-bar">
                <img className="homePage-logo" src="assets/common/eDrinkLogo.png" alt=" " />
                <div className="homePage-icon-content">
                    <button className="homePage-bell-button">
                        <img className="homePage-bell-icon" src="assets/common/bell.png" alt=" " />
                    </button>
                    <button className="homePage-basket-button" aria-label="Notifications">
                        <img className="homePage-basket-icon" src="assets/common/bag.png" alt=" " onClick={() => navigate("/basket")} />
                    </button>
                </div>
            </div>

            <MyplaceComponent />
            <CarouselComponent />

            <div className="category-button-container">
                <button type="button" className="b1" onClick={handleDirectCategory}>
                    <img src="assets/common/menu.png" className="menuButton" alt="Menu Button" />
                    <p className="home-category">카테고리</p>
                </button>
                <button type="button" className="b2" onClick={handleDirectAllproduct}>
                    <img src="assets/common/search.png" className="searchButton" alt="Search Button" />
                    <p className="home-category">전체상품</p>
                </button>
                <button type="button" className="b3" onClick={handleDirectHome}>
                    <img src="assets/common/gift.png" className="giftButton" alt="Gift Button" />
                    <p className="home-category">이벤트</p>
                </button>
                <button type="button" className="b4" onClick={handleDirectHome}>
                    <img src="assets/common/chatbot.png" className="chatbotButton" alt="Chatbot Button" />
                    <p className="home-category">챗봇</p>
                </button>
            </div>

            <div className="homeProduct-container">
                <div className='line'></div>
                <div className="best-product">
                    <div className="bestTitle">
                        <h1>오늘픽업</h1>
                        <a href="#" className='more-button'>더보기 {">"}</a>
                    </div>
                    <div className="ProductCard">
                        <ProductCardComponent products={todayPickupProducts.slice(0, 6)} />
                    </div>
                </div>

                <div className='line'></div>
                <div className="best-product">
                    <div className="bestTitle">
                        <h1>전체상품</h1>
                        <a href="#" className='more-button'>더보기 {">"}</a>
                    </div>
                    <div className="ProductCard2">
                        <OtherProductCardComponent products={products.slice(0, 9)} />
                    </div>
                </div>
            </div>

            <FooterComponent />
        </div>
    );
}

export default HomeComponent;
