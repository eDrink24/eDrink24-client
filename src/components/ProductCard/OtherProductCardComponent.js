import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './OtherProductCardComponent.css';
import star from '../../assets/common/star.png';
import filledHeart from '../../assets/common/fill-heart.png';
import emptyHeart from '../../assets/common/empty-heart.png';
import bag from '../../assets/common/bag.png';

import AlertModalOfClickBasketButton from '../../components/alert/AlertModalOfClickBasketButton.js';

const OtherProductCardComponent = ({ products = [] }) => {  // 기본값으로 빈 배열을 설정
    const [invToStore, setinvToStore] = useState([]);
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
            navigate(`/allproduct/${clickedProduct.category1}/${category2}/${productId}`);
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

    // 3개씩 그룹화하여 렌더링
    const groupedProducts = [];
    for (let i = 0; i < products.length; i += 3) {
        groupedProducts.push(products.slice(i, i + 3));
    }

    return (
        <div className="ProductCard2"> {/* 가로 스크롤을 지원하는 컨테이너 */}
            {groupedProducts.length > 0 ? (  // products가 있을 때만 렌더링
                groupedProducts.map((group, index) => (

        <div className="ProductCardSet" key={index}> {/* 세로로 3개씩 묶는 컨테이너 */}
            {group.map(product => {

                return (
                    <div className="productCard-box2" key={product.productId} onClick={() => handleProductClickEvent(product.productId)} >
                        <div className="productImage-box2">
                            <img className="productImage2" src={product.defaultImage} alt={product.productName} />
                        </div>
                        <div className="productInfo-box2">
                            <div className="productInfo-info2">
                                <div className="productInfo-name2">{product.productName}</div>
                                <div className="productInfo-price2">{Number(product.price).toLocaleString()} 원</div>
                            </div>

                            <div className="productInfo-review2" onClick={(e) => handleClick2(e, product.productId)}>
                                <img className="productInfo-reviewIcon2" src={star} alt=" " />
                                <span className="productInfo-reviewRating2">{rating}</span>
                                <span className="productInfo-reviewCount2">({reviewCount})</span>
                            </div>

                            <div className="productInfo-button2">
                                <div className="productInfo-tag2">
                                    {invToStore.some(inv =>
                                        inv.productId === product.productId && inv.quantity > 0) ? (
                                        <div className="today-product-tag2">오늘픽업</div>
                                    ) : (
                                        <div className="today-product-tag-placeholder2"></div>
                                    )}
                                </div>

                                <button className="productInfo-like2" onClick={(e) => handleClick1(e, product.productId)}>
                                    <img className="productInfo-likeIcon2" src={likedProducts[product.productId] ? {filledHeart} : {emptyHeart}} alt=" "/>
                                </button>

                                <button className="productInfo-bag2" onClick={(e) => handleClick3(e, product.productId)}>
                                    <img className="productInfo-bagIcon2" src={bag} alt=" " />
                                </button>
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>

        ))
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

export default OtherProductCardComponent;
