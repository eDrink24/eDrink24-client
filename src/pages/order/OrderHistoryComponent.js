import { set } from 'date-fns';
import './OrderHistoryComponent.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { da } from 'date-fns/locale';

function OrderHistoryComponent() {

    const [orderHistory, setOrderHistory] = useState([]);
    const userId = localStorage.getItem('userId'); // userId를 로컬스토리지에서 가져오기
    const navigate = useNavigate();
    
    // 주문 내역 가져오기
    const fetchOrderHistory = async () => {

        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showOrderHistory/${userId}`);
            if (response.status === 200) {
                const data = await response.json();
                setOrderHistory(groupByOrderDate(data));
            } else {
                console.error('Failed to fetch basket items. Status:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Error fetching basket items:', error);
            return [];
        }
    };

    // 주문 내역을 orderDate 기준으로 그룹화
    const groupByOrderDate = (orders) => {
        return orders.reduce((groupedOrders, order) => {
            const date = new Date(order.orderDate).toLocaleDateString();
            if (!groupedOrders[date]) {
                groupedOrders[date] = [];
            }
            groupedOrders[date].push(order);
            return groupedOrders;
        }, {});
    };

    // 리뷰 작성하기 누르면 리뷰페이지로 이동 - giuk-kim2
    const moveToReviewPage = (date, idx) => {

        localStorage.setItem("orderHistory", JSON.stringify(orderHistory[date][idx])); // Object.keys(orderHistory) 제이슨의 키값을 가져오는 코드
        console.log("orderHistory[date]",orderHistory[date][idx]);
        navigate(`/eDrink24/review`);
    };


    // 리뷰 확인하기 누르면 리뷰확인페이지로 이동 - giuk-kim2
    const moveToMyReviewPage = async (reviewsId) => {
        try{
        const response = await fetch(`http://localhost:8090/eDrink24/checkMyReview/${userId}/${reviewsId}`,{
            method:"GET"
        });
        if(response.ok){
            const data = await response.json();        
            localStorage.setItem("reviewData",JSON.stringify(data));

            navigate('/eDrink24/checkMyReview');
        }
        
        }catch(error){
            console.error('에러가 발생했습니다.',error);
        }
        
    };

    const fetchData = async () => {
        await fetchOrderHistory();
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="order-container">
            <h2>주문 내역</h2>

            <div className="order-history-section">
                <h1>주문 내역</h1>
                {Object.keys(orderHistory).length > 0 ? (
                    Object.keys(orderHistory).map((date, index) => (
                        <div key={index} className="order-group">
                            <h3>{date}</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>상품 이미지</th>
                                        <th>상품 이름</th>
                                        <th>가격</th>
                                        <th>수량</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderHistory[date].map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <img
                                                    src={item.defaultImage || 'default-image-url.jpg'}
                                                    alt={item.productName || '상품 이미지 없음'}
                                                    className="basket-image"
                                                    style={{ width: '100px', height: 'auto' }}
                                                />
                                            </td>
                                            <td>{item.productName || '상품 이름 없음'}</td>
                                            <td>{item.price !== undefined ? item.price.toLocaleString() : '가격 정보 없음'} 원</td>
                                            <td>{item.orderQuantity || 0}</td>
                                            <td>
                                                {item.reviewsId ? (
                                                    <button onClick={() => moveToMyReviewPage(item.reviewsId)}>리뷰 확인하기</button>
                                                ) : (
                                                    <button onClick={() => moveToReviewPage(date, index)}>리뷰 작성하기</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                ) : (
                    <p>주문 내역이 없습니다.</p>
                )}
            </div>
        </div>
    );

}

export default OrderHistoryComponent;