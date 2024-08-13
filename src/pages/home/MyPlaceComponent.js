import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPlaceComponent.css';

function MyPlaceComponent() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [customerData, setCustomerData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("jwtAuthToken");
        const loginId = localStorage.getItem("loginId");

        if (token && loginId) {
            setIsLoggedIn(true);
            fetchCustomerData(token, loginId);
        }
    }, []);

    const fetchCustomerData = async (token, loginId) => {
        const response = await fetch(`http://localhost:8090/eDrink24/selectCustomerMyPage/${loginId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response) {
            const data = await response.json();
            setCustomerData(data);
        } else {
            console.error('error:', response.errorStatus());
        }
    };

    const navigateUpdateCustomer = () => {
        navigate("/eDrink24/mypage/updateCustomer", { state: { customerData } });
    };

    return (
        // 로그인 상태 따라 변동되는 주소정보
        <div className="home-my-place-container">
            {/* 회원 주소정보 */}
            <div className="my-home-address">
                {isLoggedIn && customerData ? (
                    <div className="login-myhome-address-info" onClick={navigateUpdateCustomer}> {/* onClick 부분 주소 수정해야함 */}
                        <img className="placeIcon" src="assets/common/place.png" alt="place-icon" />
                        <p><strong>{customerData.address1}{customerData.address2}</strong></p>
                    </div>
                ) : (
                    <div className="logout-myhome-address-info" onClick={() => navigate("/eDrink24/login")}> {/* onClick 부분 주소 수정해야함 */}
                        <img className="placeIcon" src="assets/common/place.png" alt="place-icon" />
                        <p><strong>주소정보를 추가해주세요!</strong></p>
                    </div>
                )}
            </div>

            {/* 픽업매장 주소 선택 */}
            <div className="pickup-shop-address">
                {isLoggedIn && customerData ? (
                    <div className="login-pickup-address-info" onClick={navigateUpdateCustomer}> {/* onClick 부분 주소 수정해야함 */}
                        <span>픽업매장</span>
                        <p><strong>{customerData.address1}</strong></p>
                    </div>
                ) : (
                    <div className="logout-pickup-address-info" onClick={() => navigate("/eDrink24/login")}> {/* onClick 부분 주소 수정해야함 */}
                        <span>픽업매장</span>
                        <p><strong>픽업 매장을 추가해주세요!</strong></p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyPlaceComponent;
