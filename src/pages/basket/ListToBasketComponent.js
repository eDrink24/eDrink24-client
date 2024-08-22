import React, { useEffect, useState, useCallback, useRef } from 'react';
import './ListToBasketComponent.css';
import TodayItem from './TodayItemComponent'; // TodayItem 컴포넌트 추가
import { getAuthToken } from '../../util/auth';
import { json, useLoaderData, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { selectedTodayPickupBaskets as recoilTodayPickupBaskets, selectedReservationPickupBaskets as recoilReservationPickupBaskets, basketPickupTypesState } from './BasketAtom';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { getLoadDirection, drawRoute } from "../../service/directionService";


function ListToBasketComponent() {
    const initialBaskets = useLoaderData();
    const [baskets, setBaskets] = useState(initialBaskets); // 장바구니 상태 관리
    const [selectedTodayPickupBaskets, setSelectedTodayPickupBaskets] = useRecoilState(recoilTodayPickupBaskets);
    const [selectedReservationPickupBaskets, setSelectedReservationPickupBaskets] = useRecoilState(recoilReservationPickupBaskets);
    const [todayPickupBaskets, setTodayPickupBaskets] = useState([]);
    const [reservationPickupBaskets, setReservationPickupBaskets] = useState([]);
    const [isAllTodayPickupSelected, setIsAllTodayPickupSelected] = useState(false);
    const [isAllReservationPickupSelected, setIsAllReservationPickupSelected] = useState(false);
    const [storeId, setStoreId] = useState(localStorage.getItem("currentStoreId"));
    const navigate = useNavigate(); // 페이지 이동을 위한 훅

    const todayPickupRef = useRef(null); // 오늘 픽업 섹션의 Ref
    const reservationPickupRef = useRef(null); // 예약 픽업 섹션의 Ref

    // 장바구니 데이터를 서버로부터 새로고침하는 함수
    const refreshBaskets = useCallback(async () => {
        const userId = localStorage.getItem("userId");

        const response = await fetch(`http://localhost:8090/eDrink24/showProductInBasket/${userId}`, {
            method: "GET"
        });

        if (response.ok) {
            const resData = await response.json();
            setBaskets(resData); // 새로운 장바구니 데이터로 상태 업데이트
            await classifyBaskets(resData); // 장바구니 항목 분류
            setSelectedTodayPickupBaskets([]); // 선택된 장바구니 항목 초기화
            setSelectedReservationPickupBaskets([]);

        } else {
            console.error('Error fetching data:', response.statusText);
        }
    }, []);

    // 장바구니 항목을 재고에 따라 오늘픽업과 예약픽업으로 분류하는 함수
    const classifyBaskets = async (baskets) => {
        const todayPickup = [];
        const reservationPickup = [];
        for (const basket of baskets) {
            const isInInventory = await checkInventory(basket.items[0].productId);
            if (isInInventory) {
                todayPickup.push(basket);
            } else {
                reservationPickup.push(basket);
            }
        }
        setTodayPickupBaskets(todayPickup);
        setReservationPickupBaskets(reservationPickup);
    };

    const checkInventory = async (productId) => {
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/checkInventory/${storeId}/${productId}`);
            if (!response.ok) throw new Error('Failed to check inventory');
            return response.json();
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    useEffect(() => {
        refreshBaskets();
    }, [refreshBaskets]);

    const scrollToSection = (sectionRef, sectionName) => {
        setActiveSection(sectionName); // 현재 활성화된 섹션 설정

        const offset = 146;
        const topPosition = sectionRef.current.offsetTop - offset;

        window.scrollTo({
            top: topPosition,
            behavior: 'smooth',
        });
    };

    const [activeSection, setActiveSection] = useState('todayPickup');

    useEffect(() => {
        const handleScroll = () => {
            const offset = 146; // 네비게이션 바의 높이
            const todayPickupPosition = todayPickupRef.current.offsetTop - offset;
            const reservationPickupPosition = reservationPickupRef.current.offsetTop - offset;

            if (window.scrollY >= reservationPickupPosition) {
                setActiveSection('reservationPickup');
            } else if (window.scrollY >= todayPickupPosition) {
                setActiveSection('todayPickup');
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const deleteSelectedBaskets = async () => {
        const userId = localStorage.getItem("userId");

        const deleteBaskets = async (basketIds) => {
            for (const basketId of basketIds) {
                const response = await fetch(`http://localhost:8090/eDrink24/deleteProductByBasketIdInBasket/${userId}/${basketId}`, {
                    method: "DELETE"
                });

                if (!response.ok) {
                    console.error('Error deleting basket:', response.statusText);
                }
            }
        };

        await deleteBaskets(selectedTodayPickupBaskets);
        await deleteBaskets(selectedReservationPickupBaskets);
        refreshBaskets();
    };

    //주문페이지로 이동
    const moveToOrderPage = () => {
        if (selectedTodayPickupBaskets.length === 0 && selectedReservationPickupBaskets.length === 0) {
            alert("주문페이지로 이동하려면 적어도 하나의 제품을 선택해주세요.");
            return;
        }

        localStorage.setItem("selectedBaskets", JSON.stringify({
            todayPickup: selectedTodayPickupBaskets,
            reservationPickup: selectedReservationPickupBaskets
        }));

        navigate(`/order`);
    };

    // 오늘픽업/예약픽업 전체 선택/해제 기능
    const toggleSelectAll = (section) => {
        if (section === 'todayPickup') {
            if (todayPickupBaskets.length > 0) {
                if (isAllTodayPickupSelected) {
                    setSelectedTodayPickupBaskets([]);
                } else {
                    const allBasketIds = todayPickupBaskets.map(basket => basket.basketId);
                    setSelectedTodayPickupBaskets(allBasketIds);
                }
                setIsAllTodayPickupSelected(!isAllTodayPickupSelected);
            }
        } else if (section === 'reservationPickup') {
            if (reservationPickupBaskets.length > 0) {
                if (isAllReservationPickupSelected) {
                    setSelectedReservationPickupBaskets([]);
                } else {
                    const allBasketIds = reservationPickupBaskets.map(basket => basket.basketId);
                    setSelectedReservationPickupBaskets(allBasketIds);
                }
                setIsAllReservationPickupSelected(!isAllReservationPickupSelected);
            }
        }
    };

    // 오늘픽업/예약픽업 개별 선택/해제 기능
    const toggleSelectBasket = (section, basketId) => {
        if (section === 'todayPickup') {
            if (selectedTodayPickupBaskets.includes(basketId)) {
                setSelectedTodayPickupBaskets(selectedTodayPickupBaskets.filter(id => id !== basketId));
            } else {
                setSelectedTodayPickupBaskets([...selectedTodayPickupBaskets, basketId]);
            }
        } else if (section === 'reservationPickup') {
            if (selectedReservationPickupBaskets.includes(basketId)) {
                setSelectedReservationPickupBaskets(selectedReservationPickupBaskets.filter(id => id !== basketId));
            } else {
                setSelectedReservationPickupBaskets([...selectedReservationPickupBaskets, basketId]);
            }
        }
    };

    const updateQuantity = async (basketId, increment) => {
        const basket = baskets.find(basket => basket.basketId === basketId);
        if (!basket) return;

        const newQuantity = basket.items[0].basketQuantity + increment;

        if (newQuantity <= 0) return;

        const userId = localStorage.getItem("userId");
        const response = await fetch(`http://localhost:8090/eDrink24/updateBasketQuantity2`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: userId,
                productId: basket.items[0].productId,
                basketId: basket.basketId,
                basketQuantity: newQuantity
            })
        });

        if (!response.ok) {
            console.error('Error updating quantity:', response.statusText);
            return;
        }

        refreshBaskets();
    };

    const totalAmount = baskets.reduce((sum, basket) => {
        if (selectedTodayPickupBaskets.includes(basket.basketId) || selectedReservationPickupBaskets.includes(basket.basketId)) {
            return sum + basket.items[0].price * basket.items[0].basketQuantity;
        }
        return sum;
    }, 0);

    const totalQuantity = baskets.reduce((sum, basket) => {
        if (selectedTodayPickupBaskets.includes(basket.basketId) || selectedReservationPickupBaskets.includes(basket.basketId)) {
            return sum + basket.items[0].basketQuantity;
        }
        return sum;
    }, 0);

    const geocoder = new window.kakao.maps.services.Geocoder();
    const currentLocation = localStorage.getItem("currentLocation");
    const currentStoreId = parseInt(localStorage.getItem("currentStoreId"));

    const [storeData, setStoreData] = useState();
    const [centerMap, setCenterMap] = useState({ latitude: null, longitude: null });
    const [locationData, setLocationData] = useState({
        latitude: null,
        longitude: null,
        address: ""
    });

    const mapRef = useRef(null);

    useEffect(() => {
        const fetchStore = async () => {
            if (isNaN(currentStoreId)) {
                return;
            }

            const response = await fetch(`http://localhost:8090/eDrink24/api/findStore/${currentStoreId}`, {
                method: "GET"
            });
            if (response.ok) {
                const data = await response.json();
                setStoreData(data)
            } else {
                console.log("NOT FOUND");
            }
        }
        fetchStore();

        if (currentLocation) {
            fetchAddressToLL(currentLocation);
        } else {
            fetchCurrentLocation();
        }

    }, [currentStoreId, currentLocation]);

    useEffect(() => {
        if (storeData && locationData.latitude && locationData.longitude) {
            const center = calculateCenter(
                locationData.latitude,
                locationData.longitude,
                storeData.latitude,
                storeData.longitude
            );
            setCenterMap(center);

            const startPoint = {
                lat: locationData.latitude,
                lng: locationData.longitude
            };

            const endPoint = {
                lat: storeData.latitude,
                lng: storeData.longitude
            };

            getLoadDirection(startPoint, endPoint).then(data => {
                if (data) {
                    const map = mapRef.current;
                    drawRoute(map, data);
                } else {
                    console.log('Failed to load direction data');
                }
            });
        }
    }, [storeData, locationData]);

    const calculateCenter = (lat1, lng1, lat2, lng2) => {
        return {
            latitude: (parseFloat(lat1) + parseFloat(lat2)) / 2,
            longitude: (parseFloat(lng1) + parseFloat(lng2)) / 2
        };
    };

    const fetchAddressToLL = (address) => {
        geocoder.addressSearch(address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setLocationData({
                    latitude: result[0].y,
                    longitude: result[0].x,
                    address: address
                });
            } else {
                console.error(status);
            }
        });
    };

    const fetchCurrentLocation = () => {
        setLocationData({ latitude: null, longitude: null, address: "" });
        navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
    };

    const successHandler = (response) => {
        const { latitude, longitude } = response.coords;
        setLocationData({ latitude, longitude, address: locationData.address });
    };

    const errorHandler = (error) => {
        console.log(error);
    };

    return (
        <div className="basket-container">

            {/* 상단 네비게이션 바 */}
            <div className="basket-top-content">
                <div className="basket-nav-bar">
                    <button className="basket-back" onClick={() => { navigate(-1) }}>
                        <img className="back-icon" src="assets/common/backicon.png" alt="back" />
                    </button>
                    <h3>장바구니</h3>
                    <button className="basket-home" onClick={() => { navigate("/") }}>
                        <img className="history-icon" src="assets/common/home.png" alt="home" />
                    </button>
                </div>
            </div>

            {/* (오늘픽업/예약픽업) 네비게이션 바 */}
            <div className="basket-pickup-bar">
                <div className={`basket-nav-pickup ${activeSection === 'todayPickup' ? 'active' : ''}`}
                    onClick={() => scrollToSection(todayPickupRef, 'todayPickup')}>
                    오늘픽업
                </div>
                <div className={`basket-nav-pickup ${activeSection === 'reservationPickup' ? 'active' : ''}`}
                    onClick={() => scrollToSection(reservationPickupRef, 'reservationPickup')}>
                    예약픽업
                </div>
            </div>

            {/* 메인 콘텐츠 컨테이너 */}
            <div className="basket-content-container">
                <div ref={todayPickupRef} className="basket-content">
                    <span className="title1">
                        <strong>오늘픽업</strong>
                    </span>
                    <div className="basket-today-pickup">
                        {todayPickupBaskets.length > 0 && (
                            <TodayItem
                                baskets={todayPickupBaskets}
                                selectedBaskets={selectedTodayPickupBaskets}
                                toggleSelectAll={() => toggleSelectAll('todayPickup')}
                                deleteSelectedBaskets={deleteSelectedBaskets}
                                toggleSelectBasket={(basketId) => toggleSelectBasket('todayPickup', basketId)}
                                updateQuantity={updateQuantity}
                            />
                        )}
                    </div>
                </div>

                <div ref={reservationPickupRef} className="basket-content">
                    <span className="title1">
                        <strong>예약픽업</strong>
                    </span>
                    <div className="basket-reservation-pickup">
                        {reservationPickupBaskets.length > 0 && (
                            <TodayItem
                                baskets={reservationPickupBaskets}
                                selectedBaskets={selectedReservationPickupBaskets}
                                toggleSelectAll={() => toggleSelectAll('reservationPickup')}
                                deleteSelectedBaskets={deleteSelectedBaskets}
                                toggleSelectBasket={(basketId) => toggleSelectBasket('reservationPickup', basketId)}
                                updateQuantity={updateQuantity}
                            />
                        )}

                    </div>
                </div>


                {/* 지도 + 매장변경 */}
                <div className="basket-content-last">
                    <span className="title1">
                        <strong>픽업매장</strong>
                    </span>
                    <div className="basket-showStore-map">
                        {storeData ? (
                            <Map
                                center={{ lat: centerMap.latitude, lng: centerMap.longitude }}
                                style={{ width: '390px', height: '290px' }}
                                level={5}
                                ref={mapRef}
                            >
                                {locationData.latitude && locationData.longitude && (
                                    <MapMarker position={{ lat: locationData.latitude, lng: locationData.longitude }} />
                                )}
                                <MapMarker
                                    position={{ lat: storeData.latitude, lng: storeData.longitude }}
                                    image={{
                                        src: "assets/store/marker_store.png",
                                        size: { width: 24, height: 24 },
                                    }}
                                />
                            </Map>
                        ) : (
                            <div className="basket-nostore-message">
                                단골매장을 설정해주세요!
                            </div>
                        )}
                    </div>

                    {/* 매장보여주기 */}
                    <div className="basket-set-location">
                        {storeData && <span className='basket-storeName'><img src='assets/common/location_on.png' alt='location' /> {storeData.storeName}</span>}
                        <button className='basket-set-location-btn' onClick={() => navigate("/myplace_store")} >다른 매장 선택하기</button>
                    </div>
                </div>
            </div>

            {/* 장바구니 요약 섹션 */}
            <div className="basket-summary">
                <div className="summary-item">
                    <span>총 상품 수량</span>
                    <span>{totalQuantity}개</span>
                </div>
                <div className="summary-item">
                    <span>총 상품금액</span>
                    <span>{totalAmount.toLocaleString()}원</span>
                </div>
                <div className="summary-item total">
                    <span>최종 결제금액</span>
                    <span>{totalAmount.toLocaleString()}원</span>
                </div>
                <button onClick={moveToOrderPage} className="order-button">
                    픽업 주문하기
                </button>
            </div>

        </div >
    );
}

// 서버에서 초기 장바구니 데이터를 로드하는 loader 함수
export async function loader({ request }) {
    const token = getAuthToken();
    const userId = localStorage.getItem("userId");

    const response = await fetch(`http://localhost:8090/eDrink24/showProductInBasket/${userId}`, {
        method: "GET",
    });

    if (response.status === 400 || response.status === 401 || response.status === 422) {
        return response;
    }

    if (!response.ok) {
        throw json({ message: 'Could not save event.' }, { status: 500 });
    }

    const resData = await response.json();
    return resData;
}

export default ListToBasketComponent;
