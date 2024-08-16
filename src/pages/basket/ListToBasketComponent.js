import React, { useEffect, useState, useCallback, useRef } from 'react';
import './ListToBasketComponent.css';
import TodayItem from './TodayItemComponent'; // TodayItem 컴포넌트 추가
import { getAuthToken } from '../../util/auth';
import { json, useLoaderData, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { selectedBasketState } from './BasketAtom';

function ListToBasketComponent() {
    // 초기 장바구니 데이터를 로드
    const initialBaskets = useLoaderData();
    const [baskets, setBaskets] = useState(initialBaskets); // 장바구니 상태 관리
    const [selectedBaskets, setSelectedBaskets] = useRecoilState(selectedBasketState); // 선택된 장바구니 항목 관리
    const navigate = useNavigate(); // 페이지 이동을 위한 훅

    // Ref 생성: 각각의 섹션을 참조하기 위함
    const todayPickupRef = useRef(null); // 오늘 픽업 섹션의 Ref
    const reservationPickupRef = useRef(null); // 예약 픽업 섹션의 Ref

    // 장바구니 데이터를 서버로부터 새로고침하는 함수
    const refreshBaskets = useCallback(async () => {
        const userId = localStorage.getItem("userId");

        const response = await fetch(`http://localhost:8090/eDrink24/showProductInBasket/${userId}`, {
            method: "GET"
        });

        if (response.ok) {
            const resData = await response.json();
            console.log(resData);
            setBaskets(resData); // 새로운 장바구니 데이터로 상태 업데이트
            setSelectedBaskets([]); // 선택된 장바구니 항목 초기화
        } else {
            console.error('Error fetching data:', response.statusText);
        }
    }, [setBaskets, setSelectedBaskets]);

    // 컴포넌트가 마운트될 때 장바구니 데이터를 새로고침
    useEffect(() => {
        refreshBaskets();
    }, [refreshBaskets]);

    // 특정 섹션으로 스크롤하는 함수
    const scrollToSection = (sectionRef, sectionName) => {
        setActiveSection(sectionName); // 현재 활성화된 섹션 설정

        const offset = 146;
        const topPosition = sectionRef.current.offsetTop - offset;

        window.scrollTo({
            top: topPosition,
            behavior: 'smooth',
        });
    };

    // 현재 활성화된 섹션(오늘픽업 또는 예약픽업)을 추적하기 위한 상태
    const [activeSection, setActiveSection] = useState('todayPickup');

    // 스크롤 위치에 따라 활성화된 섹션을 업데이트하는 이벤트 리스너 설정
    useEffect(() => {
        const handleScroll = () => {
            const offset = 146; // 네비게이션 바의 높이
            const todayPickupPosition = todayPickupRef.current.offsetTop - offset;
            const reservationPickupPosition = reservationPickupRef.current.offsetTop - offset;

            // 스크롤 위치에 따라 활성화된 섹션 변경
            if (window.scrollY >= reservationPickupPosition) {
                setActiveSection('reservationPickup');
            } else if (window.scrollY >= todayPickupPosition) {
                setActiveSection('todayPickup');
            }
        };

        window.addEventListener('scroll', handleScroll); // 스크롤 이벤트 리스너 추가

        return () => {
            window.removeEventListener('scroll', handleScroll); // 스크롤 이벤트 리스너 제거
        };
    }, []);

    // 선택된 장바구니 항목들을 삭제하는 함수
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

        refreshBaskets(); // 장바구니 데이터 새로고침
    }

    // 체크된 제품들을 주문 페이지로 이동시키는 함수
    async function moveToOrderPage() {
        const selectedCheckboxes = document.querySelectorAll("input:checked");
        const selectedBasketIds = [];

        selectedCheckboxes.forEach((checkbox) => {
            if (checkbox.value !== "0") {
                selectedBasketIds.push(checkbox.value);
            }
        });

        if (selectedBasketIds.length === 0) {
            alert("주문페이지로 이동하려면 적어도 하나의 제품을 선택해주세요.");
            return;
        }

        setSelectedBaskets(selectedBasketIds); // 선택된 장바구니 항목 설정

        const userId = localStorage.getItem("userId");

        navigate(`/eDrink24/order/${userId}`); // 주문 페이지로 이동
    }

    // 모든 장바구니 항목 선택/해제하는 함수
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

    // 개별 장바구니 항목 선택/해제하는 함수
    const toggleSelectBasket = (basketId) => {
        if (selectedBaskets.includes(basketId)) {
            setSelectedBaskets(selectedBaskets.filter(id => id !== basketId));
        } else {
            setSelectedBaskets([...selectedBaskets, basketId]);
        }
    };

    // 장바구니 항목의 수량을 업데이트하는 함수
    const updateQuantity = async (basketId, increment) => {
        const basket = baskets.find(basket => basket.basketId === basketId);
        if (!basket) return;

        const newQuantity = basket.items[0].basketQuantity + increment;

        if (newQuantity <= 0) return;

        const userId = localStorage.getItem("userId");
        const response = await fetch(`http://localhost:8090/eDrink24/updateBasketQuantity2`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: userId,
                productId: basket.items[0].productId,
                basketId: basket.basketId,
                basketQuantity: newQuantity
            })
        });

        if (!response.ok) {
            console.error('Error updating quantity:', response.statusText);
            return;
        }

        refreshBaskets(); // 장바구니 데이터 새로고침
    };

    // 선택된 장바구니 항목들의 총 금액을 계산
    const totalAmount = baskets.reduce((sum, basket) => {
        if (selectedBaskets.includes(basket.basketId)) {
            return sum + basket.items[0].price * basket.items[0].basketQuantity;
        }
        return sum;
    }, 0);

    // 선택된 장바구니 항목들의 총 수량을 계산
    const totalQuantity = baskets.reduce((sum, basket) => {
        if (selectedBaskets.includes(basket.basketId)) {
            return sum + basket.items[0].basketQuantity;
        }
        return sum;
    }, 0);

    return (
        <div className="basket-container">

            {/* 상단 네비게이션 바 */}
            <div className="basket-top-content">
                <div className="basket-nav-bar">
                    <button className="basket-back" onClick={() => { navigate(-1) }}>
                        <img className="back-icon" src="assets/common/backicon.png" alt="back" />
                    </button>
                    <h3>장바구니</h3>
                    <button className="basket-home" onClick={() => { navigate("/eDrink24") }}>
                        <img className="history-icon" src="assets/common/home.png" alt="home" />
                    </button>
                </div>
            </div>

                            {/* (오늘픽업/예약픽업) 네비게이션 바 */}
                            <div className="basket-pickup-bar">
                    <div className={`basket-nav-pickup ${activeSection === 'todayPickup' ? 'active' : ''}`} 
                        onClick={() => scrollToSection(todayPickupRef, 'todayPickup')}>
                        오늘픽업
                    </div>
                    <div className={`basket-nav-pickup ${activeSection === 'reservationPickup' ? 'active' : ''}`} 
                        onClick={() => scrollToSection(reservationPickupRef, 'reservationPickup')}>
                        예약픽업
                    </div>
                </div>

            {/* 메인 콘텐츠 컨테이너 */}
            <div className="basket-content-container">                
                <div ref={todayPickupRef} className="basket-content">
                    <span className="title1">
                        <strong>오늘픽업</strong>
                    </span>
                    <div className="basket-today-pickup">
                        <TodayItem
                            baskets={baskets}
                            selectedBaskets={selectedBaskets}
                            toggleSelectAll={toggleSelectAll}
                            deleteSelectedBaskets={deleteSelectedBaskets}
                            toggleSelectBasket={toggleSelectBasket}
                            updateQuantity={updateQuantity}
                        />
                    </div>
                </div>

                <div ref={reservationPickupRef} className="basket-content">
                    <span className="title1">
                        <strong>예약픽업</strong>
                    </span>
                    <div className="basket-reservation-pickup">
                        <TodayItem
                            baskets={baskets}
                            selectedBaskets={selectedBaskets}
                            toggleSelectAll={toggleSelectAll}
                            deleteSelectedBaskets={deleteSelectedBaskets}
                            toggleSelectBasket={toggleSelectBasket}
                            updateQuantity={updateQuantity}
                        />
                    </div>
                </div>
            </div>

            {/* 장바구니 요약 섹션 */}
            <div className="basket-summary">
                <div className="summary-item">
                    <span>총 상품 수량</span>
                    <span>{totalQuantity}개</span>
                </div>
                <div className="summary-item">
                    <span>총 상품금액</span>
                    <span>{totalAmount.toLocaleString()}원</span>
                </div>
                <div className="summary-item total">
                    <span>최종 결제금액</span>
                    <span>{totalAmount.toLocaleString()}원</span>
                </div>
                <button onClick={moveToOrderPage} className="order-button">
                    픽업 주문하기
                </button>
            </div>

        </div>
    );
}

// 서버에서 초기 장바구니 데이터를 로드하는 loader 함수
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
