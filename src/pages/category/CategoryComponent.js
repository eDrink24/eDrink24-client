import React, { useState } from 'react';
import './CategoryComponent.css';

const categories = ['와인', '양주', '맥주', '전통주', '기타 주류', '논알콜', '안주'];
const subcategories = {
  '와인': ['와인 전체', '레드', '화이트', '로제', '샴페인', '스파클링', '내추럴'],
  '양주': ['양주 전체', '싱글몰트 위스키'],
  '맥주': [],
  '전통주': [],
  '기타 주류': [],
  '논알콜': [],
  '안주': [],
};

const CategoryComponent = () => {
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);

    return (
        <div className="category-container">
            <div className="category-header">
                <div className="category-navigation-bar"> {/* 상단 네비게이션 바 */}
                    <button className="back-icon-button">
                        <img className="nav-back-icon" 
                        src="assets/common/backIcon.png" alt="Back" /> {/* 뒤로가기 아이콘 */}
                    </button>
                    <div className="elogo-box">
                        <img className="nav-logo"
                        src="assets/common/emart24_logo.png" alt="eMart24" /> {/* 로고 이미지 */}
                    </div>
                    <button className="search-icon-button">
                        <img className="nav-search-icon"
                        src="assets/common/search.png" alt="search" /> {/* 검색하기 아이콘 */}
                    </button>
                </div>
            </div>

            <div className="category-body">
                <div className="container">
                    <div className="sidebar">
                        <ul>
                        {categories.map(category => (
                        <li key={category} 
                            className={selectedCategory === category ? 'active' : ''} 
                            onClick={() => setSelectedCategory(category)}>
                            {category}
                        </li>
                        ))}
                        </ul>
                    </div>
                    <div className="main-content">
                        <h2>{selectedCategory}</h2>
                        <ul>
                        {subcategories[selectedCategory].map(subcategory => (
                        <li key={subcategory}>{subcategory}
                        </li>
                        ))}
                        </ul>
                    </div>
                </div>
            </div>
      
            <div className="category-footer">
                <div className="category-icon-button">
                    <button type="button" className="homeIcon">
                        <img className="home-icon"
                        src="assets/common/home.png" alt="home-Button" />
                        <h1>홈</h1>
                    </button>
                    <button type="button" className="searchIcon">
                        <img className="search-icon"
                        src="assets/common/search.png" alt="search-Button" />
                        <h1>검색</h1>
                    </button>
                    <button type="button" className="listIcon">
                        <img className="list-icon"
                        src="assets/common/receipt.png" alt="receipt-Button" />
                        <h1>내역</h1>
                    </button>
                    <button type="button" className="myIcon">
                        <img className="my-icon"
                        src="assets/common/my.png" alt="my-Button" />
                        <h1>마이</h1>
                    </button>
                </div> 
            </div>     

        </div>
    );
  };


export default CategoryComponent;
