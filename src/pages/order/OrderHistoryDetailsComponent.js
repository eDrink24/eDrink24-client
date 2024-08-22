import './OrderHistoryDetailsComponent.css'
import { useState, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 

function OrderHistoryDetailsComponent() {
    
    const [orderHistoryDetails, setOrderHistoryDetails] = useState([]);
    const location = useLocation();
    const { orderDate } = location.state // OrderHistoryComponent에서 넘겨준 orderDate 가져오기
    const userId = localStorage.getItem('userId');
    //const storeId = localStorage.getItem('currentStoreId');

    const navigate = useNavigate();

    console.log("AAAAAAAA",orderDate);

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
        console.log("BBBBBBBBB:", orderHistoryDetails);
    };

    useEffect(() => {
        console.log("useEffect")
        fetchOrderHistoryDetails();
    }, [userId, orderDate]);

    // 총 상품금액, 총 할인금액, 총 결제금액, 예상 적립금액 계산
    const totalAmount = orderHistoryDetails.reduce((total, item) => total + (item.price * item.orderQuantity), 0);
    console.log("CCCCCCCCCCC1",totalAmount);
    console.log("CCCCCCCCCCC2",orderHistoryDetails);
    let totalPaid = 0;
    if(orderHistoryDetails.length > 0){
        totalPaid = orderHistoryDetails[0].orderAmount;
        console.log("DDDDDDDDDDDD1",  totalPaid);
    }
    const totalDiscount = totalAmount - totalPaid;
    const points = totalPaid * 0.01;

    return (
        <div className="orderDetails-container">
            <h2>상세 정보</h2>

            <div className="order-history-details-section">
                <h1>주문 내역</h1>
                {orderHistoryDetails.length > 0 ? (
                    <div className="order-details-group">
                        <table>
                            <thead>
                                <tr>
                                    <th>상품 이미지</th>
                                    <th>상품 이름</th>
                                    <th>가격</th>
                                    <th>수량</th>
                                    <th>픽업유형</th>
                                    <th>픽업완료여부</th>
                                    <th>픽업매장</th>
                                    <th>픽업일시</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderHistoryDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <img
                                                src={item.defaultImage}
                                                alt={item.productName}
                                                className="product-image"
                                                style={{ width: '100px', height: 'auto' }}
                                            />
                                        </td>
                                        <td>{item.productName}</td>
                                        <td>{item.price.toLocaleString()} 원</td>
                                        <td>{item.orderQuantity || 0}</td>
                                        <td>{item.pickupType === 'TODAY' ? '오늘 픽업' : '예약 픽업'}</td>
                                        <td>{item.isCompleted == 1 ? '완료' : '미완료'}</td>
                                        <td>{item.storeName}</td>
                                        <td>{item.pickupDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="order-summary">
                            <h2>주문 요약</h2>
                            <p><strong>결제수단:</strong> {'카카오페이'}</p>
                            <p><strong>총 상품금액:</strong> {totalAmount} 원</p>
                            <p><strong>총 할인금액:</strong> {totalDiscount} 원</p>
                            <p><strong>총 결제금액:</strong> {totalPaid} 원</p>
                            <p><strong>예상 적립금액:</strong> {points} 원</p>
                        </div>
                    </div>
                ) : (
                    <p>주문 내역이 없습니다.</p>
                )}
            </div>
        </div>
    );
    
}

export default OrderHistoryDetailsComponent;