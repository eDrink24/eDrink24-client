import React from 'react';
import './MypageComponent.css';
import { useNavigate } from 'react-router-dom';

function MypageComponent() {

    const navigate = useNavigate();

    return (
        <div className="mypage-wrapper">
            <div className="mypage-container">
                <div className='mypage-header'>
                    <button className="back-button" onClick={() => { navigate(-1) }}>{'<'}</button>
                    <h1>마이페이지</h1>
                    <button className="settings-button"><img src="assets/mypage/settings.png" alt="설정" /></button>
                </div>

                <div class="login-signup-prompt">
                    <div class="prompt-text">
                        <p><strong>로그인, 회원가입 하러가기!</strong></p>
                        <p>3초면돼요, 더 편리한 서비스를 이용하세요</p>
                    </div>
                    <div class="prompt-arrow">
                        <img src="assets/common/right-arrow.png" alt="arrow icon" />
                    </div>
                </div>
                <div className="icons">
                    <div className="icon-item">
                        <img src="assets/mypage/heart.png" alt="찜" />
                        <span>찜</span>
                    </div>
                    <div className="icon-item">
                        <img src="assets/mypage/basket.png" alt="장바구니" />
                        <span>장바구니</span>
                    </div>
                    <div className="icon-item">
                        <img src="assets/mypage/review.png" alt="나의 후기" />
                        <span>나의 후기</span>
                    </div>
                    <div className="icon-item">
                        <img src="assets/mypage/coupon.png" alt="쿠폰" />
                        <span>쿠폰</span>
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
                        <div className="menu2">
                            <div className="icon-item2">
                                <img src="assets/mypage/로그아웃.png" alt="로그아웃" />
                                <span>로그아웃</span>
                            </div>
                            <div className="icon-item2">
                                <img src="assets/mypage/경고.png" alt="계정 삭제" />
                                <span>계정 삭제</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MypageComponent;
