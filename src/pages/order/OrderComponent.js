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
    console.log('Current orderInfo:', orderInfo);
    const [productDetailsMap, setProductDetailsMap] = useState(new Map());
    const [couponList, setCouponList] = useState([]);
    const [storeList, setStoreList] = useState([]);
    const [loadingStores, setLoadingStores] = useState(false);
    const [storeAddress, setStoreAddress] = useState('');
    const [loadingCoupons, setLoadingCoupons] = useState(false);
    const [showStoreList, setShowStoreList] = useState(false);
    const [showCouponList, setShowCouponList] = useState(false);

    const { storeId, pickupDate, coupon, pointUse, paymentMethod, userId } = orderInfo;
    const navigate = useNavigate();

    // 총액 계산 함수
    const calculateTotals = useCallback(() => {
        const subtotal = selectedBaskets.reduce((total, item) => {
            const productDetails = productDetailsMap.get(item.productId);
            const price = productDetails ? productDetails.price : 0;
            return total + (price * item.basketQuantity);
        }, 0);

        const couponDiscount = coupon ? coupon.discountAmount : 0;
        const pointAmount = pointUse ? subtotal * 0.05 : 0;
        const finalAmount = subtotal - couponDiscount - pointAmount;

        setOrderInfo(prev => ({
            ...prev,
            totalPrice: subtotal,
            discount: couponDiscount + pointAmount,
            finalAmount: finalAmount
        }));
    }, [basket, productDetailsMap, coupon, pointUse, setOrderInfo]);

    // 선택된 아이템이 변경될 때 장바구니 업데이트
    useEffect(() => {
        setBasket(selectedBaskets);
    }, [selectedBaskets, setBasket]);

    // 장바구니와 기타 관련 상태가 변경될 때 총액 계산
    useEffect(() => {
        calculateTotals();
    }, [basket, coupon, pointUse, calculateTotals]);

    // 매장 선택 시 주소와 목록 표시 여부 업데이트
    useEffect(() => {
        if (storeId) {
            const selectedStore = storeList.find(store => store.storeId === storeId);
            if (selectedStore) {
                setStoreAddress(selectedStore.storeAddress);
                setShowStoreList(false); // 매장 선택 시 목록 숨기기
            }
        }
    }, [storeId, storeList]);

    // 매장 목록을 서버에서 가져오는 함수
    const fetchStores = async () => {
        setLoadingStores(true);
        try {
            const response = await axios.get('http://localhost:8090/eDrink24/showAllStore');
            if (response.status === 200) {
                setStoreList(response.data);
                setShowStoreList(true);
            } else {
                console.error('Failed to fetch stores. Status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoadingStores(false);
        }
    };

    // 매장 목록 버튼 클릭 핸들러
    function handleStoreButtonClick() {
        if (!showStoreList) {
            fetchStores();
        } else {
            setShowStoreList(false);
        }
    }

    // 상품 세부 정보를 가져오는 함수
    const fetchProductDetails = async (productId) => {
        try {
            const response = await axios.get(`http://localhost:8090/eDrink24/showDetailProduct/${productId}`);
            if (response.status === 200) {
                return response.data;
            } else {
                console.error('Failed to fetch product details. Status:', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            return null;
        }
    };

    // 상품 정보를 가져오고 저장하는 함수
    const fetchProductDetailsForBasket = useCallback(async () => {
        const productIds = [...new Set(selectedBaskets.map(item => item.productId))];
        
        try {
            const productDetails = await Promise.all(
                productIds.map(productId => fetchProductDetails(productId))
            );

            const detailsMap = new Map();
            productDetails.forEach(details => {
                if (details) {
                    detailsMap.set(details.productId, details);
                }
            });

            setProductDetailsMap(detailsMap);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    }, [selectedBaskets]);

    // 쿠폰 목록을 서버에서 가져오는 함수
    const fetchCoupons = async () => {
        setLoadingCoupons(true);
        try {
            const response = await axios.get(`http://localhost:8090/eDrink24/showAllCoupon/loginId/${userId}`);
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
        const orderTransactionDTO = selectedBaskets.map(item => ({
            storeId,
            userId: orderInfo.userId,
            productId: item.productId,
            orderDate: new Date().toISOString().split('T')[0],
            pickupDate: pickupDate ? new Date(pickupDate).toISOString().split('T')[0] : null,
            isCompleted: 'FALSE',
            orderStatus: 'ORDERED',
            quantity: item.basketQuantity,
            price: item.price,
            changeStatus: 'ORDERED',
            changeDate: new Date().toISOString().split('T')[0]
        }));

        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showAllBasket/userId/${userId}/buyProductAndSaveHistory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderTransactionDTO),
            });

            if (response.ok) {
                alert('Purchase successful');
                navigate('/eDrink24');
            } else {
                const errorText = await response.text();
                alert(`Error processing purchase: ${errorText}`);
            }
        } catch (error) {
            console.error('Error processing purchase:', error);
            alert(`Error processing purchase: ${error.message}`);
        }
    };

    // 바로 구매 버튼 클릭 시 제품 정보가 주문 페이지에 보여짐.
    useEffect(() => {
        if (orderInfo.selectedItems && orderInfo.selectedItems.length > 0) {
            setSelectedBaskets(orderInfo.selectedItems);
        }
    }, [orderInfo.selectedItems, setSelectedBaskets]);

    return (

        <div className="order-container">
            <h1>주문 및 결제</h1>

            <div className="pickup-section" id="storeMap">
                <h2>픽업 장소</h2>
                <NaverMapContainer storeAddress={storeAddress} />
                <button onClick={handleStoreButtonClick}>
                    {storeId ? `매장 선택 완료: ${storeList.find(store => store.storeId === storeId)?.storeName}` : "픽업매장 선택하기"}
                </button>

                {storeId && (
                    <div className="selected-store-info">
                        <p><strong>매장 이름:</strong> {storeList.find(store => store.storeId === storeId)?.storeName}</p>
                        <p><strong>주소:</strong> {storeAddress}</p>
                    </div>
                )}

                {loadingStores ? (
                    <p>매장 목록을 불러오는 중입니다.</p>
                ) : (
                    showStoreList && (
                        <div className="store-selection">
                            {storeList.length > 0 ? (
                                <ul>
                                    {storeList.map(store => (
                                        <li key={store.storeId}>
                                            <button onClick={() => {
                                                setOrderInfo(prev => ({ ...prev, storeId: store.storeId }));
                                                setShowStoreList(false); // 매장 선택 시 목록 숨기기
                                            }}>
                                                {store.storeName} - {store.storeAddress}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>매장 목록이 없습니다.</p>
                            )}
                        </div>
                    )
                )}
            </div>

            {/* 방문 시간 지정 */}
            <div className="pickup-time-section">
                <h2>방문 시간 지정</h2>
                <input 
                    type="date" 
                    value={pickupDate || ''} 
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, pickupDate: e.target.value }))} 
                />
            </div>

            {/* 주문상품 */}
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
                        {selectedBaskets.length > 0 ? (
                            selectedBaskets.map((item, index) => {
                                const productDetails = productDetailsMap.get(item.productId) || {};
                                return (
                                    <tr key={index}>
                                        <td>
                                            <img 
                                                src={productDetails.defaultImage || 'default-image-url.jpg'} 
                                                alt={productDetails.productName || '상품 이미지 없음'} 
                                                className="basket-image" 
                                            />
                                        </td>
                                        <td>{productDetails.productName || '상품 이름 없음'}</td>
                                        <td>
                                            {productDetails.price !== undefined ? productDetails.price.toLocaleString() : '가격 정보 없음'} 원
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

            {/* 쿠폰/적립 할인 */}
            <div className="discount-section">
                <h2>쿠폰/적립 할인</h2>
                <button onClick={() => {
                    setShowCouponList(prev => !prev);
                    if (!showCouponList) fetchCoupons(); // 목록이 보이지 않을 때만 쿠폰 목록을 새로 불러옴
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
                <p>상품 금액: {orderInfo.totalPrice ? orderInfo.totalPrice.toLocaleString() : '0'} 원</p>
                <p>쿠폰 할인: {orderInfo.discount ? orderInfo.discount.toLocaleString() : '0'} 원</p>
                <p>최종 결제 금액: {orderInfo.finalAmount ? orderInfo.finalAmount.toLocaleString() : '0'} 원</p>
            </div>

            {/* 결제 버튼 */}
            <button className="checkout-button" onClick={handleCheckout}>
                결제하기
            </button>
        </div>
    );
}

export default OrderComponent;