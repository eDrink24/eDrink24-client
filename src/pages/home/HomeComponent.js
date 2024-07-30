import { useNavigate } from 'react-router-dom';
import "./HomeComponent.css";

function HomeComponent() {
    const navigate = useNavigate();

    const handleDirectB1 = () => {
        navigate("/eDrink24/login")
    }

    const handleDirectB2 = () => {
        navigate("/eDrink24/allproduct")
    }

    return (
        <div className="home-body">
            <div className="home-container">
            <div className="home-header">
                <img src="assets/common/emart24_logo.png" alt="emart24 로고" />
                <button className="bell-button">
                    <img src="assets/common/bell-button.png" className="bellButton" alt="newBellButton" />
                </button>
            </div>
            <div className="my-place-container"></div>
            <div className="banner-container"></div>
            <div className="category-button-container">
                <button type="button" className="b1" onClick={handleDirectB1}>
                    <img src="assets/common/menu.png" className="menuButton" alt="Menu-Button" />
                    <h1>카테고리</h1>
                </button>
                <button type="button" className="b2" onClick={handleDirectB2}>
                    <img src="assets/common/search.png" className="searchButton" alt="search-Button" />
                    <h1>전체상품</h1>
               </button>
                <button type="button" className="b3">
                    <img src="assets/common/gift.png" className="giftButton" alt="gift-Button" />
                    <h1>이벤트</h1>
                </button>
                <button type="button" className="b4">
                    <img src="assets/common/chatbot.png" className="chatbotButton" alt="chatbot-Button" />
                    <h1>챗봇</h1>
                </button>
            </div>
            <div className='line'></div>
            <div className="best-product">
                <h1>인기상품</h1>
                <a href="#" className='more-button'>더보기 ></a>
            </div>

            <div className="best-container">
                <div className="ItemCard">
                        {/* 카드 배경 */}
                        <div className="itemcard-container" />

                        {/* 배경색이 있는 작은 사각형 */}
                        <div className="today-pickup" />

                        {/* 하트 아이콘 */}
                        <div className="Heart">
                            <img className="heartIcon" src="assets/common/heart.png" />
                        </div>

                        {/* 텍스트들 */}
                        <div className="PickupText">오늘픽업</div>
                        <div className="ProductTitle">샤토 생 미셸 컬럼비아 밸리 리슬링</div>
                        <div className="Price">31,000 원</div>

                        {/* 이미지 및 배경 */}
                        <div className="itemImage" onClick={handleDirectB2}>
                            <img className="Image20" src="assets/common/Image20.png" alt="상품 이미지" />
                        </div>

                        {/* 평가 및 별 아이콘 */}
                        <div className="Rating">4.8 ( 후기 35 )</div>
                        <div className="Star">★</div>
                </div>

            </div>
            


            </div>
        </div>
    );
}

export default HomeComponent;
