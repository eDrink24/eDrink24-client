import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertModalOfClickBasketButton from '../../components/alert/AlertModalOfClickBasketButton';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './AllProductComponent.css';

const categoryList = ['와인', '양주', '전통주', '논알콜', '안주'];

// LikeButton 컴포넌트 정의
const LikeButton = ({ onClick }) => {
    const handleClick = (event) => {
        event.stopPropagation();
        onClick();
    };

    return (
        <button className="allproduct-like-button" onClick={handleClick}>
            ♥
        </button>
    );
};

// ReviewButton 컴포넌트 정의
const ReviewButton = ({ onClick }) => {
    const handleClick = (event) => {
        event.stopPropagation();
        onClick();
    };

    return (
        <button className="allproduct-review-button" onClick={handleClick}>
            ★
        </button>
    );
};

// handleLikeClick 함수 정의
const handleLikeClick = (productId) => {
    // 좋아요 클릭 시 발생할 동작을 처리합니다.
    console.log(`Liked product with ID: ${productId}`);
};

const AllProductComponent = () => {
    const { category1, productId } = useParams();  // productId도 useParams로 가져옴
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('와인');
    const navigate = useNavigate();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [quantity] = useState(1);
    const [product, setProduct] = useState(null);  // 선택된 product를 저장

    useEffect(() => {
        if (category1) {
            selectCategory1(selectedCategory);
        }
    }, [selectedCategory, category1]);

    const selectCategory1 = async (category1) => {
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showProductByCategory1/${category1}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const resData = await response.json();
            setProducts(resData);

            // productId가 있는 경우 해당 제품을 product 상태로 설정
            if (productId) {
                const foundProduct = resData.find(prod => prod.productId === parseInt(productId));
                setProduct(foundProduct || null);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

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

    const handleCategory1Click = (category1) => {
        setSelectedCategory(category1);
        navigate(`/eDrink24/allproduct/${category1}`);
    }

    const returnHome = () => {
        navigate(`/eDrink24`);
    }

    const handleProductClickEvent = (productId) => {
        const clickedProduct = products.find(product => product.productId === productId);
        if (clickedProduct) {
            setProduct(clickedProduct);  // 클릭된 제품을 product 상태로 설정
            const category2 = clickedProduct.category2;
            navigate(`/eDrink24/allproduct/${selectedCategory}/${category2}/${productId}`);
        } else {
            console.error('제품을 찾지 못했습니다.');
        }
    };

    const [invToStore, setInvToStore] = useState([]);
    const [showTodayPu, setShowTodayPu] = useState(false);
    const currentStoreId = localStorage.getItem("currentStoreId");

    useEffect(() => {
        const fetchInvByStoreId = async () => {
            if (currentStoreId) {
                try {
                    const response = await fetch(`http://localhost:8090/eDrink24/api/findInventoryByStoreId/${parseInt(currentStoreId)}`, {
                        method: 'GET'
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch inventory');
                    }

                    const invData = await response.json();
                    setInvToStore(invData);
                } catch (error) {
                    console.error('Error fetching inventory:', error);
                }
            } else {
                console.error('Store ID not found in localStorage');
            }
        };

        fetchInvByStoreId();
    }, [currentStoreId]);

    const filterTodayPu = showTodayPu
        ? products.filter(product =>
            invToStore.some(inv => inv.productId === product.productId && inv.quantity > 0))
        : products;

    // CartButton 컴포넌트 수정
    const CartButton = ({ onClick, productId }) => {
        const handleClick = (event) => {
            event.stopPropagation();
            onClick(productId);  // 클릭된 제품의 productId를 넘김
        };

        return (
            <button onClick={handleClick} className="productDetailComponent-go-cart">
                장바구니
            </button>
        );
    };

    // saveInBasket 함수 수정
    const saveInBasket = async (productId) => {
        const productToSave = products.find(prod => prod.productId === productId);

        if (!productToSave) {
            console.error('No product found');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8090/eDrink24/saveProductToBasket`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: localStorage.getItem("userId"),
                    items: [{
                        productId: productToSave.productId,
                        defaultImage: productToSave.defaultImage,
                        productName: productToSave.productName,
                        price: productToSave.price,
                        basketQuantity: quantity
                    }]
                })
            });

            if (response.ok) {
                setModalIsOpen(true);
            } else {
                throw new Error('Failed to save product to basket');
            }

            console.log("Product saved to basket:", productToSave);

        } catch (error) {
            console.error('Error saving product to basket:', error);
        }
    };

    const goToBasketPage = () => {
        setModalIsOpen(false);
        navigate('/eDrink24/basket');
    };

    const stayOnPage = () => {
        setModalIsOpen(false);
        navigate(`/eDrink24/allproduct/${category1}`);
    };

    return (
        <div className="allproduct-container">

            {/* 상단 네비게이션 바 */}
            <div className="allproduct-nav-bar">
                {/* 뒤로가기 아이콘 */}
                <button className="allproduct-back-button" onClick={() => { navigate(-1) }}>
                    <img className="allproduct-back-icon" src="assets/common/backIcon.png" alt=" " />
                </button>

                {/* 로고 이미지 */}
                <img className="allproduct-logo" src="assets/common/eDrinkLogo.png" alt=" " />

                {/* 장바구니 아이콘 */}
                <button className="allproduct-bag-button"  onClick={() => { navigate('/eDrink24/basket') }}>
                    <img className="allproduct-bag-icon" src="assets/common/bag.png" alt=" " />
                </button>
            </div>


            {/* 서브 네비게이션 바 */}
            <div className="allproduct-sub-nav">
                {/* 카테고리 필터 */}
                <div className="cc">
                <div className="allproduct-filter-bar">
                    {categoryList.map((category1, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleCategory1Click(category1)}
                            className={`allproduct-filter-button ${selectedCategory === category1 ? 'selected' : ''}`}
                        >
                            {category1}
                        </button>
                    ))}
                </div>
                    
                {/* 필터 아이콘 */}
                <button className="allproduct-filter-button2">
                    <img className="allproduct-filter-icon" src="assets/common/filter.png" alt=" " />
                </button>
                </div>

                <div className='line2'></div>

                {/* 체크 박스 / 드롭다운 박스 */}
                <div className="allproduct-click-bar">
                    <div className="allproduct-check-box">
                        <input
                            id="today-pickup"
                            type="checkbox"
                            checked={showTodayPu}
                            onChange={(e) => setShowTodayPu(e.target.checked)}
                        />
                        <label htmlFor="today-pickup">오늘픽업</label>
                    </div>

                    <div className="allproduct-dropdown-box">
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


<div className="aa">
            {filterTodayPu.map(product => (
                <div
                    className="allproduct-product-card"
                    key={product.productId}
                    onClick={() => handleProductClickEvent(product.productId)}
                >
                <div className="allproduct-product-card-img">
                    <img src={product.defaultImage} alt={product.productName} className="allproduct-product-defaultImage" />
                </div>

                    <div className="allproduct-product-info">
                        <div className="allproduct-product-enrollDate">{product.enrollDate}</div>
                        <div className="allproduct-product-name">{product.productName}</div>
                        <div className="allproduct-product-price">{Number(product.price).toLocaleString()} 원</div>

                        {/* 장바구니 버튼을 CartButton 컴포넌트로 변경 */}
                        <CartButton onClick={saveInBasket} productId={product.productId} />
                        <LikeButton onClick={() => handleLikeClick(product.productId)} />
                        <ReviewButton
                            onClick={() => console.log(`Reviewed product with ID: ${product.productId}`)}
                        />

                        {/* 오늘픽업 아이콘 ==> 오늘픽업 체크박스 클릭하면 뜬다. */}
                        {invToStore.some(inv =>
                            inv.productId === product.productId && inv.quantity > 0) && (
                                <div className="allproduct-product-tag">오늘픽업</div>
                            )}
                    </div>
                </div>
            ))}

</div>

            <AlertModalOfClickBasketButton
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                message="장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?"
                navigateOnYes={goToBasketPage}
                navigateOnNo={stayOnPage}
            />

            <FooterComponent />
        </div>
    );
}

export default AllProductComponent;
