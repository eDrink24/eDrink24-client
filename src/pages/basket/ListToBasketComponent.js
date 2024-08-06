import React, { useState } from 'react';
import './ListToBasketComponent.css';
import { getAuthToken } from '../../util/auth';
import { json, useLoaderData, useNavigate } from 'react-router-dom';

function ListToBasketComponent() {
    const xxx = useLoaderData();
    const [baskets, setBaskets] = useState(xxx);
    const [selectedBaskets, setSelectedBaskets] = useState([]);
    const navigate = useNavigate();

    //장바구니에 저장되어 있는 목록 보여주기
    async function refreshBaskets() {
        const token = getAuthToken();
        const loginId = localStorage.getItem("loginId");

        const response = await fetch(`http://localhost:8090/eDrink24/showProductInBasket/${loginId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const resData = await response.json();
            setBaskets(resData);
            setSelectedBaskets([]);
        } else {
            console.error('Error fetching data:', response.statusText);
        }
    }

    //제품 삭제하기
    async function deleteSelectedBaskets() {
        const token = getAuthToken();
        const loginId = localStorage.getItem("loginId");

        for (const basketId of selectedBaskets) {
            const response = await fetch(`http://localhost:8090/eDrink24/deleteProductByBasketIdInBasket/${loginId}/${basketId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Error deleting basket:', response.statusText);
            }
        }

        refreshBaskets();
    }

    async function showProductToOrderPage() {
        var xxx = document.querySelectorAll("input:checked");
        console.log("xxx:",xxx);
        var basketIds="";
        xxx.forEach(function(v, idx){
            console.log(idx,v);
            if(v.value != "0"){
                
                    basketIds += v.value+" ";
            
            }
            console.log(basketIds);

        })
        navigate(`/eDrink24/order/4/kko6235/${basketIds}`);
    }

    //
    async function refreshOrders() {
        const token = getAuthToken();
        const loginId = localStorage.getItem("loginId");

        const response = await fetch(`http://localhost:8090/eDrink24/showAllBasket/userId/${loginId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const resData = await response.json();
            setBaskets(resData);
            setSelectedBaskets([]);
        } else {
            console.error('Error fetching data:', response.statusText);
        }
    }

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            const allBasketIds = baskets.map(basket => basket.basketId);
            setSelectedBaskets(allBasketIds);
        } else {
            setSelectedBaskets([]);
        }
    };

    const toggleSelectBasket = (basketId) => {
        if (selectedBaskets.includes(basketId)) {
            setSelectedBaskets(selectedBaskets.filter(id => id !== basketId));
        } else {
            setSelectedBaskets([...selectedBaskets, basketId]);
        }
    };

    const totalAmount = baskets.reduce((sum, basket) => sum + basket.price * basket.basketQuantity, 0);

    return (
        <div className="basket-container">
            <basket-h1>장바구니</basket-h1>
            <div className="basket-header">
                <label>
                    <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={selectedBaskets.length === baskets.length}
                        value="0"
                    />
                    전체 선택
                </label>
                <button onClick={deleteSelectedBaskets} className="delete-button">삭제하기</button>
            </div>
            <table className="basket-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>상품명</th>
                        <th>가격</th>
                        <th>수량</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        baskets.map(basket => (
                            <tr key={basket.basketId} className="basket-item">
                                <td>
                                    <input
                                        type="checkbox" name='basketId' value={basket.basketId}
                                        checked={selectedBaskets.includes(basket.basketId)}
                                        onChange={() => toggleSelectBasket(basket.basketId)}
                                    />
                                </td>
                                <td className="product-info">
                                    <img src={basket.defaultImage} alt={basket.productName} className="product-image" />
                                    {basket.productName}
                                </td>
                                <td className="price">{basket.price}원</td>
                                <td>{basket.basketQuantity}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <div className="basket-summary">
                <div className="summary-item">
                    <span>총 상품금액</span>
                    <span>{totalAmount}원</span>
                </div>
                <div className="summary-item">
                    <span>총 할인금액</span>
                    <span>0원</span>
                </div>
                <div className="summary-item total">
                    <span>최종 결제금액</span>
                    <span>{totalAmount}원</span>
                </div>
                <button onClick={showProductToOrderPage} className="order-button">픽업 주문하기</button>
            </div>
        </div>
    );
}

export async function loader({ request }) {
    const token = getAuthToken();
    const loginId = localStorage.getItem("loginId");

    const response = await fetch(`http://localhost:8090/eDrink24/showProductInBasket/${loginId}`, {
        method: "GET",
    });

    if (response.status === 400 || response.status === 401 || response.status === 422) {
        return response;
    }

    if (!response.ok) {
        throw json({ message: 'Could not save event.' }, { status: 500 });
    }

    const resData = await response.json();
    return resData;
}

export default ListToBasketComponent;