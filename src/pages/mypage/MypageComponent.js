import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FooterComponent from '../../components/footer/FooterComponent.js'; // Footer 컴포넌트 import
import { logout } from '../login/LogoutComponent';
import './MypageComponent.css';

function MypageComponent() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [customerData, setCustomerData] = useState(null);

    useEffect(() => {
        // 로그인 상태 확인
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
                // 'Authorization': `Bearer ${token}`
            }
        });

        if (response) {
            const data = await response.json();
            setCustomerData(data);
        } else {
            console.error('error:', response.errorStatus());
        }
    }

    const navigateUpdateCustomer = () => {
        navigate("/mypage/updateCustomer", { state: { customerData } })
    }

    return (
        <div className="mypage-wrapper">
            <div className="mypage-container">

                <div className='mypage-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>{'<'}</button>
                    <h1>마이페이지</h1>
                    <div>
                        <button className="settings-button"><img src="assets/common/bell.png" alt="알람" /></button>
                    </div>
                </div>

                {/* 로그인 상태 따라 변동되는 정보창 */}
                {isLoggedIn && customerData ? (
                    <div className="user-info-prompt" onClick={() => { navigateUpdateCustomer() }} >
                        <div className="info-text">
                            <p><strong>{customerData.userName}님, 환영합니다!</strong></p>
                            <p className="info-role">{customerData.role}</p>
                        </div>
                        <div className="info-arrow">
                            <img src="assets/common/right-arrow.png" alt="arrow icon" />
                        </div>
                    </div>
                ) : (
                    <div className="login-signup-prompt" onClick={() => navigate("/login")} >
                        <div className="prompt-text">
                            <p><strong>로그인, 회원가입 하러가기!</strong></p>
                            <p>3초면돼요, 더 편리한 서비스를 이용하세요</p>
                        </div>
                        <div className="prompt-arrow">
                            <img src="assets/common/right-arrow.png" alt="arrow icon" />
                        </div>
                    </div>
                )}


                <div className="icons">
                    <div className="icon-item">
                        <img src="assets/mypage/point.png" alt="포인트" />
                        <span>포인트 <span className="additionalInfo">{isLoggedIn && customerData ? customerData.totalPoint : undefined}</span></span>
                    </div>
                    <div className="icon-item">
                        <img src="assets/mypage/coupon.png" alt="쿠폰" />
                        <span>쿠폰</span>
                    </div>
                    <div className="icon-item">
                        <img src="assets/mypage/dibs.png" alt="찜" />
                        <span>찜</span>
                    </div>
                    <div className="icon-item">
                        <img src="assets/mypage/basket.png" alt="장바구니" onClick={() => { navigate('/basket') }} />
                        <span>장바구니</span>
                    </div>
                </div>

                <hr />

                <div className="sections">
                    <div className="section">
                        <h3>고객센터</h3>
                        <div className="menu1">
                            <div className="icon-item2">
                                <img src="assets/mypage/문의하기.png" alt="문의하기" />
                                <span>문의하기</span>
                            </div>
                            <div className="icon-item2">
                                <img src="assets/mypage/공지사항.png" alt="공지사항" />
                                <span>공지사항</span>
                            </div>
                            <div className="icon-item2">
                                <img src="assets/mypage/문의.png" alt="1:1 문의" />
                                <span>1:1 문의</span>
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="sections">
                    <div className="section">
                        <h3>내 정보 관리</h3>
                        <div className="menu2">
                            {isLoggedIn && customerData ?
                                <>
                                    <div className="icon-item2" onClick={() => { navigateUpdateCustomer() }}>
                                        <img src="assets/common/setting.png" alt="회원정보수정" />
                                        <span>회원정보 수정</span>
                                    </div>
                                    <div className="icon-item2" onClick={isLoggedIn ? logout : undefined}>
                                        <img src="assets/mypage/로그아웃.png" alt="로그아웃" />
                                        <span>로그아웃</span>
                                    </div>
                                </>
                                :
                                <div className="icon-item2" onClick={() => navigate("/login")}>
                                    <img src="assets/mypage/로그아웃.png" alt="로그아웃" />
                                    <span>로그인</span>
                                </div>
                            }
                            <div className="icon-item2">
                                <img src="assets/mypage/경고.png" alt="계정 삭제" />
                                <span>계정 삭제</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterComponent />
        </div>

    );
}

export default MypageComponent;
