import "./OrderComponent.css";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useLoaderData, useParams, useNavigate } from 'react-router-dom';
import NaverMapContainer from "./NaverMapContainer";

function OrderComponent() {
    const initialBasket = useLoaderData();
    const { userId, loginId } = useParams(); // loginId를 받아오는 것으로 수정
    const navigate = useNavigate();
    const [basket, setBasket] = useState(Array.isArray(initialBasket) ? initialBasket : []);
    const [storeId, setStoreId] = useState(null);
    const [pickupDate, setPickupDate] = useState(null);
    const [coupon, setCoupon] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [pointUse, setPointUse] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [storeSelectionOpen, setStoreSelectionOpen] = useState(false);
    const [couponSelectionOpen, setCouponSelectionOpen] = useState(false);
    const [stores, setStores] = useState([]);
    const [loadingStores, setLoadingStores] = useState(false);
    const [storeAddress, setStoreAddress] = useState('');

    useEffect(() => {
        if (loginId) {
            showAllBasket();
        }
    }, [loginId]);

    useEffect(() => {
        calculateTotals();
    }, [basket, coupon, pointUse]);

    useEffect(() => {
        if (storeSelectionOpen) {
            fetchStores();
        }
    }, [storeSelectionOpen]);

    useEffect(() => {
        if (couponSelectionOpen) {
            fetchCoupons();
        }
    }, [couponSelectionOpen]);

    useEffect(() => {
        // 매장 주소가 변경될 때마다 지도 업데이트
        if (storeId) {
            const selectedStore = stores.find(store => store.storeId === storeId);
            if (selectedStore) {
                setStoreAddress(selectedStore.storeAddress);
            }
        }
    }, [storeId, stores]);

    

    async function showAllBasket() {
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showAllBasket/userId/${loginId}`, {
                method: "GET",
            });

            if (response.ok) {
                const resData = await response.json();
                setBasket(Array.isArray(resData) ? resData : []);
            } else {
                console.error('Failed to fetch basket. Status:', response.status);
                setBasket([]);
            }
        } catch (error) {
            console.error('Error fetching basket:', error);
            setBasket([]);
        }
    }

    async function fetchCoupons() {
        try {
            const response = await axios.get(`http://localhost:8090/eDrink24/showAllCoupon/loginId/${loginId}`);
            if (response.status === 200) {
                setCoupons(response.data);
            } else {
                console.error('Failed to fetch coupons. Status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    }

    function handleCouponSelect(selectedCoupon) {
        setCoupon(selectedCoupon);
        setCouponSelectionOpen(false);
    }

    function handleCouponButtonClick() {
        setCouponSelectionOpen(prev => !prev);
    }

    function calculateTotals() {
        const subtotal = basket.reduce((total, item) => total + (item.price * item.basketQuantity), 0);
        const couponDiscount = coupon ? coupon.discountAmount : 0;
        const pointAmount = pointUse ? subtotal * 0.05 : 0;
        const finalAmount = subtotal - couponDiscount - pointAmount;

        setTotalPrice(subtotal);
        setDiscount(couponDiscount + pointAmount);
        setFinalAmount(finalAmount);
    }

    function handlePaymentMethodChange(event) {
        setPaymentMethod(event.target.value);
    }

    async function fetchStores() {
        setLoadingStores(true);
        try {
            const response = await axios.get('http://localhost:8090/eDrink24/showAllStore');
            if (response.status === 200) {
                setStores(response.data);
            } else {
                console.error('Failed to fetch stores. Status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoadingStores(false);
        }
    }

    function handleStoreSelect(store) {
        setStoreId(store.storeId);
        setStoreSelectionOpen(false);
    }

    function handleStoreButtonClick() {
        setStoreSelectionOpen(prev => !prev);
    }

    async function handleCheckout() {
        const orderTransactionDTO = basket.map(item => ({
            storeId,
            userId,
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
console.log("orderTransactionDTO", orderTransactionDTO)
console.log("userId", userId)
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showAllBasket/userId/${userId}/buyProductAndSaveHistory`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderTransactionDTO),
            });

            if (response.ok) {
                alert("Purchase successful");
                navigate("/eDrink24");
            } else {
                const errorText = await response.text();
                alert(`Error processing purchase: ${errorText}`);
            }
        } catch (error) {
            console.error('Error processing purchase:', error);
            alert(`Error processing purchase: ${error.message}`);
        }
    }

    const selectedStore = stores.find(store => store.storeId === storeId);

    return (
        <div className="order-container">
            <h1>주문 및 결제</h1>

            {/* 픽업매장 선택하기 */}
            <div className="pickup-section" id="storeMap">
                <h2>픽업 장소</h2>
                {/* 지도 표시 영역 */}
                <NaverMapContainer storeAddress={storeAddress} />
                <button onClick={handleStoreButtonClick}>
                    {storeId ? `매장 선택 완료: ${stores.find(store => store.storeId === storeId)?.storeName}` : "픽업매장 선택하기"}
                </button>

                {/* 선택한 매장 정보 */}
                {selectedStore && (
                    <div className="selected-store-info">
                        <p><strong>매장 이름:</strong> {selectedStore.storeName}</p>
                        <p><strong>주소:</strong> {selectedStore.storeAddress}</p>
                        <p><strong>전화번호:</strong> {selectedStore.storePhoneNum}</p>
                    </div>
                )}

                {/* 매장 목록 */}
                {storeSelectionOpen && (
                    <div className="store-selection">
                        {loadingStores ? (
                            <p>매장 목록을 불러오는 중입니다...</p>
                        ) : (
                            <ul>
                                {stores.length > 0 ? (
                                    stores.map(store => (
                                        <li key={store.storeId}>
                                            <button onClick={() => handleStoreSelect(store)}>
                                                {store.storeName} - {store.storeAddress}
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <p>매장 목록이 없습니다.</p>
                                )}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* 방문 시간 지정 */}
            <div className="pickup-time-section">
                <h2>방문 시간 지정</h2>
                <input 
                    type="date" 
                    value={pickupDate || ''} 
                    onChange={(e) => setPickupDate(e.target.value)} 
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
                        {basket.length > 0 ? (
                            basket.map((item, index) => (
                                <tr key={index}>
                                    <td><img src={item.defaultImage} alt={item.productName} className="basket-image" /></td>
                                    <td>{item.productName}</td>
                                    <td>{item.price.toLocaleString()} 원</td>
                                    <td>{item.basketQuantity}</td>
                                </tr>
                            ))
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
                <button onClick={handleCouponButtonClick}>
                    {coupon ? `쿠폰 선택 완료: ${coupon.name} - 할인: ${coupon.discountAmount.toLocaleString()} 원` : "보유 쿠폰 조회하기"}
                </button>

                {/* 쿠폰 목록 */}
                {couponSelectionOpen && (
                    <div className="coupon-selection">
                        <ul>
                            {coupons.length > 0 ? (
                                coupons.map(coupon => (
                                    <li key={coupon.couponId}>
                                        <button onClick={() => handleCouponSelect(coupon)}>
                                            {coupon.name} - 할인: {coupon.discountAmount.toLocaleString()} 원
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <p>사용 가능한 쿠폰이 없습니다.</p>
                            )}
                        </ul>
                    </div>
                )}

                <label>
                    <input 
                        type="checkbox" 
                        checked={pointUse}
                        onChange={() => setPointUse(prev => !prev)}
                    />
                    이마트24 포인트 전액 사용
                </label>
            </div>

            {/* 최종 결제금액 */}
            <div className="payment-summary">
                <h2>최종 결제금액</h2>
                <div>총 상품금액: {totalPrice.toLocaleString()} 원</div>
                <div>총 할인금액: {discount.toLocaleString()} 원</div>
                <div>총 결제금액: {finalAmount.toLocaleString()} 원</div>
                <div>예상 적립금액: {Math.round(finalAmount * 0.01).toLocaleString()} 원</div>
            </div>

            {/* 결제수단 */}
            <div className="payment-methods">
                <h2>결제수단</h2>
                <label>
                    <input 
                        type="radio" 
                        name="payment-method" 
                        value="regular" 
                        checked={paymentMethod === 'regular'}
                        onChange={handlePaymentMethodChange}
                    />
                    일반결제
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="payment-method" 
                        value="quick" 
                        checked={paymentMethod === 'quick'}
                        onChange={handlePaymentMethodChange}
                    />
                    간편결제
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="payment-method" 
                        value="naverpay" 
                        checked={paymentMethod === 'naverpay'}
                        onChange={handlePaymentMethodChange}
                    />
                    네이버페이
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="payment-method" 
                        value="kakaopay" 
                        checked={paymentMethod === 'kakaopay'}
                        onChange={handlePaymentMethodChange}
                    />
                    카카오페이
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="payment-method" 
                        value="toss" 
                        checked={paymentMethod === 'toss'}
                        onChange={handlePaymentMethodChange}
                    />
                    토스페이
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="payment-method" 
                        value="payco" 
                        checked={paymentMethod === 'payco'}
                        onChange={handlePaymentMethodChange}
                    />
                    페이코
                </label>
            </div>

            {/* 결제하기 버튼 */}
            <div className="checkout-button">
                <button onClick={handleCheckout}>
                    총 {finalAmount.toLocaleString()} 원 결제하기
                </button>
            </div>
        </div>
    );
}

export default OrderComponent;
