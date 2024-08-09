
import React, { useEffect, useState } from 'react';
import './ListToBasketComponent.css';
import { getAuthToken } from '../../util/auth';
import { json, useLoaderData, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { selectedBasketState } from './BasketAtom';

function ListToBasketComponent() {
    const initialBaskets = useLoaderData();
    const [baskets, setBaskets] = useState(initialBaskets);
    const [selectedBaskets, setSelectedBaskets] = useRecoilState(selectedBasketState); // Recoil 상태 사용
    const navigate = useNavigate();

    useEffect(() => {
        refreshBaskets();
    }, []);

    //장바구니에 저장되어 있는 목록 보여주기
    async function refreshBaskets() {
        const userId = localStorage.getItem("userId");

        const response = await fetch(`http://localhost:8090/eDrink24/showProductInBasket/${userId}`, {
            method: "GET"
        });

        if (response.ok) {
            const resData = await response.json();
            console.log(resData);
            setBaskets(resData);
            setSelectedBaskets([]);
        } else {
            console.error('Error fetching data:', response.statusText);
        }
    }

    //제품 삭제하기
    async function deleteSelectedBaskets() {
        const userId = localStorage.getItem("userId");

        for (const basketId of selectedBaskets) {
            const response = await fetch(`http://localhost:8090/eDrink24/deleteProductByBasketIdInBasket/${userId}/${basketId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                console.error('Error deleting basket:', response.statusText);
            }
        }

        refreshBaskets();
    }

    
  // 체크된 제품들 픽업 주문하기 클릭 시 주문 페이지로 이동
  async function moveToOrderPage() {

    // 선택된 체크박스들을 가져옵니다.
    var selectedCheckboxes = document.querySelectorAll("input:checked");
    var selectedBasketIds = [];

    // 선택된 체크박스의 값을 가져옵니다.
    selectedCheckboxes.forEach((checkbox) => {
        if (checkbox.value !== "0") {
            selectedBasketIds.push(checkbox.value);
        }
    });

    // Recoil 상태 업데이트
    setSelectedBaskets(selectedBasketIds);

    // userId 가져오기
    const userId = localStorage.getItem("userId");

    navigate(`/eDrink24/order/${userId}`);
}

    // 전체 선택/해제 기능
    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            if(baskets.length > 0){
                const allBasketIds = baskets.map(basket => basket.basketId);
                setSelectedBaskets(allBasketIds);
            }else{
                setSelectedBaskets([]);
            }
        } else {
            setSelectedBaskets([]);
        }
    };

    // 개별 항목 선택/해제
    const toggleSelectBasket = (basketId) => {
        if (selectedBaskets.includes(basketId)) {
            setSelectedBaskets(selectedBaskets.filter(id => id !== basketId));
        } else {
            setSelectedBaskets([...selectedBaskets, basketId]);
        }
    };

    // 총 계산
    const totalAmount = baskets.reduce((sum, basket) => sum + basket.items[0].price * basket.items[0].basketQuantity, 0);

    return (
        <div className="basket-container">
            <basket-h1>장바구니</basket-h1>
            <div className="basket-header">
                <label>
                    <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={selectedBaskets.length === baskets.length && baskets.length > 0}
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
                                    <img src={basket.items[0].defaultImage} alt={basket.items[0].productName} className="product-image" />
                                    {basket.items[0].productName}
                                </td>
                                <td className="price">{basket.items[0].price}원</td>
                                <td>{basket.items[0].basketQuantity}</td>
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
                <button onClick={moveToOrderPage} className="order-button">픽업 주문하기</button>
            </div>
        </div>
    );
}

export async function loader({ request }) {
    const token = getAuthToken();
    const userId = localStorage.getItem("userId");

    const response = await fetch(`http://localhost:8090/eDrink24/showProductInBasket/${userId}`, {
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