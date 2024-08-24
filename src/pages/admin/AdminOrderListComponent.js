import React, { useEffect, useState } from 'react';
import './AdminOrderComponent.css';  // 기존 스타일을 사용할 경우
import FooterComponent from '../../components/footer/FooterComponent.js';
import { useNavigate } from 'react-router-dom';

const AdminOrderListComponent = () => {
    const [orderList, setOrderList] = useState([]);  // 발주 내역 상태
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrderList();
    }, []);

    // 발주 내역 조회 API 호출
    const fetchOrderList = async () => {
        const storeId = localStorage.getItem("currentStoreId");
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/showAdminOrderList/${storeId}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order list');
            }

            const resData = await response.json();
            setOrderList(resData);
        } catch (error) {
            console.error('Error fetching order list:', error);
        }
    };

    // 홈으로 돌아가기 버튼 핸들러
    const returnHome = () => {
        navigate(`/`);
    };

    return (
        <div className="orderlist-container">
            <div className="orderlist-home-header">
                <div className="orderlist-navigation-bar">
                    <button className="orderlist-back-button" onClick={returnHome}>
                        <img src="assets/common/backIcon.png" alt="Back" className="orderlist-nav-bicon" />
                    </button>
                    <div className="orderlist-logo-box">
                        <img src="assets/common/emart24_logo.png" alt="eMart24" className="orderlist-nav-logo" />
                    </div>
                </div>
            </div>
            <div className="orderlist-body">
                <h1>발주 내역</h1>
                {orderList.length === 0 ? (
                    <p>발주 내역이 없습니다.</p>
                ) : (
                    <table className="orderlist-table">
                        <thead>
                            <tr>
                                <th>상품명</th>
                                <th>수량</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderList.map(order => (
                                <tr key={order.adminOrderHistoryId}>
                                    <td>{order.productName}</td>
                                    <td>{order.adminOrderQuantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <FooterComponent />
        </div>
    );
};

export default AdminOrderListComponent;
