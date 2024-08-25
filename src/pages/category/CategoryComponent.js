import React, { useEffect, useState } from 'react'; // useState 임포트 추가
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트 추가
import './CategoryComponent.css';
import FooterComponent from '../../components/footer/FooterComponent.js';
const categories = ['와인', '양주', '전통주', '논알콜', '안주'];
const subcategories = {
  '와인': ['레드와인', '화이트와인', '스파클링와인', '로제와인'],
  '양주': ['양주'],
  '전통주': ['약주', '과실주', '탁주', '리큐르', '전통소주', '전통주세트', '기타전통주'],
  '논알콜': ['무알콜맥주|칵테일'],
  '안주': ['안주'],
};

const CategoryComponent = () => {
  const [selectedcategory, setSelectedCategory] = useState(categories[0]);
  const navigate = useNavigate();

  const handleCategory1Click = (category1) => {
    navigate(`/allproduct/${category1}`);
  }

  const handleCategory2Click = (category1, category2) => {
    navigate(`/allproduct/${category1}/${category2}`);
  };

  const handleDirectB1 = () => {
    navigate("/");
  };

  return (

    // 전체 컨테이너
    <div className="category-container">

      {/* 상단 네비게이션 바 */}
      <div className="category-nav-bar">

        {/* 뒤로가기 아이콘 */}
        <button className="category-back" onClick={handleDirectB1}>
          <img className="back-icon" src="/assets/common/backicon.png" alt="back" onClick={handleDirectB1} />
        </button>

        {/* 메인 타이틀 */}
        <h3>카테고리</h3>

        {/* 장바구니 아이콘 */}
        <button className="category-bag" onClick={() => { navigate('/basket') }}>
          <img className="bag-cicon" src="/assets/common/bag.png" alt="bag" />
        </button>

      </div>


      <div className='line2'></div>

      <div className="category-main-content">

        {/* 주류 카테고리 */}
        <div className="category-container-content">
          <div className="category1-content">
            <ul>
              {categories.map(category => (
                <li
                  key={category}
                  className={selectedcategory === category ? 'category-active' : ''}
                  onClick={() => setSelectedCategory(category)}>
                  {category}
                </li>
              ))}
            </ul>
          </div>
          <div className="category2-content">
            <ul>
              <li className='category-selectedCategoryText' onClick={handleCategory1Click}>{selectedcategory}</li>
            </ul>
            <ul>
              {subcategories[selectedcategory].map(category2 => (
                <li
                  key={category2}
                  onClick={() => handleCategory2Click(selectedcategory, category2)}>
                  {category2}
                </li>
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