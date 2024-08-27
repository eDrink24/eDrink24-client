import { format, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShowReservationPickupComponent.css';

// 제품 카테고리 목록
const categoryList = ['와인', '양주', '전통주', '논알콜', '안주'];

const ShowReservationPickupComponent = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrdersId, setSelectedOrdersId] = useState([]);
    const [showQuantityModal, setShowQuantityModal] = useState(false); // 모달 표시 상태
    const [selectedOrderId, setSelectedOrderId] = useState(null); // 선택된 주문 ID
    const [quantity, setQuantity] = useState(0); // 발주 수량 상태
    const [productNames, setProductNames] = useState({}); // 제품 이름 상태
    const storeId = localStorage.getItem("currentStoreId");
    const navigate = useNavigate();

    // 처음 렌더링될 때만 주문 목록 가져오기
    useEffect(() => {
        showReservationPickupPage();
        fetchProductNames(); // 제품 이름을 가져오기
    }, []);

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

    const showReservationPickupPage = async () => {
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showReservationPickupPage`, {
                method: "GET"
            });

            const resData = await response.json();

            // 데이터가 변경된 경우 상태 업데이트
            if (JSON.stringify(resData) !== JSON.stringify(orders)) {
                setOrders(resData);
            }

        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    // 제품 이름 가져오기
    const fetchProductNames = async () => {
        try {
            const productNamesMap = {};

            for (const category of categoryList) {
                const response = await fetch(`http://localhost:8090/eDrink24/showProductByCategory1/${category}`, {
                    method: "GET"
                });

                const products = await response.json();

                products.forEach(product => {
                    productNamesMap[product.productId] = product.productName;
                });
            }

            setProductNames(productNamesMap);

        } catch (error) {
            console.error('Error fetching product names:', error);
        }
    };

    // 발주하기 버튼 클릭 시 호출되는 함수
    const handleOrderClick = (ordersId) => {
        setSelectedOrderId(ordersId);
        setShowQuantityModal(true); // 수량 입력 모달 표시
    };

    // 발주 수량 입력 핸들러
    const handleQuantityChange = (e) => {
        setQuantity(Number(e.target.value)); // 입력된 수량으로 상태 업데이트
    };

    // 발주 처리 함수
    const handleAdminOrder = async () => {
        if (selectedOrderId && quantity > 0) {
            const order = orders.find(o => o.ordersId === selectedOrderId);
            if (!order) {
                alert("Order not found.");
                return;
            }

            // 발주 DTO 설정
            const InventoryDTO = {
                storeId,
                productId: order.productId,
                productName: productNames[order.productId] || 'Unknown', // 제품 이름 추가
                quantity,
                adminOrderQuantity: quantity
            };

            try {
                const response = await fetch(`http://localhost:8090/eDrink24/updateOrInsertInventory/${storeId}/${order.productId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(InventoryDTO)
                });

                // 주문 목록 새로고침
                showReservationPickupPage();
                setSelectedOrdersId([]);  // 선택된 항목 초기화
                setShowQuantityModal(false); // 모달 닫기
                setQuantity(0); // 수량 상태 초기화
            } catch (error) {
                console.error('Error placing order:', error);
            }
        }
    };

    const showAdminOrderListPage = () => {
        navigate(`/admin/AdminOrderListComponent`);
    };

    return (
        <div className="adminReservation-container">
            <h1 className="adminReservation-title">예약픽업 발주신청</h1>
            <div className="order-list">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>주문번호</th>
                            <th>고객명</th>
                            <th>제품명</th>
                            <th>주문날짜</th>
                            <th>상태</th>
                            <th>수량</th>
                            <th>신청</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.ordersId}>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="order-checkbox"
                                        checked={selectedOrdersId.includes(order.ordersId)}
                                        onChange={() => toggleSelectOrder(order.ordersId)}
                                    />
                                </td>
                                <td>{order.ordersId}</td>
                                <td>{order.userId}</td>

                                <td>{productNames[order.productId] || 'Unknown'}</td>
                                <td>{format(parseISO(order.orderDate), 'yyyy-MM-dd HH:mm:ss')}</td>
                                <td>{order.changeStatus ? "예약주문" : order.changeStatus}</td>
                                <td>{order.orderQuantity}</td>
                                <td>
                                    <button onClick={() => handleOrderClick(order.ordersId)}>발주</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 수량 입력 모달 */}
            {showQuantityModal && (
                <div className="quantity-modal">
                    <h3>발주할 수량을 입력하세요</h3>
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                    />
                    <button className="srp-quantity-modal-btn" onClick={handleAdminOrder}>발주</button>
                    <button className="srp-quantity-modal-btn" onClick={() => setShowQuantityModal(false)}>취소</button>
                </div>
            )}
        </div>

    );
};

export default ShowReservationPickupComponent;
