import React, { useEffect, useState } from 'react';
import './CategoriesProductComponent.css';
import FooterComponent from '../../components/footer/FooterComponent.js';
import { useNavigate, useParams } from 'react-router-dom';

const subcategories = {
    '와인': ['레드와인', '화이트와인', '스파클링와인', '로제와인'],
    '양주': ['양주'],
    '전통주': ['약주', '과실주', '탁주', '리큐르', '전통소주', '전통주세트', '기타전통주'],
    '논알콜': ['무알콜맥주|칵테일'],
    '안주': ['안주'],
};

const CategoriesProductComponent = () => {
    const { category1, category2 } = useParams();
    const [products, setProducts] = useState([]);
    const [category2List, setCategory2List] = useState([]);
    const [category, setCategory] = useState(''); // 선택된 하위 카테고리 상태
    const navigate = useNavigate();

    useEffect(() => {
        // 카테고리1에 해당하는 카테고리2 리스트 설정
        if (subcategories[category1]) {
            setCategory2List(subcategories[category1]);
        }

        // category2가 있으면 selectCategory2만 호출
        if (category2) {
            setCategory(category2);
            selectCategory2(category2);
        } else {
            //기본적으로 첫번째 카테고리2 항목을 선택
            const defaultCategory2 = subcategories[category1][0]; // 예) 와인에서는 '레드와인'으로 설정
            setCategory(defaultCategory2);
            selectCategory2(defaultCategory2); // 기본적으로 첫번째 항목을 선택한 상태로 불러옴.
        }
    }, [category1, category2]);

    //카테고리2별로 제품 보여주기
    async function selectCategory2(category2) {
        setCategory(category2); // 선택된 카테고리2 상태 업데이트

        // 카테고리2가 올바르게 전달되는지 확인
        console.log("Selected Category2:", category2);

        const response = await fetch(`http://localhost:8090/eDrink24/showProductByCategory2/${category2}`, {
            method: "GET"
        });

        // 응답이 제대로 오는지 확인
        console.log("Response:", response);

        if (response.ok) {
            const resData = await response.json();

            // 받은 데이터가 무엇인지 확인
            console.log("Response Data:", resData);

            setProducts(resData);
            navigate(`/eDrink24/allproduct/${category1}/${category2}`);
        } else {
            console.error('Error fetching data:', response.statusText);
        }
    }

    //사이드바 선택한거에 따라서 제품 보여주기
    const handleSortEvent = (e) => {
        const sortOption = e.target.value;
        let sortedProduct = [...products];

        if (sortOption === '낮은가격순') {
            sortedProduct.sort((a, b) => a.price - b.price);
        }
        else if (sortOption === '높은가격순') {
            sortedProduct.sort((a, b) => b.price - a.price);
        }
        else if (sortOption === '신상품순') {
            sortedProduct.sort((a, b) => new Date(b.enrollDate) - new Date(a.enrollDate));
        }
        setProducts(sortedProduct);
    };

    //제품사진 클릭했을 때 제품상세보기
    const handleProductClickEvent = (productId) => {
        console.log("products", products); // productId가 올바른지 확인
        console.log("category1:", category1); // category1이 올바른지 확인
        console.log("category2:", category2); // category2가 올바른지 확인
        navigate(`/eDrink24/allproduct/${category1}/${category2}/${productId}`);
    };

    const backCategoryPage = () => {
        navigate(`/eDrink24/category`);
    };

    const backMainPage = () => {
        navigate(`/eDrink24`);
    };

    // 오늘픽업 필터링 - Young5097
    const currentStoreId = localStorage.getItem("currentStoreId");
    const [invToStore, setInvToStore] = useState([]);
    const [showTodayPu, setShowTodayPu] = useState(false);

    useEffect(() => {
        const fetchInvByStoreId = async () => {
            if (currentStoreId) {

                try {
                    const response = await fetch(`http://localhost:8090/eDrink24/api/findInventoryByStoreId/${parseInt(currentStoreId)}`,
                        { method: 'GET' }
                    );
                    if (response.ok) {
                        const invData = await response.json();
                        setInvToStore(invData);
                    } else {
                        console.error(`Error: ${response.status} - ${response.statusText}`)
                    }

                } catch (error) {
                    console.error(error);
                } // try-catch

            } else {
                console.error('Not found in localStorage');
            } // if-else
        }
        fetchInvByStoreId();
    }, [currentStoreId]);

    // "오늘픽업" 필터 적용- Young5097
    const filterTodayPu = showTodayPu ? products.filter(product =>
        invToStore.some(inv => inv.productId === product.productId && inv.quantity > 0))
        : products;

    return (
        <div className="categoriesproduct-container">
            <div className="categoriesproduct-home-header"> {/* 상단 네비게이션 바 */}
                <div className="categoriesproduct-navigation-bar">
                    <button className="categoriesproduct-back-button" onClick={backCategoryPage}>
                        <img src="assets/common/backIcon.png" alt="Back" className="categoriesproduct-nav-bicon" /> {/* 뒤로 가기 아이콘 */}
                    </button>
                    <div className="categoriesproduct-logo-box" onClick={backMainPage}>
                        <img src="assets/common/emart24_logo.png" alt="eMart24" className="categoriesproduct-nav-logo" /> {/* 로고 이미지 */}
                    </div>
                    <button className="categoriesproduct-cart-button">
                        <img src="assets/common/cartIcon.png" alt="Cart" className="categoriesproduct-nav-cicon" onClick={() => { navigate('/eDrink24/basket') }} /> {/* 장바구니로 가기 아이콘 */}
                    </button>
                </div>
            </div>

            <div className="categoriesproduct-body">
                {/* 카테고리 바 => 선택한 category1에 따라 동적 변경 */}
                <div className="categoriesproduct-filter-bar">
                    {category2List.map((category2, index) => (
                        <button key={index}
                            onClick={() => selectCategory2(category2)}
                            className={`categoriesproduct-filter-button ${category === category2 ? 'selected' : ''}`}>
                            {category2}
                        </button>
                    ))}
                </div>

                {/* 오늘픽업 체크박스 / 인기순,신상품,등등 */}
                <div className="categoriesproduct-click-container">

                    <div className="categoriesproduct-container1">
                        <input
                            id="today-pickup"
                            type="checkbox"
                            checked={showTodayPu}
                            onChange={(e) => setShowTodayPu(e.target.checked)}
                        />
                        <label htmlFor="today-pickup">오늘픽업</label>
                    </div>

                    <div className="categoriesproduct-container2">
                        <select onChange={handleSortEvent}>
                            <option value="신상품순">신상품순</option>
                            <option value="판매량순">판매량순</option>
                            <option value="평점순">평점순</option>
                            <option value="리뷰순">리뷰순</option>
                            <option value="낮은가격순">낮은가격순</option>
                            <option value="높은가격순">높은가격순</option>
                        </select>
                    </div>
                </div>
            </div>

            {filterTodayPu.map(product => (
                <div className="categoriesproduct-product-card" key={product.productId} onClick={() => handleProductClickEvent(product.productId)}>
                    <img src={product.defaultImage} alt={product.productName} className="categoriesproduct-product-defaultImage" />

                    <div className="categoriesproduct-product-info">
                        <div className="categoriesproduct-product-rating">
                            <span className="categoriesproduct-star">★</span>
                        </div>
                        <div className="categoriesproduct-product-enrollDate">{product.enrollDate}</div>
                        <div className="categoriesproduct-product-name">{product.productName}</div>
                        <div className="categoriesproduct-product-price">{Number(product.price).toLocaleString()} 원</div>

                        {/* invMyStore에 productId가 있고 0보다 크면 '오늘픽업' */}
                        {invToStore.some(inv =>
                            inv.productId === product.productId && inv.quantity > 0) && (
                                <div className="categoriesproduct-product-tag">오늘픽업</div>
                            )}
                    </div>
                </div>

            ))}

            <FooterComponent />
        </div>
    );
}

export default CategoriesProductComponent;