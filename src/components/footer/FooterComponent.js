import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FooterComponent.css'; // Footer 전용 CSS 파일

const Footer = () => {
    const navigate = useNavigate();

    // 버튼 클릭 핸들러 함수
    const handleDirectHome = () => {
        navigate("/eDrink24");
    };

    const handleDirectMyPage = () => {
        navigate("/eDrink24/mypage");
    };

    const handleDirectSearch = () => {
        navigate("/eDrink24/search");
    };

    const handleDirectList = () => {
        navigate("/eDrink24/list");
    };

    return (
        <div className="homePage-fix-nav-container">
            <div className="homePage-fix-nav-box">
                <button type="button" className="homeIcon" onClick={handleDirectHome}>
                    <img className="home-icon" src="assets/common/home.png" alt="home-Button" />
                    <h1>홈</h1>
                </button>
                <button type="button" className="searchIcon" onClick={handleDirectSearch}>
                    <img className="search-icon" src="assets/common/search.png" alt="search-Button" />
                    <h1>검색</h1>
                </button>
                <button type="button" className="listIcon" onClick={handleDirectList}>
                    <img className="list-icon" src="assets/common/receipt.png" alt="receipt-Button" />
                    <h1>내역</h1>
                </button>
                <button type="button" className="myIcon" onClick={handleDirectMyPage}>
                    <img className="my-icon" src="assets/common/my.png" alt="my-Button" />
                    <h1>마이</h1>
                </button>
            </div>
        </div>
    );
};

export default Footer;
