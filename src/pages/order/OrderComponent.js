import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { basketState, selectedReservationPickupBaskets, selectedTodayPickupBaskets } from '../basket/BasketAtom.js';
import { orderState } from './OrderAtom.js';
import './OrderComponent.css';

import back from '../../assets/common/back.png';
import home from '../../assets/common/home.png';

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
    const [userPoints, setUserPoints] = useState(null);  // 사용자의 총 포인트
    const [pointsToUse, setPointsToUse] = useState(0);  // 사용자가 입력한 포인트
    const { paymentMethod } = orderResult;

    const userId = localStorage.getItem('userId'); // userId를 로컬스토리지에서 가져오기
    const storeId = localStorage.getItem('currentStoreId');

    const todayPickupBaskets = useRecoilValue(selectedTodayPickupBaskets);
    const reservationPickupBaskets = useRecoilValue(selectedReservationPickupBaskets);
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
            const response = await axios.get(`http://localhost:8090/eDrink24/showTotalPoint/${userId}`);
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
            console.log(">>>>>>>>>>>>>>>",basketItemsList);
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
            const response = await axios.get(`http://localhost:8090/eDrink24/getBasketItems/${basketId}`);
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
                ordersId: item.ordersId,
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
                point: addedPoint,
                saveDate: orderDate.toISOString(),
                pointAmount: pointAmount,
                totalPoint: totalPoint,
                couponId: couponId
            };
        });

        try {
            localStorage.setItem('orderTransactionDTO', JSON.stringify(orderTransactionDTO));
            localStorage.setItem('userId', userId);

            // 결제요청 API - Young5097
            const paymentResponse = await axios.post('http://localhost:8090/eDrink24/api/kakaoPay', localStorage.getItem("orderTransactionDTO"),
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

    // 버튼 클릭 핸들러 함수
    const handleDirectHome = () => {
        navigate("/");
    };


    return (

        <div className="order-wrapper">
            <div className="order-container">
                <div className='order-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <h1>주문/결제</h1>
                    <div>
                        <button className="settings-button" onClick={handleDirectHome}>
                            <img src={home} alt="셋팅" />
                        </button>
                    </div>
                </div>

                <div className="order-item-section">
                    <div className="order-section-title">
                        <h2>주문상품</h2>
                    </div>

                    {basketItemsList.length > 0 ? (
                        basketItemsList.map((item, index) => {
                        const productDetails = productDetailsMap.get(item.productId);
                        return (
                            <div key={index} className="order-item-box">
                                <div className="order-pickUp-state">
                                    {(orderInfo.pickupType === "오늘픽업 상품") ? "오늘픽업 상품" : (todayPickupBaskets.includes(item.basketId) ? '오늘픽업 상품' : '예약픽업 상품')}
                                </div>
                                <div className="order-info">
                                    <img
                                        className="order-item-img"
                                        src={productDetails?.defaultImage || 'default-image-url.jpg'}
                                        alt={productDetails?.productName || '상품 이미지 없음'}
                                    />
                                    <div className="order-item-info">
                                        <span>{productDetails?.productName || '상품 이름 없음'}</span>
                                        <a>선택 수량 : {item.basketQuantity || 0}개</a>
                                        <h6>{productDetails?.price !== undefined ? productDetails.price.toLocaleString() : '가격 정보 없음'} 원 </h6>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                    ) : (
                        <a className="empty">장바구니에 아이템이 없습니다.</a>
                    )}
                </div>

            <div className="line4"></div>

                <div className="discount-section">
                    <div className="order-section-title">
                        <h2>쿠폰/적립할인</h2>
                    </div>

                    <div className="order-discount">
                        <div className="order-section-subTitle">
                            <span>보유쿠폰</span>
                        </div>

                        <div className="discount-container">
                            <div className="text-box">
                                {loadingCoupons ? "쿠폰 목록을 불러오는 중입니다..." : (
                                    couponList.length > 0 
                                        ? `쿠폰 선택 완료: ${coupon?.name} - 할인: ${coupon?.discountAmount?.toLocaleString()} 원`
                                        : showCouponList 
                                            ? "보유 쿠폰이 없습니다."
                                            : "조회하기 버튼을 눌러주세요"
                                )}
                            </div>

                            <button className="custom-button" onClick={() => {
                                setShowCouponList(prev => {
                                    if (!prev) fetchCoupons(); // 목록이 보이지 않을 때만 쿠폰 목록을 새로 불러옴
                                    return !prev;
                                });
                            }}>
                                조회하기
                            </button>
                        </div>

                        {/* 쿠폰 목록 */}
                        {showCouponList && couponList.length > 0 && (
                            <div className="coupon-selection">
                                <ul>
                                    {couponList.map(couponItem => (
                                        <li key={couponItem.couponId}>
                                            <button onClick={() => handleCouponSelection(couponItem)}>
                                                {couponItem.name} - 할인: {couponItem.discountAmount.toLocaleString()} 원
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="order-section-subTitle">
                            <span>포인트</span>
                        </div>

                        <div className="discount-container">
                            <div className="text-box">
                                {userPoints === null 
                                    ? "포인트 조회 버튼을 눌러주세요" 
                                    : `보유 포인트: ${userPoints} P`}
                            </div>

                            <button className="custom-button" onClick={fetchUserPoints}>
                                전액사용
                            </button>
                        </div>

                        {userPoints > 0 && (
                            <div className="point-selection">
                                <input
                                    type="number"
                                    value={pointsToUse}
                                    onChange={(e) => setPointsToUse(Math.min(Number(e.target.value), userPoints))}
                                    placeholder="사용할 포인트 입력"
                                />
                                <button className="custom-button" onClick={applyPoints}>
                                    포인트 적용
                                </button>
                            </div>
                        )}
                    </div>

                </div>

            <div className="line4"></div>

                {/* 결제 방법 선택 */}
                <div className="payment-section">
                    <div className="order-section-title">
                        <h2>결제 방법 선택</h2>
                    </div>
                    <div className="payment-section-container">
                    <select
                        value={paymentMethod}
                        onChange={(e) => setOrderResult(prev => ({ ...prev, paymentMethod: e.target.value }))}>
                        <option value="">결제 방법을 선택하세요</option>
                        <option value="creditCard">신용카드</option>
                        <option value="paypal">페이팔</option>
                        <option value="bankTransfer">계좌이체</option>
                    </select>
                    </div>
                </div>

                <div className="order-total-price">
                    {/* 주문 총액 */}
                    <div className="total-section">
                        <div className="order-final-title">
                            <h2>결제정보</h2>
                            <span>총 상품금액 : {totalPrice.toLocaleString()} 원</span>
                            <span>총 할인금액 : {discount.toLocaleString()} 원</span>
                        </div>
                        <div className="line2"></div>
                        <div className="order-totalPrice">
                            <span><strong>총 결제금액 : {finalAmount.toLocaleString()} 원</strong></span>
                        </div>
                    </div>

                    {/* 결제 버튼 */}
                    <button className="order-final-button" onClick={handleCheckout}>
                        결제하기
                    </button>
                </div>

            </div>
        </div>
    );
}

export default OrderComponent;