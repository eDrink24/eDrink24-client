import React, { useEffect, useState } from 'react';
import './ProductDetailComponent.css';
import { useNavigate, useParams } from 'react-router-dom';
import AlertModalOfClickBasketButton from '../../components/alert/AlertModalOfClickBasketButton';
import { useRecoilState } from 'recoil';
import { orderState } from '../order/OrderAtom';

function ProductDetailComponent() {
  // 상태 변수 선언
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 초기 탭을 'description'으로 설정
  const {category1,category2} = useParams();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [orderInfo, setOrderInfo] = useRecoilState(orderState);

  useEffect(() => {
    DetailProduct();
  }, [productId]);

  //제품 사진 클릭 시 제품 상세페이지로 이동
  const DetailProduct = async () => {
    try {
      const response = await fetch(`http://localhost:8090/eDrink24/showDetailProduct/${category1}/${category2}/${productId}`, {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const resData = await response.json();
      setProduct(resData);

    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };
  
  if (!product) {
    return <div>Loading...</div>;
  }

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

  //클릭 시 장바구니로 이동
  const saveInBasket = async () => {
    try {
      const response = await fetch(`http://localhost:8090/eDrink24/saveProductToBasket`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          //basketId: null, // auto increment이기 때문에 장바구니에 저장될 때 basketId 저장됨.
          items: [{
            //itemId:null,
            //basketId: null,
            productId: productId,
            defaultImage: product.defaultImage,
            productName: product.productName,
            price: product.price,
            basketQuantity: quantity
          }]
        })
      });

      if (response.ok) {
        setModalIsOpen(true);
      } else {
        throw new Error('Failed to save product to basket');
      }

      const resData = await response.json();
      setProduct(resData);

    } catch (error) {
      console.error('Error saving product to basket:', error);
    }
  };

  // 장바구니 버튼 클릭 후 모달창에서 예 누르면 장바구니 페이지로 이동
  const goToBasketPage = () => {
    setModalIsOpen(false);
    navigate('/eDrink24/basket');
  };

  // 장바구니 버튼 클릭 후 모달창에서 아니요 누르면 제품목록 페이지로 이동
  const stayOnPage = () => {
    setModalIsOpen(false);
    navigate(`/eDrink24/allproduct/${category1}`);
  };

  //바로구매 버튼 클릭 시 결제페이지로 이동
  const moveToOrderPage = async () => {
    try{
      const storeId = localStorage.getItem("currentStoreId");

        const selectedItem = {
          productId: product.productId,
          productName: product.productName,
          price: product.price,
          basketQuantity: quantity,
          defaultImage: product.defaultImage,
        };

        // checkInventory함수 이용해서 productId 존재 시 픽업 유형 TODAY로 설정 - giuk-kim2
        const pickupType = (await checkInventory(productId)) ? 'TODAY' : 'RESERVATION';
        console.log(await checkInventory(productId));
        console.log(pickupType);


        //선택한 제품 정보를 orderState에 저장
        setOrderInfo((prev) => ({ // prev는 현재 상태에서 일부분만 수정하고 나머지는 유지하고 싶을 때 사용
          ...prev, // 기존 상태 객체를 펼쳐서 복사하고, 복사된 값에서 특정한 값만 수정
          selectedItems: [selectedItem],
          pickupType // orderstate에 Recoil형태로 저장    
        }));

    navigate(`/eDrink24/order`);

  } catch(error){
      console.error("Error during moving to order page:", error);
      alert("There was an error while checking the inventory.");
    }

  };

  const checkInventory = async (productId) => {
    const storeId = localStorage.getItem("currentStoreId");
    try {
      const response = await fetch(`http://localhost:8090/eDrink24/checkInventory/${storeId}/${productId}`);
      if (!response.ok) throw new Error('Failed to check inventory');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const total = product.price * quantity;
  const formattedTotal = total.toLocaleString();

  return (
    <div className="productDetailComponent-container">

      {/* 상단 네비게이션 바 */}
      <div className="productDetailComponent-header">
        <div className="productDetailComponent-navigation-bar">

          {/* 뒤로가기 아이콘 */}
          <button className="productDetailComponent-back-icon-button" onClick={() => { navigate(-1) }}>
            <img className="productDetailComponent-nav-back-icon"
              src="assets/common/backIcon.png" alt="Back" />
          </button>

          <div className="productDetailComponent-nav-empty-box"></div>

          {/* 검색하기 아이콘 */}
          <button className="productDetailComponent-search-icon-button">
            <img className="productDetailComponent-nav-search-icon"
              src="assets/common/search.png" alt="search" />
          </button>

          {/* 홈으로가기 아이콘 */}
          <button className="productDetailComponent-home-icon-button" onClick={() => { navigate("/eDrink24") }}>
            <img className="productDetailComponent-nav-home-icon"
              src="assets/common/home.png" alt="home" />
          </button>

          {/* 장바구니담기 아이콘 */}
          <button className="productDetailComponent-bag-icon-button" onClick={() => { navigate("/eDrink24/basket") }}>
            <img className="productDetailComponent-nav-bag-icon"
              src="assets/common/bag.png" alt="bag" />
          </button>

        </div>
      </div>

      <div className="productDetailComponent-product-detail-container">

        <div className="productDetailComponent-product-img-container">
          <img className="productDetailComponent-product-img"
            src={product.defaultImage} alt={product.productName} />
        </div>

        <div className="productDetailComponent-product-other">
          <div className="productDetailComponent-product-review">
            <img className="productDetailComponent-reivew-star"
              src="assets/common/star.png" alt="star" />
            <h2>4.9 리뷰 (166)</h2>
          </div>
          <div className="productDetailComponent-product-option">
            <button className="productDetailComponent-heart-icon-button">
              <img className="productDetailComponent-heart-icon"
                src="assets/common/empty-heart.png" alt="emptyheart" />
            </button >
            <button className="productDetailComponent-share-icon-button">
              <img className="productDetailComponent-share-icon"
                src="assets/common/share.png" alt="share" />
            </button>
          </div>
        </div>

        <div className="productDetailComponent-product-title">
          <label className="productDetailComponent-title">{product.productName}</label>
          <label className="productDetailComponent-info-mesg">원산지 : 상품설명 또는 구매정보 페이지 참조</label>
        </div>

        <div className="productDetailComponent-price-per">
          <span className="productDetailComponent-price-item">{Number(product.price).toLocaleString()} 원</span>
        </div>

        <img className="productDetailComponent-today-pickup-img"
          src="assets/common/today-pickup.png" alt="today-pickup" />

        {/* 네비게이션 바 */}
        <div className="productDetailComponent-nav-bar">
          <div
            className={`productDetailComponent-nav-item ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => handleTabClick('description')}
          >
            상품설명
          </div>
          <div
            className={`productDetailComponent-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabClick('reviews')}
          >
            리뷰
          </div>
          <div
            className={`productDetailComponent-nav-item ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => handleTabClick('qa')}
          >
            Q&A
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="productDetailComponent-content">
          {activeTab === 'description' && <div className="productDetailComponent-content-item active">{product.detailImage}</div>}
          {activeTab === 'reviews' && <div className="productDetailComponent-content-item active">리뷰 내용</div>}
          {activeTab === 'qa' && <div className="productDetailComponent-content-item active">Q&A 내용</div>}
        </div>

      </div>

      {/* 하단고정 장바구니/바로구매 버튼 */}
      <div className={`productDetailComponent-option-footer ${isExpanded ? 'expanded' : ''}`}>
        <div className="productDetailComponent-select-more-items">
          <button className="productDetailComponent-more-items" onClick={toggleExpand}>
            <img className="productDetailComponent-up-arrow"
              src="assets/common/uparrow.png" alt="uparrow" />
          </button>
        </div>

        {/* 펼쳐지는 부분을 하단 고정바 위로 나타나게 수정 */}
        {isExpanded && (
          <div className="productDetailComponent-expanded-section">

            {/* 수량 입력 및 총 가격 표시 영역 */}
            <div className="productDetailComponent-price-control">
              <div className="productDetailComponent-quantity-control">
                <button className="productDetailComponent-quantity-button" onClick={decreaseQuantity}>-</button>
                <span className="productDetailComponent-quantity-display">{quantity}</span>
                <button className="productDetailComponent-quantity-button" onClick={increaseQuantity}>+</button>
              </div>
              <div className="productDetailComponent-price-per-info">
                <span className="productDetailComponent-price-per-item">{Number(product.price).toLocaleString()}원</span>
              </div>
            </div>

            <div className="productDetailComponent-total-info">
              <span className="productDetailComponent-total-quantity">총 수량: {quantity}개</span>
              <span className="productDetailComponent-total-price">총 가격: {formattedTotal}원</span>
            </div>

          </div>
        )}

        <div className="productDetailComponent-option-buy-button">
          <button onClick={saveInBasket} className="productDetailComponent-go-cart">장바구니</button>
          <button onClick={moveToOrderPage} className="productDetailComponent-buy-now">바로구매</button>
        </div>
      </div>

      <AlertModalOfClickBasketButton
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        message="장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?"
        navigateOnYes={goToBasketPage}
        navigateOnNo={stayOnPage}
      />


    </div>
  );
}

export default ProductDetailComponent;