import React from 'react';
import './MypageComponent.css';

function MypageComponent() {
    return (
        <div className="mypage-wrapper">
            <div className="mypage-container">
                <header>
                    <button className="back-button">{'<'} 뒤로</button>
                    <h1>MY</h1>
                    <button className="settings-button">⚙</button>
                </header>
                <div className="greet">
                    <h2>환영합니다, <span className="username">오윤하님</span></h2>
                </div>
                <div className="user-info-placeholder"></div>
                <div className="icons">
                    <div className="icon-item">💖<br />찜</div>
                    <div className="icon-item">🛒<br />장바구니</div>
                    <div className="icon-item">📝<br />나의 후기</div>
                    <div className="icon-item">🏷️<br />쿠폰</div>
                </div>
                <div className="sections">
                    <div className="section">
                        <h3>문의 및 공지</h3>
                        <ul>
                            <li>고객 센터</li>
                            <li>자주 묻는 질문</li>
                            <li>공지사항</li>
                        </ul>
                    </div>
                    <div className="section">
                        <hr />
                        <ul>
                            <li>로그아웃</li>
                            <li>회원 탈퇴하기</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MypageComponent;
