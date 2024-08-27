import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import bag from '../../assets/common/bag.png';
import emptyHeart from '../../assets/common/empty-heart.png';
import filledHeart from '../../assets/common/fill-heart.png';
import './ProductCardComponent.css';

import AlertModalOfClickBasketButton from '../../components/alert/AlertModalOfClickBasketButton.js';

const ProductCardComponent = ({ products = [] }) => {  // 기본값으로 빈 배열을 설정
    const [invToStore, setinvToStore] = useState([]);
//    const [showTodayPu, setShowTodayPu] = useState(false);
    const currentStoreId = localStorage.getItem("currentStoreId");
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    const [likedProducts, setLikedProducts] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [product, setProduct] = useState([]);
    const { category1, productId } = useParams(); // URL 파라미터 가져오기

    useEffect(() => {
        // 현재 스토어의 재고를 가져옴.
        const fetchInvByStoreId = async () => {
            if (currentStoreId) {
                try {
                    const response = await fetch(`http://localhost:8090/eDrink24/api/findInventoryByStoreId/${parseInt(currentStoreId)}`);
                    const invData = await response.json();
                    setinvToStore(invData);

            // 찜 목록 가져오기
            const likedResponse = await fetch(`http://localhost:8090/eDrink24/showAllDibs/${userId}`, {
                method: "GET"
            });

            if (!likedResponse.ok) {
                throw new Error('Failed to fetch liked products');
            }

            const likedData = await likedResponse.json();
            const likedProductIds = new Set(likedData.map(dib => dib.productId));

            // 제품 목록에 찜 상태 추가
            const updatedProducts = invData.map(product => ({
                ...product,
                liked: likedProductIds.has(product.productId)
            }));

            setProduct(updatedProducts);

            console.log("AAAAAAAAAA", invData);

            if (productId) {
                const foundProduct = invData.find(prod => prod.productId === parseInt(productId));
                setProduct(foundProduct || null);
            }
                } catch (error) {
                    console.error('Error fetching inventory:', error);
                }
            } else {
                console.error('Store ID not found in localStorage');
            }
        };

        fetchInvByStoreId();
    }, [currentStoreId]);

    // 찜목록 저장
    const addDibs = async (productId, liked) => {
        const dibProducts = products.find(prod => prod.productId === productId);
        console.log("찜",dibProducts);
        if (!dibProducts) {
            console.error('No dibProducts found');
            return;
        }

        const url = liked
        ? `http://localhost:8090/eDrink24/addDibs/${userId}` // liked가 true면 찜 추가
        : `http://localhost:8090/eDrink24/cancelDIb/${userId}/${productId}`; // liked가 false면 찜 삭제

        try {
            const response = await fetch(url, {
                method: liked? "POST" : "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: localStorage.getItem("userId"),
                    productId: dibProducts.productId
                })
            });

            if (response.ok) {
                // 위 api 실행되면 products에 liked 상태 변경
                // setProducts(prevProducts =>
                //     prevProducts.map(product =>
                //         product.productId === productId
                //             ? { ...product, liked: liked }
                //             : product
                //     )
                // );
                console.log(`Product ${liked ? 'added to' : 'removed from'} dibs:`, dibProducts);
            } else {
                throw new Error(`Failed to ${liked ? 'add' : 'remove'} product to dibs`);
            }

        } catch (error) {
            console.error(`Error ${liked ? 'adding' : 'removing'} product to dibs:`, error);
        }
    };

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

    // 좋아요 버튼 컴포넌트
    const LikeButton = ({onClick, productId, liked}) => {
        const [isLiked, setIsLiked] = useState(liked); // 좋아요 상태 관리

        const handleClick = (event) => {
            event.stopPropagation();
            const likeState = !isLiked;
            setIsLiked(likeState); // 클릭할 때마다 상태를 토글
            onClick(productId, likeState);
        };

        useEffect(() => {
            setIsLiked(liked); // liked prop이 변경될 때 상태 업데이트
        }, [liked]);

        return (
            <button className="allproduct-like-button" onClick={handleClick}>
                <img
                    className="allproduct-like-icon"
                    src={isLiked ? filledHeart : emptyHeart}
                    alt="Like Icon"
                />
            </button>
        );
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
    };

    
    // 장바구니 페이지로 이동
    const goToBasketPage = () => {
        setModalIsOpen(false);
        navigate('/basket');
    };

    // 현재 페이지에 머무름
    const stayOnPage = () => {
        setModalIsOpen(false);
        navigate(`/allproduct/${category1}`);
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

                                {/* <div className="productInfo-review" onClick={(e) => handleClick2(e, product.productId)}>
                                    <img className="productInfo-reviewIcon" src={star} alt=" " />
                                    <span className="productInfo-reviewRating">{rating}</span>
                                    <span className="productInfo-reviewCount">({reviewCount})</span>
                                </div> */}

                                <div className="productInfo-button">
                                    <div className="productInfo-tag">
                                        {invToStore.some(inv =>
                                            inv.productId === product.productId && inv.quantity > 0) ? (
                                            <div className="today-product-tag">오늘픽업</div>
                                        ) : (
                                            <div className="today-product-tag-placeholder"></div>
                                        )}
                                    </div>

                                    <LikeButton
                                    onClick={addDibs}
                                    productId={product.productId}
                                    liked={product.liked} // 제품의 현재 좋아요 상태를 전달
                                    />

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
                navigateOnYes={goToBasketPage}
                navigateOnNo={stayOnPage}
            />
        </div>

    );
};

export default ProductCardComponent;
