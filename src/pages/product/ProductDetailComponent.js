import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import back from '../../assets/common/back.png';
import bag from '../../assets/common/bag.png';
import emptyHeart from '../../assets/common/empty-heart.png';
import filledHeart from '../../assets/common/fill-heart.png';
import home from '../../assets/common/home.png';
import search from '../../assets/common/search.png';
import share from '../../assets/common/share.png';
import star from '../../assets/common/star.png';
import todayPickup from '../../assets/common/today-pickup.png';
import uparrow from '../../assets/common/uparrow.png';
import AlertModalOfClickBasketButton from '../../components/alert/AlertModalOfClickBasketButton';
import { orderState } from '../order/OrderAtom';
import './ProductDetailComponent.css';

function ProductDetailComponent() {
  // 상태 변수 선언
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 초기 탭을 'description'으로 설정
  const { category1, category2 } = useParams();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [orderInfo, setOrderInfo] = useRecoilState(orderState);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [products, setProducts] = useState([]); // 제품 목록 상태
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    DetailProduct();
  }, [productId]);

  // 제품에 대한 모든 리뷰 보기
  const showAllReview = async () => {
    try{
    const response = await fetch(`http://localhost:8090/eDrink24/showProductReview/${productId}`,{
      method:"GET"
    });
    const resData = await response.json();
    console.log(">>>>>>>>>",resData);
    setReviews(resData);
    setReviewCount(resData.length);
    // 리뷰가 있을 때 평균 평점을 계산
    const totalRating = resData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / resData.length).toFixed(1); // 소수점 첫번째 자리까지 계산
     if (resData.length > 0) {
      setReviewRating(averageRating);
      } else {
        setReviewRating(0); // 리뷰가 없으면 평점을 0으로 설정
        }
    }catch(error){
      console.log("Error fetching reviews:",error);
    }
  };

  // 좋아요 버튼 컴포넌트
  const LikeButton = ({onClick, productId, liked}) => {
    const [isLiked, setIsLiked] = useState(liked); // 좋아요 상태 관리

    const handleClick = (event) => {
        event.stopPropagation();
        const likeState = !isLiked;
        setIsLiked(likeState); // 클릭할 때마다 상태를 토글
        onClick(productId, likeState);
    };

    useEffect(() => {
        setIsLiked(liked); // liked prop이 변경될 때 상태 업데이트
    }, [liked]);

    return (
        <button className="allproduct-like-button" onClick={handleClick}>
            <img
                className="allproduct-like-icon"
                src={isLiked ? filledHeart : emptyHeart}
                alt="Like Icon"
            />
        </button>
    );
  };

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
      // 찜 목록 가져오기
      const likedResponse = await fetch(`http://localhost:8090/eDrink24/showAllDibs/${userId}`, {
        method: "GET"
      });

      if (!likedResponse.ok) {
          throw new Error('Failed to fetch liked products');
      }

      const likedData = await likedResponse.json();
      const likedProductIds = new Set(likedData.map(dib => dib.productId));

      // 제품 목록에 찜 상태 추가
      const updatedProducts = {
        ...resData,
        liked: likedProductIds.has(resData.productId)
      };

      setProducts(updatedProducts);

      console.log("AAAAAAAAAA", resData);

      if (productId) {
        if (resData.productId === parseInt(productId)) {
            setProduct(resData);
        } else {
            setProduct(null);
        }
      }
    

      // 제품 정보와 함께 리뷰 데이터도 불러오기
      await showAllReview();

    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  // 찜목록 저장
  const addDibs = async (productId, liked) => {
    const dibProducts = products
    console.log("찜",dibProducts);
    if (!dibProducts || dibProducts.productId !== productId) {
        console.error('No dibProducts found');
        return;
    }

    const url = liked
    ? `http://localhost:8090/eDrink24/addDibs/${userId}` // liked가 true면 찜 추가
    : `http://localhost:8090/eDrink24/cancelDIb/${userId}/${productId}`; // liked가 false면 찜 삭제

    try {
        const response = await fetch(url, {
            method: liked? "POST" : "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: localStorage.getItem("userId"),
                productId: dibProducts.productId
            })
        });

        if (response.ok) {
            // 위 api 실행되면 products에 liked 상태 변경
            // setProducts(prevProducts =>
            //     prevProducts.map(product =>
            //         product.productId === productId
            //             ? { ...product, liked: liked }
            //             : product
            //     )
            // );
            console.log(`Product ${liked ? 'added to' : 'removed from'} dibs:`, dibProducts);
        } else {
            throw new Error(`Failed to ${liked ? 'add' : 'remove'} product to dibs`);
        }

      } catch (error) {
          console.error(`Error ${liked ? 'adding' : 'removing'} product to dibs:`, error);
      }
  };

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
    navigate('/basket');
  };

  // 장바구니 버튼 클릭 후 모달창에서 아니요 누르면 제품목록 페이지로 이동
  const stayOnPage = () => {
    setModalIsOpen(false);
    navigate(`/allproduct/${category1}`);
  };

  //바로구매 버튼 클릭 시 결제페이지로 이동
  const moveToOrderPage = async () => {
    try {
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

      //선택한 제품 정보를 orderState에 저장
      setOrderInfo((prev) => ({ // prev는 현재 상태에서 일부분만 수정하고 나머지는 유지하고 싶을 때 사용
        ...prev, // 기존 상태 객체를 펼쳐서 복사하고, 복사된 값에서 특정한 값만 수정
        selectedItems: [selectedItem],
        pickupType // orderstate에 Recoil형태로 저장    
      }));

      navigate(`/order`);

    } catch (error) {
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
      <div className='myPage-header'>
        <button className="back-button" onClick={() => { navigate(-1) }}>
            <img src={back} alt="뒤로가기" />
        </button>
        <div>
            <button className="search-button" onClick={() => { navigate("/search") }}>
              <img src={search} alt="검색" />
            </button>
            <button className="home-button" onClick={() => { navigate("/") }}>
              <img src={home} alt="홈" />
            </button>
            <button className="bag-button" onClick={() => { navigate("/basket") }}>
                <img src={bag} alt="장바구니" />
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
              src={star} alt="star" />
            <h2>{reviewRating} 리뷰 ({reviewCount})</h2>
          </div>
          <div className="productDetailComponent-product-option">
          <LikeButton
            onClick={addDibs}
            productId={product.productId}
            liked={product.liked} // 제품의 현재 좋아요 상태를 전달
          />
            <button className="productDetailComponent-share-icon-button">
              <img className="productDetailComponent-share-icon"
                src={share} alt="share" />
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
          src={todayPickup} alt="today-pickup" />

        {/* 콘텐츠 영역 */}
        <div className="productDetailComponent-content">
        
          <div className='productDetailComponent-content-item active'>
            {reviews.length > 0 ? (
              <div className='productReviewContainer'>
                {reviews.map((review) => (
                  <div key={review.reviewsId} className='reviewCard'>
                    <div className='reviewHeader'>
                      <div className='reviewProfile'>
                        <div className='reviewUserInfo'>
                        <strong className='userName'>{review.userName}</strong>
                          <div className='reviewDate'>
                            {review.enrolledDate ? review.enrolledDate.split('T')[0] : '리뷰 등록하지 않음'}
                          </div>
                        </div>
                      </div>
                      <div className='reviewRating'>
                        <span className='reting'>평점: {review.rating}점</span>
                      </div>
                    </div>
                    <div className='reviewDetails'>
                      <div className="reviewItem">당도: {review.sugarRating}점</div>
                      <div className="reviewItem">산미: {review.acidityRating}점</div>
                      <div className="reviewItem">목넘김: {review.throatRating}점</div>
                      <div className="reviewContent">리뷰 내용: {review.content}</div>
                    </div>
                    {review.modifiedDate && (
                      <div className='reviewModifiedDate'>
                        수정날짜: {review.modifiedDate ? review.modifiedDate.split('T')[0] : '수정되지 않음'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>아직 리뷰가 없습니다.</p>
            )}
          </div>
        
      </div>
        
      </div>

      {/* 하단고정 장바구니/바로구매 버튼 */}
      <div className={`productDetailComponent-option-footer ${isExpanded ? 'expanded' : ''}`}>
        <div className="productDetailComponent-select-more-items">
          <button className="productDetailComponent-more-items" onClick={toggleExpand}>
            <img className="productDetailComponent-up-arrow"
              src={uparrow} alt="uparrow" />
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