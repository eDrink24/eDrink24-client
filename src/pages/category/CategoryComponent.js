import React, { useState } from 'react'; // useState 임포트 추가
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트 추가
import './CategoryComponent.css';
import FooterComponent from '../../components/footer/FooterComponent.js';
const categories = ['와인', '양주', '전통주', '논알콜', '안주'];
const subcategories = {
  '와인': ['레드', '화이트', '스파클링', '로제'],
  '양주': ['양주'],
  '전통주': ['약주', '과실주', '탁주', '리큐르', '전통소주', '전통주세트', '기타전통주'],
  '논알콜': ['논알콜'],
  '안주': ['안주'],
};

const CategoryComponent = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const navigate = useNavigate();

  const handleCategory1Click = (category1) => {
    navigate(`/eDrink24/allproduct/${category1}`);
  };

  const handleDirectB1 = () => {
    navigate("/eDrink24");
  };

  return (
    <div className="category-container">
      {/* 상단 네비게이션 바 */}
      <div className="category-header">
        <div className="category-navigation-bar">
          {/* 뒤로가기 아이콘 */}
          <button className="category-back-icon-button" onClick={handleDirectB1}>
            <img className="category-nav-back-icon"
              src="assets/common/backIcon.png" alt="Back" />
          </button>
          {/* 로고 이미지 */}
          <div className="category-elogo-box">
            <img className="category-nav-logo" onClick={handleDirectB1}
              src="assets/common/emart24_logo.png" alt="eMart24" />
          </div>
          {/* 검색하기 아이콘 */}
          <button className="category-search-icon-button">
            <img className="category-nav-search-icon"
              src="assets/common/search.png" alt="search" />
          </button>
        </div>
      </div>

      {/* 주류 카테고리 */}
      <div className="category-body">
        <div className="category-sidebar-container">
          <div className="category-sidebar">
            <ul>
              {categories.map(category => (
                <li
                  key={category}
                  className={selectedCategory === category ? 'category-active' : ''}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
          <div className="category-main-content">
            <h2>
              <span className='category-selectedCategoryText'>{selectedCategory}</span>
              <button className="category-moreButton" onClick={()=>handleCategory1Click(selectedCategory)}>
                &gt; {/* &gt;로 변경하여 올바른 표시 */}
              </button>
            </h2>
            <ul>
              {subcategories[selectedCategory].map(subcategory => (
                <li key={subcategory}>{subcategory}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 바 */}
      <FooterComponent />
    </div>
  );
};

export default CategoryComponent;