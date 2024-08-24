import './OrderComponent.css';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRecoilState, useRecoilValue } from 'recoil';
import { basketState, selectedTodayPickupBaskets, selectedReservationPickupBaskets } from '../basket/BasketAtom.js';
import { orderState } from './OrderAtom.js';
import { useNavigate } from 'react-router-dom';

function OrderComponent() {
    const [basket, setBasket] = useRecoilState(basketState);
    const [orderInfo, setOrderInfo] = useRecoilState(orderState);
    const [orderResult, setOrderResult] = useState({ coupon: null, paymentMethod: '' }); //pkh
    const [productDetailsMap, setProductDetailsMap] = useState(new Map());
    const [basketItemsList, setBasketItemsList] = useState([]);
    const [coupon, setCoupon] = useState(null); // 선택된 쿠폰 상태
    const [couponList, setCouponList] = useState([]);
    const [loadingCoupons, setLoadingCoupons] = useState(false);
    const [showCouponList, setShowCouponList] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [addedPoint, setAddedPoint] = useState(0); //pkh
    const [totalPoint, setTotalPoint] = useState(0); //pkh
    const [discount, setDiscount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [userPoints, setUserPoints] = useState(0);  // 사용자의 총 포인트
    const [pointsToUse, setPointsToUse] = useState(0);  // 사용자가 입력한 포인트
    const { paymentMethod } = orderResult;

    const userId = localStorage.getItem('userId'); // userId를 로컬스토리지에서 가져오기
    const storeId = localStorage.getItem('currentStoreId');

    const todayPickupBaskets = useRecoilValue(selectedTodayPickupBaskets);
    const reservationPickupBaskets = useRecoilValue(selectedReservationPickupBaskets);

    console.log()
    const navigate = useNavigate();


    // 총액 계산 함수 pkh
    function calculateTotals() {
        const subtotal = Array.from(productDetailsMap.values()).reduce((total, item) => {
            return total + (item.price * item.basketQuantity);
        }, 0);
        const couponDiscount = coupon ? coupon.discountAmount : 0;

        // 사용자가 입력한 포인트 값을 결제 금액에서 차감 pkh
        const pointAmount = pointsToUse;
        const finalAmount = subtotal - couponDiscount - pointAmount;

        // finalAmount의 1%를 totalPoint로 설정 pkh
        const addedPoint = finalAmount * 0.01;
        const totalPoint = userPoints - pointAmount + addedPoint;

        setTotalPrice(subtotal);
        setDiscount(couponDiscount + pointAmount);
        setFinalAmount(finalAmount);
        setAddedPoint(addedPoint);
        setTotalPoint(totalPoint);
    }

    // 포인트 조회 함수 pkh
    const fetchUserPoints = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_API_URL}/showTotalPoint/${userId}`);
            if (response.status === 200) {
                setUserPoints(response.data);
            } else {
                console.error('Failed to fetch user points. Status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching user points:', error);
        }
    };

    // 사용자가 입력한 포인트 적용 함수 pkh
    const applyPoints = () => {
        if (pointsToUse > userPoints) {
            alert('사용할 포인트가 보유 포인트를 초과할 수 없습니다.');
            setPointsToUse(userPoints);
        } else {
            calculateTotals();
        }
    };

    // 선택된 아이템이 변경될 때 장바구니 업데이트
    useEffect(() => {
        if (orderInfo.selectedItems.length > 0) {
            const productDetailsMap = new Map();
            orderInfo.selectedItems.forEach(item => {
                productDetailsMap.set(item.productId, item);
            });

            setBasketItemsList(orderInfo.selectedItems);
            setProductDetailsMap(productDetailsMap);
        }
        const allSelectedBaskets = [...todayPickupBaskets, ...reservationPickupBaskets];
        setBasket(allSelectedBaskets);
    }, [orderInfo, todayPickupBaskets, reservationPickupBaskets, setBasket]);

    // 장바구니와 기타 관련 상태가 변경될 때 총액 계산
    useEffect(() => {
        calculateTotals();
    }, [basket, coupon, pointsToUse, calculateTotals]);

    // 상품 세부 정보를 가져오는 함수
    const fetchProductDetailsForBasket = useCallback(async () => {

        try {
            const basketItems = [];
            const allSelectedBaskets = [...todayPickupBaskets, ...reservationPickupBaskets];
            for (const basketId of allSelectedBaskets) {
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
    }, [selectedTodayPickupBaskets]);

    // 상품 세부 정보를 가져오는 함수
    const fetchBasketItems = async (basketId) => {
        if (!basketId) {
            return [];
        }

        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_API_URL}/getBasketItems/${basketId}`);
            if (response.status === 200) {
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
        if (todayPickupBaskets.length > 0 || reservationPickupBaskets.length > 0) {
            fetchProductDetailsForBasket();
        }
    }, [todayPickupBaskets, reservationPickupBaskets, fetchProductDetailsForBasket]);

    // 쿠폰 목록을 서버에서 가져오는 함수
    const fetchCoupons = async () => {
        setLoadingCoupons(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_API_URL}/showAllCoupon/userId/${userId}`);
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

    const handleCouponSelection = (couponItem) => {
        setCoupon(couponItem);
        console.log("Selected Coupon:", couponItem);
    };


    const handleCheckout = async () => {
        if (!userId) {
            alert('User ID is missing.');
            return;
        }

        const orderTransactionDTO = basketItemsList.map(item => {
            const orderDate = new Date();
            orderDate.setHours(orderDate.getHours() + 9);

            const pickupType = (orderInfo.pickupType === "TODAY") ? "TODAY" : (todayPickupBaskets.includes(item.basketId) ? 'TODAY' : 'RESERVATION');
            const pickupDate = new Date(orderDate);
            const orderAmount = finalAmount;
            const pointAmount = pointsToUse;
            const couponId = coupon ? coupon.couponId : null;

            if (pickupType === 'TODAY') {
                pickupDate.setDate(orderDate.getDate() + 1);
            } else {
                pickupDate.setDate(orderDate.getDate() + 5);
            }

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
                pickupType: pickupType,
                price: productDetailsMap.get(item.productId)?.price || 0,
                changeStatus: 'ORDERED',
                changeDate: orderDate.toISOString(),
                orderAmount: orderAmount,
                addedPoint: addedPoint,
                pointAmount: pointAmount,
                totalPoint: totalPoint,
                couponId: couponId
            };
        });

        try {
            localStorage.setItem('orderTransactionDTO', JSON.stringify(orderTransactionDTO));
            localStorage.setItem('userId', userId);

            // 결제요청 API - Young5097
            const paymentResponse = await axios.post(`${process.env.REACT_APP_SERVER_API_URL}/api/kakaoPay`, localStorage.getItem("orderTransactionDTO"),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

            const { next_redirect_pc_url, next_redirect_mobile_url, tid } = paymentResponse.data;
            localStorage.setItem('tid', tid);

            const userAgent = navigator.userAgent;
            let redirectURL;
            if (/Android|iPhone|iPad/i.test(userAgent)) {
                redirectURL = next_redirect_mobile_url;
            } else {
                redirectURL = next_redirect_pc_url;
            }

            window.location.href = redirectURL;

        } catch (error) {
            alert(`Error during payment process: ${error.message}`);
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
                            <th>픽업 유형</th>
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
                                        {/* //바로구매버튼 클릭 시 제품 정보와 픽업유형 수정 - giuk-kim2 */}
                                        <td>{
                                            (orderInfo.pickupType === "TODAY") ? "TODAY" : (todayPickupBaskets.includes(item.basketId) ? 'TODAY' : 'RESERVATION')
                                        }
                                        </td>
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
                        if (!prev) fetchCoupons(); // 목록이 보이지 않을 때만 쿠폰 목록을 새로 불러옴 pkh
                        return !prev;
                    });
                }}>
                    {coupon ? `쿠폰 선택 완료: ${coupon.name} - 할인: ${coupon.discountAmount.toLocaleString()} 원` : "보유 쿠폰 조회하기"}
                </button>

                {/* 쿠폰 목록  pkh */}
                {loadingCoupons ? (
                    <p>쿠폰 목록을 불러오는 중입니다...</p>
                ) : (
                    showCouponList && (
                        <div className="coupon-selection">
                            {couponList.length > 0 ? (
                                <ul>
                                    {couponList.map(couponItem => (
                                        <li key={couponItem.couponId}>
                                            <button onClick={() => handleCouponSelection(couponItem)}>
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

                {/* 포인트 사용 여부  pkh */}
                <div className="point-use">
                    <h2>포인트 사용</h2>
                    <button onClick={fetchUserPoints}>포인트 조회</button>
                    {userPoints > 0 && (
                        <div>
                            <p>보유 포인트: {userPoints} P</p>
                            <input
                                type="number"
                                value={pointsToUse}
                                onChange={(e) => setPointsToUse(Math.min(Number(e.target.value), userPoints))}
                            />
                            <button onClick={applyPoints}>포인트 적용</button>
                        </div>
                    )}
                </div>
            </div>

            {/* 결제 방법 선택 */}
            <div className="payment-section">
                <h2>결제 방법 선택</h2>
                <select
                    value={paymentMethod}
                    onChange={(e) => setOrderResult(prev => ({ ...prev, paymentMethod: e.target.value }))}>
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