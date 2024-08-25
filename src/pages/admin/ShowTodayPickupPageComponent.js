import React, { useState, useEffect } from 'react';
import './ShowTodayPickupPageComponent.css'; // CSS 파일을 임포트합니다.
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

const ShowTodayPickupPageComponent = () => {
    const [orders, setOrders] = useState([]);
    console.log("orders", orders);
    const [selectedOrdersId, setSelectedOrdersId] = useState([]);
    const navigate = useNavigate();

    // 컴포넌트가 처음 렌더링될 때만 주문 목록을 가져옵니다.
    useEffect(() => {
        showOrdersToAdminPageOrders();
    }, [orders]);

    // 전체 선택/해제 기능
    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            if (orders.length > 0) {
                const allOrderIds = orders.map(order => order.ordersId);
                setSelectedOrdersId(allOrderIds);
            }
        } else {
            setSelectedOrdersId([]);
        }
    };

    // 개별 항목 선택/해제
    const toggleSelectOrder = (ordersId) => {
        if (selectedOrdersId.includes(ordersId)) {
            setSelectedOrdersId(selectedOrdersId.filter(id => id !== ordersId));
        } else {
            setSelectedOrdersId([...selectedOrdersId, ordersId]);
        }
    };

    // 즉시픽업 목록페이지 (아직 픽업이 완료되지 않았을 때)
    const showOrdersToAdminPageOrders = async () => {
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showPickupPage`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const resData = await response.json();
            console.log("resData:", resData);

            // 데이터가 변경된 경우에만 상태를 업데이트합니다.
            if (JSON.stringify(resData) !== JSON.stringify(orders)) {
                setOrders(resData);
            }

        } catch (error) {
            console.error('Error fetching products:', error);
        }

    };

    // 픽업완료 버튼 클릭 시 상태변화 업데이트
    const handlePickupComplete = async () => {
        try {
            for (const ordersId of selectedOrdersId) {
                const response = await fetch(`http://localhost:8090/eDrink24/updateStateAfterCompletedPickup/${ordersId}`, {
                    method: "PUT"
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }


                showOrdersToAdminPageOrders();
                setSelectedOrdersId([]);  // 선택된 항목 초기화

                console.log("Updated Orders:", orders); // orders 상태를 로그로 확인

            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const showPickupCompletedPage = () => {
        navigate(`/admin/todayPickupCompleted`);
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title">즉시픽업 목록</h1>
            <div className="order-list">
                <label className="admin-all">
                    <input
                        type="checkbox"
                        checked={orders.length > 0 && selectedOrdersId.length === orders.length}
                        onChange={toggleSelectAll}
                        value="0" />
                    전체 선택
                </label >
                <ul>
                    {orders.map(order => (
                        <li key={order.ordersId} className="order-item">
                            <input
                                type="checkbox"
                                className="order-checkbox"
                                checked={selectedOrdersId.includes(order.ordersId)}
                                onChange={() => toggleSelectOrder(order.ordersId)}
                            />
                            <div className="order-details">
                                <div><strong>Order ID:</strong> {order.ordersId}</div>
                                <div><strong>Store ID:</strong> {order.storeId}</div>
                                <div><strong>User ID:</strong> {order.userId}</div>
                                <div><strong>Product ID:</strong> {order.productId}</div>
                                <div><strong>Order Date:</strong> {format(parseISO(order.orderDate), 'yyyy-MM-dd HH:mm:ss')}</div>
                                <div><strong>Completed:</strong> {order.isCompleted ? 'Yes' : 'No'}</div>
                                <div><strong>Status:</strong> {order.changeStatus}</div>
                                <div><strong>Quantity:</strong> {order.orderQuantity}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <button className="pickup-button" onClick={handlePickupComplete}>
                픽업완료
            </button>
            <button className="pickup-button" onClick={showPickupCompletedPage}>
                픽업완료 내역보기
            </button>
        </div>
    );
};

export default ShowTodayPickupPageComponent;
