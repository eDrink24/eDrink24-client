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
    const [activeTab, setActiveTab] = useState('today-pickup'); // 초기 탭을 'today-pickup'으로 설정

    useEffect(() => {
        refreshBaskets();
    }, []);

    // 장바구니에 저장되어 있는 목록 보여주기
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

    // 제품 삭제하기
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
 async function moveToOrderPage(e) {
    const selectedCheckboxes = document.querySelectorAll("input:checked");
    const selectedBasketIds = [];

    // 선택된 체크박스의 값을 가져옵니다.
    selectedCheckboxes.forEach((checkbox) => {
        if (checkbox.value !== "0") {
            selectedBasketIds.push(checkbox.value);
        }
    });

    if(selectedBasketIds.length === 0){
        alert("주문페이지로 이동하려면 적어도 하나의 제품을 선택해주세요.");
        return;
    }

    // Recoil 상태 업데이트
    setSelectedBaskets(selectedBasketIds);

    // userId 가져오기
    const userId = localStorage.getItem("userId");

    navigate(`/eDrink24/order/${userId}`);
}

    // 전체 선택/해제 기능
    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            if (baskets.length > 0) {
                const allBasketIds = baskets.map(basket => basket.basketId);
                setSelectedBaskets(allBasketIds);
            } else {
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

    // 수량 업데이트 기능 추가
    const updateQuantity = async (basketId, increment) => {
        const basket = baskets.find(basket => basket.basketId === basketId);
        if (!basket) return;
    
        const newQuantity = basket.items[0].basketQuantity + increment;
    
        if (newQuantity <= 0) return; // 수량이 0 이하로 내려가지 않도록
    
        // 서버에 수량 업데이트 요청 보내기
        const userId = localStorage.getItem("userId");
        const response = await fetch(`http://localhost:8090/eDrink24/updateBasketQuantity2`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId:userId,
                productId: basket.items[0].productId,
                basketId: basket.basketId,
                basketQuantity: newQuantity
            })
        });
    
        if (!response.ok) {
            console.error('Error updating quantity:', response.statusText);
            return;
        }
    
        // 수량 업데이트 후 장바구니 상태를 새로 고침
        refreshBaskets();
    };
    

    // 총 계산
    const totalAmount = baskets.reduce((sum, basket) => {
        if(selectedBaskets.includes(basket.basketId)){
           return sum + basket.items[0].price * basket.items[0].basketQuantity
        }
        return sum;
    }, 0); // 총 금액 계산
    const totalQuantity = baskets.reduce((sum, basket) => {
        if(selectedBaskets.includes(basket.basketId)) {
            return sum + basket.items[0].basketQuantity;
        }
        return sum;
    }, 0);

    // 탭 클릭 핸들러 함수 ( 클릭한 탭으로 활성 탭이 변경된다.)
    const handleTabClick = (tab) => {
        setActiveTab(tab); // 활성 탭으로 변경
    };

    return (
        <div className="basket-container">
            <div className="basket-home-header"> {/* 상단 네비게이션 바 */}
                <div className="basket-navigation-bar">
                    <button className="basket-back-button" onClick={() => { navigate(-1) }}>
                        <img src="assets/common/backIcon.png" alt="Back" className="basket-nav-bicon" /> {/* 뒤로 가기 아이콘 */}
                    </button>
                    <button className="basket-home-button">
                        <img src="assets/common/home.png" alt="Home" className="basket-nav-hicon" onClick={() => { navigate('/eDrink24') }} /> {/* 홈으로 가기 아이콘 */}
                    </button>
                </div>
            </div>

            <div className="basket-nav-bar">
                <div
                    className={`basket-nav-item ${activeTab === 'today-pickup' ? 'active' : ''}`}
                    onClick={() => handleTabClick('today-pickup')}>
                    오늘픽업
                </div>
                <div
                    className={`basket-nav-item ${activeTab === 'reservation' ? 'active' : ''}`}
                    onClick={() => handleTabClick('reservation')}>
                    예약픽업
                </div>
            </div>

                {/* 콘텐츠 영역 */}
                <div className="basket-content">
                    {activeTab === 'today-pickup' && (
                        <div className="basket-today-pickup active">
                            <div className="basket-header">
                                <label className="basket-all">
                                <input
                                    type="checkbox"
                                    onChange={toggleSelectAll}
                                    checked={selectedBaskets.length === baskets.length && baskets.length > 0}
                                    value="0"/>
                                전체 선택
                                </label >
                                <button onClick={deleteSelectedBaskets} className="basket-delete-button">
                                삭제 하기
                                </button>
                            </div>
                            <div>
                                <div className="basket-table">
                                        {baskets.map(basket => (
                                            <div key={basket.basketId} className="basket-item-container">
                                            
                                            {/* 체크 박스 */}
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    name='basketId'
                                                    value={basket.basketId}
                                                    checked={selectedBaskets.includes(basket.basketId)}
                                                    onChange={() => toggleSelectBasket(basket.basketId)}
                                                />
                                            </div>

                                            {/* 상품 이미지 + 이름 */}
                                            <div className="basket-item">
                                            <div className="basket-item-info">
                                                <img
                                                    src={basket.items[0].defaultImage}
                                                    alt={basket.items[0].productName}
                                                    className="basket-item-image"
                                                />
                                                <div className="basket-item-name">
                                                {basket.items[0].productName}
                                                </div>
                                            </div>
                                            </div>
                                            
                                            {/* 수량 버튼 추가 */}                                        
                                            <div className="basket-quantitiy-content">
                                            <div className="basket-quantitiy-box">
                                                {/* 감소 */}
                                                <button onClick={() => updateQuantity(basket.basketId, -1)}>-</button>
                                                {/* 현재 수량 */}
                                                <button className="basket-quantitiy">{basket.items[0].basketQuantity}</button>
                                                {/* 추가 */}
                                                <button onClick={() => updateQuantity(basket.basketId, 1)}>+</button>
                                            </div>

                                            {/* 상품 1개 가격 표시 */}
                                            <div className="basket-original-price">
                                                <div className="price">{basket.items[0].price}원</div>
                                            </div>
                                            </div>

                                            </div>
                                        ))}
                                </div>
                                <div className='line'></div>
                                <div className="basket-summary">
                                    <div className="summary-item">
                                        <span>총 상품 수량</span>
                                        <span>{totalQuantity}개</span> {/* 총 수량 표시 */}
                                    </div>
                                    <div className="summary-item">
                                        <span>총 상품금액</span>
                                        <span>{totalAmount}원</span> {/* 총 금액 표시 */}
                                    </div>
                                    <div className="summary-item total">
                                        <span>최종 결제금액</span>
                                        <span>{totalAmount}원</span> {/* 총 금액 표시 */}
                                    </div>
                                    <button onClick={moveToOrderPage} className="order-button">
                                        픽업 주문하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reservation' && (
                        <div className="productDetailComponent-content-item active">
                            예약픽업 내용
                        </div>
                    )}
                </div>

            {/* 하단고정 네비게이션 바 */}
            {/*<FooterComponent />*/}
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