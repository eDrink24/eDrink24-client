import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './ProductCardComponent.css';
import star from '../../assets/common/star.png';
import filledHeart from '../../assets/common/fill-heart.png';
import emptyHeart from '../../assets/common/empty-heart.png';
import bag from '../../assets/common/bag.png';

import AlertModalOfClickBasketButton from '../../components/alert/AlertModalOfClickBasketButton.js';

const ProductCardComponent = ({ products = [] }) => {  // 기본값으로 빈 배열을 설정
    const [invToStore, setinvToStore] = useState([]);
//    const [showTodayPu, setShowTodayPu] = useState(false);
    const currentStoreId = localStorage.getItem("currentStoreId");
    const navigate = useNavigate();

    const [likedProducts, setLikedProducts] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        // 현재 스토어의 재고를 가져옴.
        const fetchInvByStoreId = async () => {
            if (currentStoreId) {
                try {
                    const response = await fetch(`http://localhost:8090/eDrink24/api/findInventoryByStoreId/${parseInt(currentStoreId)}`);
                    const invData = await response.json();
                    setinvToStore(invData);
                } catch (error) {
                    console.error('Error fetching inventory:', error);
                }
            } else {
                console.error('Store ID not found in localStorage');
            }
        };

        fetchInvByStoreId();
    }, [currentStoreId]);

    // 제품 클릭 시 상세 페이지로 이동
    const handleProductClickEvent = (productId) => {
        const clickedProduct = products.find(product => product.productId === productId);
        if (clickedProduct) {
            const category2 = clickedProduct.category2;
            navigate(`/eDrink24/allproduct/${clickedProduct.category1}/${category2}/${productId}`);
        } else {
            console.error('제품을 찾지 못했습니다.');
        }
    };

    // Like 기능
    const handleClick1 = (event, productId) => {
        event.stopPropagation();
        setLikedProducts(prevState => ({
            ...prevState,
            [productId]: !prevState[productId]
        }));
    };    

    // Review 기능
    const handleClick2 = (event, productId) => {
        event.stopPropagation();
        console.log(`Reviewed product with ID: ${productId}`);
    };

    // CartBag 기능
    const handleClick3 = (event, productId) => {
        event.stopPropagation();
        saveInBasket(productId);
    };

    const saveInBasket = async (productId) => {
        const productToSave = products.find(prod => prod.productId === productId);

        if (!productToSave) {
            console.error('No product found');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8090/eDrink24/saveProductToBasket`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: localStorage.getItem("userId"),
                    items: [{
                        productId: productToSave.productId,
                        defaultImage: productToSave.defaultImage,
                        productName: productToSave.productName,
                        price: productToSave.price,
                        basketQuantity: 1
                    }]
                })
            });

            if (response.ok) {
                setModalIsOpen(true);
            } else {
                throw new Error('Failed to save product to basket');
            }
        } catch (error) {
            console.error('Error saving product to basket:', error);
        }
    };

    return (
        <div className="ProductCard">
            {products.length > 0 ? (  // products가 있을 때만 렌더링
                products.map(product => {  
                    const rating = 4.6; // 별점
                    const reviewCount = 123; // 리뷰 수

                    return (
                        <div className="productCard-box" key={product.productId} onClick={() => handleProductClickEvent(product.productId)} >
                            <div className="productImage-box">
                                <img className="productImage" src={product.defaultImage} alt={product.productName} />
                            </div>
                            <div className="productInfo-box">
                                <div className="productInfo-info">
                                    <div className="productInfo-name">{product.productName}</div>
                                    <div className="productInfo-price">{Number(product.price).toLocaleString()} 원</div>
                                </div>

                                <div className="productInfo-review" onClick={(e) => handleClick2(e, product.productId)}>
                                    <img className="productInfo-reviewIcon" src={star} alt=" " />
                                    <span className="productInfo-reviewRating">{rating}</span>
                                    <span className="productInfo-reviewCount">({reviewCount})</span>
                                </div>

                                <div className="productInfo-button">
                                    <div className="productInfo-tag">
                                        {invToStore.some(inv =>
                                            inv.productId === product.productId && inv.quantity > 0) ? (
                                            <div className="today-product-tag">오늘픽업</div>
                                        ) : (
                                            <div className="today-product-tag-placeholder"></div>
                                        )}
                                    </div>

                                    <button className="productInfo-like" onClick={(e) => handleClick1(e, product.productId)}>
                                        <img className="productInfo-likeIcon" src={likedProducts[product.productId] ? {filledHeart} : {emptyHeart}} alt=" "/>
                                    </button>

                                    <button className="productInfo-bag" onClick={(e) => handleClick3(e, product.productId)}>
                                        <img className="productInfo-bagIcon" src={bag} alt=" " />
                                    </button>
                                </div>

                            </div>
                        </div>
                    );
                })
            ) : (
                <p>No products available.</p>  // products가 없을 때 표시할 내용
            )}

            <AlertModalOfClickBasketButton
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                message="장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?"
                navigateOnYes={() => console.log('Go to basket')}
                navigateOnNo={() => setModalIsOpen(false)}
            />
        </div>

    );
};

export default ProductCardComponent;
