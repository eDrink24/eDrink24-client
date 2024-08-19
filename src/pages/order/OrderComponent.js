import './OrderComponent.css';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { basketState, selectedBasketState } from '../basket/BasketAtom.js';
import { orderState } from './OrderAtom.js';
import NaverMapContainer from './NaverMapContainer';
import { useNavigate } from 'react-router-dom'; 

function OrderComponent() {
    const [basket, setBasket] = useRecoilState(basketState);
    const [selectedBaskets, setSelectedBaskets] = useRecoilState(selectedBasketState);
    const [orderInfo, setOrderInfo] = useRecoilState(orderState);
    const [productDetailsMap, setProductDetailsMap] = useState(new Map());
    const [basketItemsList, setBasketItemsList] = useState([]); 
    const [couponList, setCouponList] = useState([]);
    const [priceList, setPriceList] = useState([]);
    const [storeList, setStoreList] = useState([]);
    const [loadingStores, setLoadingStores] = useState(false);
    const [storeAddress, setStoreAddress] = useState('');
    const [loadingCoupons, setLoadingCoupons] = useState(false);
    const [showStoreList, setShowStoreList] = useState(false);
    const [showCouponList, setShowCouponList] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const { pickupDate, coupon, pointUse, paymentMethod } = orderInfo;
    const userId = localStorage.getItem('userId'); // userId를 로컬스토리지에서 가져오기
    const storeId = localStorage.getItem('currentStoreId');
    const navigate = useNavigate();    

    // 총액 계산 함수
    function calculateTotals() {
        const subtotal = Array.from(productDetailsMap.values()).reduce((total, item) => {
            return total + (item.price * item.basketQuantity);
        }, 0);
        const couponDiscount = coupon ? coupon.discountAmount : 0;
        const pointAmount = pointUse ? subtotal * 0.05 : 0;
        const finalAmount = subtotal - couponDiscount - pointAmount;

        setTotalPrice(subtotal);
        setDiscount(couponDiscount + pointAmount);
        setFinalAmount(finalAmount);
    }

     // 선택된 아이템이 변경될 때 장바구니 업데이트
     useEffect(() => {
        setBasket(selectedBaskets);
        console.log("CCCCCCCC:", productDetailsMap)
    }, [selectedBaskets, setBasket]);

    // 장바구니와 기타 관련 상태가 변경될 때 총액 계산
    useEffect(() => {
        calculateTotals();
    }, [selectedBaskets, coupon, pointUse, calculateTotals]);

    // 매장 선택 시 주소와 목록 표시 여부 업데이트

    // 매장 목록을 서버에서 가져오는 함수

    // 매장 목록 버튼 클릭 핸들러

    // 상품 세부 정보를 가져오는 함수
    const fetchProductDetailsForBasket = useCallback(async () => {
        console.log(">>>>>>>>>>>>>2222222", selectedBaskets);

        try {
            const basketItems = [];
            for (const basketId of selectedBaskets) {
                const items = await fetchBasketItems(basketId);
                basketItems.push(...items); 
            }
            console.log('Fetched Basket Items:', basketItems);

            
            const productDetailsMap = new Map();
            basketItems.forEach(item => {
                const { itemId, basketId, productId, defaultImage, productName, price, basketQuantity } = item;
                productDetailsMap.set(productId, { itemId, basketId, defaultImage, productName, price, basketQuantity });
            });
            
            setBasketItemsList(basketItems);
            console.log('Product Details Map:', Array.from(productDetailsMap.entries()));
            setProductDetailsMap(productDetailsMap);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    }, [selectedBaskets]);

    // 상품 세부 정보를 가져오는 함수
    const fetchBasketItems = async (basketId) => {
        if (!basketId) {
            console.error('Invalid basketId:', basketId);
            return [];
        }

        try {
            const response = await axios.get(`http://localhost:8090/eDrink24/getBasketItems/${basketId}`);
            if (response.status === 200) {
                console.log(`Basket Items for ${basketId}:`, response.data);
                return response.data;
            } else {
                console.error('Failed to fetch basket items. Status:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Error fetching basket items:', error);
            return [];
        }
    };

    useEffect(() => {
        if (selectedBaskets.length > 0) {
            console.log('Selected Baskets:', selectedBaskets);
            fetchProductDetailsForBasket();
        }
    }, [selectedBaskets, fetchProductDetailsForBasket]);

    // 쿠폰 목록을 서버에서 가져오는 함수
    const fetchCoupons = async () => {
        setLoadingCoupons(true);
        try {
            const response = await axios.get(`http://localhost:8090/eDrink24/showAllCoupon/userId/${userId}`);
            if (response.status === 200) {
                setCouponList(response.data);
                setShowCouponList(true);
            } else {
                console.error('Failed to fetch coupons. Status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoadingCoupons(false);
        }
    };

    // 결제 처리 함수
    const handleCheckout = async () => {
    if (!userId) {
        alert('User ID is missing.');
        return;
    }

    console.log('User ID:', userId);
    const orderTransactionDTO = basketItemsList.map(item => {
        const orderDate = new Date();
        const pickupDate = new Date(orderDate);
        pickupDate.setDate(orderDate.getDate() + 2);
    
        return {
            storeId,
            userId,
            basketId: item.basketId,
            productId: item.productId,
            orderDate: orderDate.toISOString(),
            pickupDate: pickupDate.toISOString(),
            isCompleted: 'FALSE',
            orderStatus: 'ORDERED',
            orderQuantity: item.basketQuantity,
            pickupType:'RESERVATION',
            price: productDetailsMap.get(item.productId)?.price || 0,
            changeStatus: 'ORDERED',
            changeDate: orderDate.toISOString()
        };
    });
    const basketDTO = {
        basketId:null,
        userId: userId,
        items: basketItemsList.map(item => ({
            itemId:null,
            basketId: item.basketId,
            productId: item.productId,
            defaultImage: item.defaultImage,
            productName: item.productName,
            price: productDetailsMap.get(item.productId)?.price || 0,
            basketQuantity: item.basketQuantity
        }))
    };

      try {
           // 주문 저장 및 주문 내역 저장
           const orderResponse = await fetch(`http://localhost:8090/eDrink24/showAllBasket/userId/${userId}/buyProductAndSaveHistory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderTransactionDTO),
            });
    
            if (!orderResponse.ok) {
                const errorText = await orderResponse.text();
                throw new Error(`Error processing purchase: ${errorText}`);
            }
            navigate("/eDrink24");
            console.log('Order and history saved successfully');

            
            // 장바구니와 장바구니 아이템 삭제
        const deleteResponse = await fetch(`http://localhost:8090/eDrink24/showAllBasket/userId/${userId}/deleteBasketAndItem`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderTransactionDTO),
        });

        console.log(orderTransactionDTO);
    
        if (deleteResponse.ok) {
            console.log('Basket and items deleted successfully');
            console.log(`deleted Items:`,deleteResponse.data);    
        } else {
            const errorText = await deleteResponse.text();
            throw new Error(`Error processing deletion: ${errorText}`);
        }

    } catch (error) {
        console.error('Error processing purchase:', error);
        alert(`Error processing purchase: ${error.message}`);
    }       
};
  
    return (

        <div className="order-container">
            <h1>주문 및 결제</h1>

            <div className="basket-section">
                <h2>주문상품</h2>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>상품 이름</th>
                            <th>가격</th>
                            <th>수량</th>
                        </tr>
                    </thead>
                    <tbody>
                        {basketItemsList.length > 0 ? (
                            basketItemsList.map((item, index) => {
                                const productDetails = productDetailsMap.get(item.productId);
                                
                                return (
                                    <tr key={index}>
                                        <td>
                                            <img 
                                                src={productDetails?.defaultImage || 'default-image-url.jpg'} 
                                                alt={productDetails?.productName || '상품 이미지 없음'} 
                                                className="basket-image" 
                                            />
                                        </td>
                                        <td>{productDetails?.productName || '상품 이름 없음'}</td>
                                        <td>
                                            {productDetails?.price !== undefined ? productDetails.price.toLocaleString() : '가격 정보 없음'} 원
                                        </td>
                                        <td>{item.basketQuantity || 0}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4">장바구니에 아이템이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="discount-section">
                <h2>쿠폰/적립 할인</h2>
                <button onClick={() => {
                    setShowCouponList(prev => {
                        if (!prev) fetchCoupons(); // 목록이 보이지 않을 때만 쿠폰 목록을 새로 불러옴
                        return !prev;
                    });
                }}>
                    {coupon ? `쿠폰 선택 완료: ${coupon.name} - 할인: ${coupon.discountAmount.toLocaleString()} 원` : "보유 쿠폰 조회하기"}
                </button>

                {/* 쿠폰 목록 */}
                {loadingCoupons ? (
                    <p>쿠폰 목록을 불러오는 중입니다...</p>
                ) : (
                    showCouponList && (
                        <div className="coupon-selection">
                            {couponList.length > 0 ? (
                                <ul>
                                    {couponList.map(couponItem => (
                                        <li key={couponItem.couponId}>
                                            <button onClick={() => setOrderInfo(prev => ({ ...prev, coupon: couponItem }))}>
                                                {couponItem.name} - 할인: {couponItem.discountAmount.toLocaleString()} 원
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>쿠폰이 없습니다.</p>
                            )}
                        </div>
                    )
                )}

                {/* 포인트 사용 여부 */}
                <div className="point-use">
                    <label>
                        <input 
                            type="checkbox" 
                            checked={pointUse} 
                            onChange={() => setOrderInfo(prev => ({ ...prev, pointUse: !pointUse }))} 
                        />
                        포인트 사용하기
                    </label>
                </div>
            </div>

            {/* 결제 방법 선택 */}
            <div className="payment-section">
                <h2>결제 방법 선택</h2>
                <select 
                    value={paymentMethod} 
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, paymentMethod: e.target.value }))}>
                    <option value="">결제 방법을 선택하세요</option>
                    <option value="creditCard">신용카드</option>
                    <option value="paypal">페이팔</option>
                    <option value="bankTransfer">계좌이체</option>
                </select>
            </div>

            {/* 주문 총액 */}
            <div className="total-section">
                <h2>주문 총액</h2>
                <div>총 상품금액: {totalPrice.toLocaleString()} 원</div>
                <div>총 할인금액: {discount.toLocaleString()} 원</div>
                <div>총 결제금액: {finalAmount.toLocaleString()} 원</div>
            </div>

            {/* 결제 버튼 */}
            <button className="checkout-button" onClick={handleCheckout}>
                결제하기
            </button>
        </div>
    );
}

export default OrderComponent;