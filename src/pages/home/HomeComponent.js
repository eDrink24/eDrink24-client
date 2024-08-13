import React, { useState } from 'react'; // useState를 react에서 가져옵니다
import { useNavigate, useParams } from 'react-router-dom'; // useNavigate는 react-router-dom에서 가져옵니다
import FooterComponent from '../../components/footer/FooterComponent.js';
import CarouselComponent from '../../components/Banner/CarouselComponent.js';
import "./HomeComponent.css";
import MyplaceComponent from '../../components/mainMyplace/MyplaceComponent.js';

function HomeComponent() {

    // 상태 변수 선언
    const [isExpanded, setIsExpanded] = useState(false); // footer 확장을 위한 상태
    const [activeTab, setActiveTab] = useState('description'); // 초기 탭을 'description'으로 설정
    const { category1 } = useParams();

    const navigate = useNavigate();

    // 버튼 클릭 핸들러 함수
    const handleDirectHome = () => {
        navigate("/eDrink24");
    };

    const handleDirectCategory = () => {
        navigate("/eDrink24/category");
    };

    const handleDirectAllproduct = () => {
        navigate(`/eDrink24/allproduct/${category1}`);
    };

    return (
        <div className="homePage-container">

            {/* 상단 네비게이션 바 */}
            <div className="homePage-nav-box">

                {/* emart24 로고 */}
                <div className="homePage-emart24Logo-box">
                    <img className="homePage-logo"
                        src="assets/common/emart24_logo.png" alt="emart24 logo" />
                </div>

                {/* 벨 아이콘 */}
                <button className="homePage-bell" aria-label="Notifications">
                    <img className="basket-icon"
                        src="assets/common/bag.png" alt="bell icon" onClick={() => navigate("/eDrink24/basket")} />
                    <img className="bell-icon"
                        src="assets/common/bell.png" alt="bell icon" />
                </button>

            </div>

            <div className="home-container">

                {/* 위치 정보 버튼 */}
                <MyplaceComponent />

                {/* 배너 이미지 */}
                <CarouselComponent />

                <div className="category-button-container">
                    <button type="button" className="b1" onClick={handleDirectCategory}>
                        <img src="assets/common/menu.png" className="menuButton" alt="Menu Button" />
                        <p className="home-category">카테고리</p>
                    </button>
                    <button type="button" className="b2" onClick={handleDirectAllproduct}>
                        <img src="assets/common/search.png" className="searchButton" alt="Search Button" />
                        <p className="home-category">전체상품</p>
                    </button>
                    <button type="button" className="b3" onClick={handleDirectHome}>
                        <img src="assets/common/gift.png" className="giftButton" alt="Gift Button" />
                        <p className="home-category">이벤트</p>
                    </button>
                    <button type="button" className="b4" onClick={handleDirectHome}>
                        <img src="assets/common/chatbot.png" className="chatbotButton" alt="Chatbot Button" />
                        <p className="home-category">챗봇</p>
                    </button>
                </div>
                <div className='line'></div>
                <div className="best-product">
                    <h1>인기상품</h1>
                    <a href="#" className='more-button'>더보기 {">"}</a>
                </div>

                <div className="best-container">
                    <div className="ItemCard">
                        {/* 카드 배경 */}
                        <div className="itemcard-container"></div>

                        {/* 배경색이 있는 작은 사각형 */}
                        <div className="today-pickup"></div>

                        {/* 하트 아이콘 */}
                        <div className="Heart">
                            <img className="heartIcon" src="assets/common/heart.png" alt="heart icon" />
                        </div>

                        {/* 텍스트들 */}
                        <div className="PickupText">오늘픽업</div>
                        <div className="ProductTitle">샤토 생 미셸 컬럼비아 밸리 리슬링</div>
                        <div className="Price">31,000 원</div>

                        {/* 이미지 및 배경 */}
                        <div className="itemImage">
                            <img className="Image20" src="assets/common/Image20.png" alt="상품 이미지" />
                        </div>

                        {/* 평가 및 별 아이콘 */}
                        <div className="Rating">4.8 ( 후기 35 )</div>
                        <div className="Star">★</div>
                    </div>
                </div>

                <div className='line'></div>
                <div className="best-product">
                    <h1>인기상품</h1>
                    <a href="#" className='more-button'>더보기 {">"}</a>
                </div>

                <div className="best-container">
                    <div className="ItemCard">
                        {/* 카드 배경 */}
                        <div className="itemcard-container"></div>

                        {/* 배경색이 있는 작은 사각형 */}
                        <div className="today-pickup"></div>

                        {/* 하트 아이콘 */}
                        <div className="Heart">
                            <img className="heartIcon" src="assets/common/heart.png" alt="heart icon" />
                        </div>

                        {/* 텍스트들 */}
                        <div className="PickupText">오늘픽업</div>
                        <div className="ProductTitle">샤토 생 미셸 컬럼비아 밸리 리슬링</div>
                        <div className="Price">31,000 원</div>

                        {/* 이미지 및 배경 */}
                        <div className="itemImage">
                            <img className="Image20" src="assets/common/Image20.png" alt="상품 이미지" />
                        </div>

                        {/* 평가 및 별 아이콘 */}
                        <div className="Rating">4.8 ( 후기 35 )</div>
                        <div className="Star">★</div>
                    </div>
                </div>
            </div>

            {/* 하단고정 네비게이션 바 */}
            <FooterComponent />
        </div>
    );
}

export default HomeComponent;
