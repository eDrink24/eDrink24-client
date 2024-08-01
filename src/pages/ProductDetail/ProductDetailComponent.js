import React, { useState } from 'react';
import './ProductDetailComponent.css';

function ProductDetailComponent() {
  // 상태 변수 선언
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 초기 탭을 'description'으로 설정
  const pricePerItem = 31000; // 단가 예시
  const totalPrice = quantity * pricePerItem;

  // 펼치기/접기 토글 함수
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 수량 증가 함수
  const increaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  // 수량 감소 함수
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  // 탭 클릭 핸들러 함수
  const handleTabClick = (tab) => {
    setActiveTab(tab); // 클릭한 탭으로 활성 탭 변경
  };

  return (
    <div className="category-container">

      {/* 상단 네비게이션 바 */} 
      <div className="category-header">
        <div className="category-navigation-bar">

          {/* 뒤로가기 아이콘 */}
          <button className="back-icon-button">
            <img className="nav-back-icon" 
                 src="assets/common/backIcon.png" alt="Back" />
          </button>

          <div className="nav-empty-box"></div>

          {/* 검색하기 아이콘 */}
          <button className="search-icon-button">
            <img className="nav-search-icon"
                 src="assets/common/search.png" alt="search" />
          </button>

          {/* 홈으로가기 아이콘 */}
          <button className="home-icon-button">
            <img className="nav-home-icon"
                 src="assets/common/home.png" alt="home" />
          </button>

          {/* 장바구니담기 아이콘 */}
          <button className="bag-icon-button">
            <img className="nav-bag-icon"
                 src="assets/common/bag.png" alt="bag" />
          </button>

        </div>
      </div>

      <div className="product-detail-container">

        <div className="product-img-container">
          {/*<img className="product-img"
               src="#" alt="item-img" />*/}
        </div>

        <div className="product-other">
          <div className="product-review">
            <img className="reivew-star"
                 src="assets/common/star.png" alt="star" />
            <h2>4.9 리뷰 (166)</h2>
          </div>
          <div className="product-option">
            <button className="heart-icon-button">
              <img className="heart-icon"
                   src="assets/common/empty-heart.png" alt="emptyheart" />
            </button >
            <button className="share-icon-button">
              <img className="share-icon"
                   src="assets/common/share.png" alt="share" />
            </button>
          </div>
        </div>

        <div className="product-title">
          <label className="title">샤토 생 미셸 컬럼비아 밸리 리슬링</label>
          <label className="info-mesg">원산지 : 상품설명 또는 구매정보 페이지 참조</label>
        </div>

        <div className="price-per">
          <span className="price-item">{pricePerItem.toLocaleString()} 원</span>
        </div>

          <img className="today-pickup-img"
               src="assets/common/today-pickup.png" alt= "today-pickup" />

        {/* 네비게이션 바 */}
        <div className="nav-bar">
          <div 
            className={`nav-item ${activeTab === 'description' ? 'active' : ''}`} 
            onClick={() => handleTabClick('description')}
          >
            상품설명
          </div>
          <div 
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} 
            onClick={() => handleTabClick('reviews')}
          >
            리뷰
          </div>
          <div 
            className={`nav-item ${activeTab === 'qa' ? 'active' : ''}`} 
            onClick={() => handleTabClick('qa')}
          >
            Q&A
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="content">
          {activeTab === 'description' && <div className="content-item active">상품설명 내용</div>}
          {activeTab === 'reviews' && <div className="content-item active">리뷰 내용</div>}
          {activeTab === 'qa' && <div className="content-item active">Q&A 내용</div>}
        </div>

      </div>

      {/* 하단고정 장바구니/바로구매 버튼 */}
      <div className={`option-footer ${isExpanded ? 'expanded' : ''}`}>
        <div className="select-more-items">
          <button className="more-items" onClick={toggleExpand}>
            <img className="up-arrow"
                 src="assets/common/uparrow.png" alt="uparrow" />
          </button>
        </div>

        {/* 펼쳐지는 부분을 하단 고정바 위로 나타나게 수정 */}
        {isExpanded && (
          <div className="expanded-section">

            {/* 수량 입력 및 총 가격 표시 영역 */}
            <div className="price-control">
              <div className="quantity-control">
                <button className="quantity-button" onClick={decreaseQuantity}>-</button>
                <span className="quantity-display">{quantity}</span>
                <button className="quantity-button" onClick={increaseQuantity}>+</button>
              </div>
              <div className="price-per-info">
                <span className="price-per-item">{pricePerItem.toLocaleString()}원</span>
              </div>
            </div>

            <div className="total-info">
              <span className="total-quantity">총 수량: {quantity}개</span>
              <span className="total-price">총 가격: {totalPrice.toLocaleString()}원</span>
            </div>

          </div>
        )}

        <div className="option-buy-button">
          <button className="go-cart">장바구니</button>
          <button className="buy-now">바로구매</button>
        </div>
      </div>

    </div>
  );
}

export default ProductDetailComponent;
