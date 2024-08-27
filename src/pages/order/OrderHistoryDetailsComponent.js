import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import back from '../../assets/common/back.png';
import bag from '../../assets/common/bag.png';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './OrderHistoryDetailsComponent.css';

function OrderHistoryDetailsComponent() {
    
    const [orderHistoryDetails, setOrderHistoryDetails] = useState([]);
    const location = useLocation();
    const { orderDate } = location.state // OrderHistoryComponent에서 넘겨준 orderDate 가져오기
    const userId = localStorage.getItem('userId');
    //const storeId = localStorage.getItem('currentStoreId');

    const navigate = useNavigate();

    // Date 객체를 문자열로 포맷
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // 주문 내역 상세정보 가져오기
    const fetchOrderHistoryDetails = async () => {

        try {
            const dateObject = new Date(orderDate);
            const formattedOrderDate = formatDate(dateObject);
            const response = await fetch(`http://localhost:8090/eDrink24/showOrderHistoryDetails/${userId}/${formattedOrderDate}`);
            if (response.status === 200) {
                const data = await response.json();
                setOrderHistoryDetails(data);
            } else {
                console.error('Failed to fetch basket item details. Status:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Error fetching basket item details:', error);
            return [];
        }
    };

    useEffect(() => {
        fetchOrderHistoryDetails();
    }, [userId, orderDate]);

    // 픽업 남은 시간 계산
    const countPickupTime = (pickupDate, orderDate) => {
        const pickup = new Date(pickupDate);
        const order = new Date(orderDate);
        const diffTime = pickup - order; // 초 차이
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 남은 일 수
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // 남은 시간
        return `${diffDays}일 ${diffHours}시간`;
    };

    // 총 상품금액, 총 할인금액, 총 결제금액, 예상 적립금액 계산
    const totalAmount = orderHistoryDetails.reduce((total, item) => total + (item.price * item.orderQuantity), 0);
    let totalPaid = 0;
    if(orderHistoryDetails.length > 0){
        totalPaid = orderHistoryDetails[0].orderAmount;
    }
    const totalDiscount = totalAmount - totalPaid;
    const points = totalPaid * 0.01;

    return (
        <div className="orderDetails-container">
            <div className='orderDetails-header'>
            <button className="back-button" onClick={() => { navigate(-1) }}>
                <img src={back} alt="뒤로가기" />
            </button>
            <h1>상세 정보</h1>
            <button className="bag-button" onClick={() => { navigate('/basket') }}>
                <img src={bag} alt="장바구니" />
            </button>
            </div>

            <div className="orderHistory-section">
                
                {orderHistoryDetails.length > 0 ? (
                    <div className="orderHistory-group">
                        <div className="orderHistory-main">
                            {orderHistoryDetails.map((item, index) => (
                                <div key={index} className="orderHistory-info">
                                    <div className="orderHistory-pickUp">
                                        <div>{item.pickupType === `TODAY` ? `오늘 픽업` : `예약 픽업`}</div>
                                    </div>

                                    <div className="orderHistory-infoMain">
                                        <div className="orderHistory-infoImg">
                                            <img
                                                src={item.defaultImage || 'default-image-url.jpg'}
                                                alt={item.productName || '상품 이미지 없음'}
                                                className="basket-image"
                                                style={{ width: '100px', height: 'auto' }}
                                            />
                                        </div>
                                        <div className="orderHistory-info-main">
                                            <span>{item.productName || '상품 이름 없음'}</span>
                                            <a>선택수량 : {item.orderQuantity || 0}</a>
                                            <p>{item.price !== undefined ? item.price.toLocaleString() : '가격 정보 없음'} 원</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="line"></div>

                        <div className="orderDetails-summary">
                            <div className="orderDetails-summaryTitle">
                                <h1>결제 정보</h1>
                            </div>

                            <div className="line2"></div>

                            <div className="subTitle-box">
                            <div className="orderDetails-subTitle">
                                <span><strong>결제수단</strong></span>
                                <a><strong>{'카카오페이'}</strong></a>
                            </div>
                            <div className="orderDetails-subTitle">
                                <span><strong>총 상품금액</strong></span>
                                <a><strong>{totalAmount} 원</strong></a>
                            </div>
                            <div className="orderDetails-subTitle">
                                <span><strong>총 할인금액</strong></span>
                                <a><strong>{totalDiscount} 원</strong></a>
                            </div>
                            </div>

                            <div className="line2"></div>

                            <div className="subTitle-box2">
                            <div className="orderDetails-subTitle2">
                                <span><strong>총 결제금액</strong></span>
                                <a><strong>{totalPaid} 원</strong></a>
                            </div>
                            <div className="orderDetails-subTitle2">
                                <span><strong>예상 적립금액</strong></span>
                                <a><strong>{points} 원</strong></a>
                            </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>주문 내역이 없습니다.</p>
                )}

                {/* 하단 네비게이션 바 */}
                <FooterComponent />
                
            </div>
        </div>
    );
    
}

export default OrderHistoryDetailsComponent;