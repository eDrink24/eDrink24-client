import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FooterComponent from '../../components/footer/FooterComponent.js'; // Footer 컴포넌트 import
import { logout } from '../login/LogoutComponent';
import './MypageComponent.css';

import back from '../../assets/common/back.png';
import bell from '../../assets/common/bell.png';
import set from '../../assets/common/set.png';

import mp_bag from '../../assets/mypage/mp_bag.png';
import mp_coupon from '../../assets/mypage/mp_coupon.png';
import mp_heart from '../../assets/mypage/mp_heart.png';
import mp_point from '../../assets/mypage/mp_point.png';
import 공지사항 from '../../assets/mypage/공지사항.png';
import 로그아웃 from '../../assets/mypage/로그아웃.png';
import 문의하기 from '../../assets/mypage/문의하기.png';
import 일대일문의 from '../../assets/mypage/일대일문의.png';


function MypageComponent() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [isOpen, setIsOpen] = useState(false); // 아코디언 상태 관리

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

        if (response.ok) {
            const data = await response.json();
            setCustomerData(data);
        } else {
            console.error('error:', response.statusText);
        }
    }

    const navigateUpdateCustomer = () => {
        navigate("/mypage/updateCustomer", { state: { customerData } })
    };

    const navigateManagerComponent = () => {
        navigate("/manager");
    }

    const toggleAccordion = () => {
        setIsOpen(!isOpen); // 아코디언 열림/닫힘 상태 전환
    };

    return (
        <div className="myPage-wrapper">
            <div className="myPage-container">

                <div className='myPage-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>
                        <img src={back} alt="뒤로가기" />
                    </button>
                    <h1>마이페이지</h1>
                    <div>
                        <button className="bell-button">
                            <img src={bell} alt="알람" />
                        </button>
                        <button className="settings-button" onClick={() => { navigateUpdateCustomer() }}>
                            <img src={set} alt="셋팅" />
                        </button>
                    </div>
                </div>

                {/* 로그인 상태 따라 변동되는 정보창 */}
                {isLoggedIn && customerData ? (
                    <div className="user-info-prompt">
                        <div className="info-text">
                            <p><strong>{customerData.userName}님, 환영합니다!</strong></p>
                            <p className="info-role">{customerData.role}</p>
                        </div>
                    </div>
                ) : (
                    <div className="login-signUp-prompt" onClick={() => navigate("/login")} >
                        <div className="prompt-text">
                            <p><strong>로그인/회원가입<br />하신 후 이용해주세요.</strong></p>
                            <p>간편로그인으로 편리하게 이용하기!</p>
                        </div>
                    </div>
                )}

                <div className="myPage-icon">
                    <div className="myPage-icon-item">
                        <img src={mp_point} alt="포인트" />
                        <span>포인트 <span className="myPage-additionalInfo">{isLoggedIn && customerData ? customerData.totalPoint : undefined}</span></span>
                    </div>
                    <div className="myPage-icon-item">
                        <img src={mp_coupon} alt="쿠폰" />
                        <span>쿠폰</span>
                    </div>
                    <div className="myPage-icon-item">
                        <img src={mp_heart} alt="찜" />
                        <span>찜</span>
                    </div>
                    <div className="myPage-icon-item">
                        <img src={mp_bag} alt="장바구니" onClick={() => { navigate('/basket') }} />
                        <span>장바구니</span>
                    </div>
                </div>

                <div className='line'></div>

                <div className="sections">
                    <div className="section">
                        <h3>고객센터</h3>
                        <div className="menu1">
                            <div className="icon-item2">
                                <img src={문의하기} alt="문의하기" />
                                <span>문의하기</span>
                            </div>
                            <div className="icon-item2">
                                <img src={공지사항} alt="공지사항" />
                                <span>공지사항</span>
                            </div>
                            <div className="icon-item2">
                                <img src={일대일문의} alt="1:1 문의" />
                                <span>1:1 문의</span>
                            </div>
                        </div>
                    </div>
                </div>

{/*                <div className='line3'></div> */}

                <div className="sections">
                    <div className="section">
                        <h3>내 정보 관리</h3>
                        <div className="menu2">
                            {isLoggedIn && customerData ?
                                <>
                                    <div className="icon-item2" onClick={() => { navigateManagerComponent() }}>
                                        <img src={userInfo} alt="회원정보수정" />
                                        <span>매니저계정으로 전환하기</span>
                                    </div>
                                    <div className="icon-item2" onClick={() => { navigateUpdateCustomer() }}>
                                        <img src={userInfo} alt="회원정보수정" />
                                        <span>회원정보 수정</span>
                                    </div>
                                    <div className="icon-item2" onClick={isLoggedIn ? logout : undefined}>
                                        <img src={logOut} alt="로그아웃" />
                                        <span>로그아웃</span>
                                    </div>
                                </>
                                :
                                <div className="icon-item2" onClick={() => navigate("/login")}>
                                    <img src={로그아웃} alt="로그아웃" />
                                    <span>로그인</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                {/* 아코디언 컴포넌트 추가 */}
                <div className="accordion-container">
                    <div 
                        onClick={toggleAccordion} 
                        className="accordion-header"
                    >
                        <p>고객센터 ( 평일 09:00~18:00 )
                        <br /><strong>1577-8007</strong>
                        </p>
                        <span>{isOpen ? '▲' : '▼'}</span>
                    </div>
                    {isOpen && (
                        <div className="accordion-content">
                            <p>(주) 이드링크24</p>
                            <p>대표자 홍삼주</p>
                            <p>사업자등록번호 123-45-67891</p>
                            <p>해운대 스파로스 아카데미</p>
                        </div>
                    )}
                </div>

            </div>
            <FooterComponent />
        </div>

    );
}

export default MypageComponent;
