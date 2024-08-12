import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './HistoryComponent.css';

function HistoryComponent() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('today-pickup'); // 초기 탭을 'today-pickup'으로 설정
    
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
    const [customerData, setCustomerData] = useState(null); // 고객 데이터 관리

    useEffect(() => {
        const token = localStorage.getItem("jwtAuthToken");
        const loginId = localStorage.getItem("loginId");

        if (token && loginId) {
            setIsLoggedIn(true);
            fetchCustomerData(token, loginId);
        }
    }, []);

    const fetchCustomerData = async (token, loginId) => {
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/selectCustomerMyPage/${loginId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCustomerData(data);
            } else {
                console.error('Failed to fetch customer data');
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
        }
    };

    const navigateUpdateCustomer = () => {
        navigate("/eDrink24/mypage/updateCustomer", { state: { customerData } });
    };

    // 탭 클릭 핸들러 함수 (클릭한 탭으로 활성 탭이 변경된다.)
    const handleTabClick = (tab) => {
        setActiveTab(tab); // 활성 탭으로 변경
    };

    return (

        // 전체 컨테이너
        <div className="history-container">

            {/* 상단 네비게이션 바 */}
            <div className="history-nav-bar">

                {/* 뒤로가기 아이콘 */}
                <button className="history-back" onClick={() => { navigate(-1) }}>
                    <img className="back-icon" src="assets/common/backicon.png" alt="back" />
                </button>

                {/* 메인 타이틀 */}
                <h3>주문/픽업조회</h3>

                {/* 장바구니 아이콘 */}
                <button className="history-bag"  onClick={() => { navigate('/eDrink24/basket') }}>
                    <img className="history-cicon" src="assets/common/bag.png" alt="bag" />
                </button>

            </div>


            {/* 탭 내비게이션 */}
            <div className="history-tab-bar">
                <div className={`history-tab-item ${activeTab === 'today-pickup' ? 'active' : ''}`}
                    onClick={() => handleTabClick('today-pickup')}>
                    <span>오늘픽업{'('}
                    {isLoggedIn && customerData && (
                        <span className="additionalInfo">
                            {customerData.totalPoint}
                            {/* ==> customerData._________ 여기에 출력하고자 하는걸 넣으면 됨.  */}
                        </span>
                    )}{')'}
                    </span>
                </div>
                <div className={`history-tab-item ${activeTab === 'reservation' ? 'active' : ''}`}
                    onClick={() => handleTabClick('reservation')}>
                    <span>예약픽업{'('}
                    {isLoggedIn && customerData && (
                        <span className="additionalInfo">
                            {customerData.totalPoint}
                            {/* ==> customerData._________ 여기에 출력하고자 하는걸 넣으면 됨.  */}
                        </span>
                    )}{')'}
                    </span>
                </div>
                </div>


            <div className="history-main-content">

                {/* 오늘 픽업 내용 */}
                {activeTab === 'today-pickup' && (
                    <div className="history-today-pickup active">
                        <div className="history-header">
                            오늘픽업 내용 {/* 여기에 컨텐츠 들어감 */}
                        </div>
                    </div>
                )}


                {/* 예약 픽업 내용 */}
                {activeTab === 'reservation' && (
                    <div className="history-reservation active">
                        예약픽업 내용 {/* 여기에 컨텐츠 들어감 */}
                    </div>
                )}

            </div>


            {/* 하단 네비게이션 바 */}
            <FooterComponent />


        </div>
    );
}

export default HistoryComponent;
