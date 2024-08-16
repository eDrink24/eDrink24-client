import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

const PickupCompletedPage = () => {
    const [completedOrders, setCompletedOrders] = useState([]);

    useEffect(() => {
        PickupCompletedPage();
    }, []);

    // 즉시픽업 완료된 것만 보여줌.
    const PickupCompletedPage = async () => {
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showPickupCompletedPage`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const resData = await response.json();
            console.log("resData:", resData);
            setCompletedOrders(resData);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title">픽업주문 완료내역</h1>
            <div className="order-list">
                <ul>
                    {completedOrders.map(order => (
                        <li key={order.ordersId} className="order-item">
                            <div className="order-details">
                                <div><strong>Order ID:</strong> {order.ordersId}</div>
                                <div><strong>Store ID:</strong> {order.storeId}</div>
                                <div><strong>User ID:</strong> {order.userId}</div>
                                <div><strong>Product ID:</strong> {order.productId}</div>
                                <div><strong>Order Date:</strong> {format(parseISO(order.orderDate), 'yyyy-MM-dd HH:mm:ss')}</div>
                                <div><strong>Completed:</strong> {order.isCompleted ? 'Yes' : 'No'}</div>
                                <div><strong>Status:</strong> {order.changeStatus}</div>
                                <div><strong>PickUp Date:</strong> {format(parseISO(order.changeDate), 'yyyy-MM-dd HH:mm:ss')}</div>
                                <div><strong>Quantity:</strong> {order.orderQuantity}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PickupCompletedPage;
