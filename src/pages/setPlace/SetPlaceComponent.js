import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FooterComponent from '../../components/footer/FooterComponent.js';
import AlertModal from '../../components/alert/AlertModal.js';
import './SetPlaceComponent.css';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

function SetPlaceComponent() {
    const navigate = useNavigate();

    const geocoder = new window.kakao.maps.services.Geocoder();

    const currentLocation = localStorage.getItem("currentLocation")
    const currentStoreId = localStorage.getItem("currentStoreId")


    const [locationData, setLocationData] = useState({ // 현재위치 정보
        latitude: null,
        longitude: null,
        address: ""
    });

    const [stores, setStores] = useState([]); // 매장 json => client에 있는 정보
    const [storeMarkers, setStoreMarkers] = useState([]); // 필터된 매장 위치

    const [choiceStore, setChoiceStore] = useState(); // 선택된 매장
    const [openInfo, setOpenInfo] = useState(null); // 마커인포


    // 알람 state
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [navigateOnClose, setNavigateOnClose] = useState(false);

    // 알림창 열기
    const openAlert = (message, navigateOnClose = false) => {
        setAlertMessage(message);
        setAlertOpen(true);
        setNavigateOnClose(navigateOnClose);
    }

    // 알림창 닫기
    const closeAlert = () => {
        setAlertOpen(false);
        if (navigateOnClose) {
            navigate(-1);
        }
    }


    // 페이지 랜더링 시, 가져오는 위치
    useEffect(() => {
        const fetchInit = async () => {
            if (currentLocation) {
                fetchAddressToLL(currentLocation);
            } else {
                fetchCurrentLocation();
            }
            // 지금은 임시로 assets에 넣고 찾아오는데 스케줄링으로 해당 파일을 매번 업데이트 해줘야할듯
            // 어케해야하노...
            const response = await fetch('assets/store/store_with_latlng.json');
            const stores = await response.json();
            setStores(stores);


            console.log(currentStoreId)

            if (currentStoreId != null) {
                setChoiceStore(stores.find(store => store.storeId === parseInt(currentStoreId)))
            }

        };
        fetchInit();
    }, [currentStoreId, currentLocation]);


    // 위치 데이터 변경 시, 주소 가져오기
    useEffect(() => {
        if (locationData.latitude && locationData.longitude) {
            fetchLLToAddress(locationData.latitude, locationData.longitude);
        }
    }, [locationData.latitude, locationData.longitude]);

    // 주소 => 위경도
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

    // 위경도 => 주소
    const fetchLLToAddress = (latitude, longitude) => {
        const latlng = new window.kakao.maps.LatLng(latitude, longitude);
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setLocationData(prevData => ({
                    ...prevData,
                    address: result[0].address.address_name
                }));
            }
        });
    };

    // 본인주소 기준 위치 찾기
    const fetchAddressLocation = () => {
        fetchAddressToLL(currentLocation);
        navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
    };

    // 현재 본인위치 기준 위치 찾기
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

    // 반경 내의 마커 필터링
    const filterMarker = (map) => {
        const radius = 1000; // 1km 반경
        const center = map.getCenter();
        const filteredMarkers = stores.map((store) => {
            const position = new window.kakao.maps.LatLng(store.latitude, store.longitude);
            const polyline = new window.kakao.maps.Polyline({
                path: [center, position]
            });
            const distance = polyline.getLength();

            return distance < radius ? { ...store, visible: true } : { ...store, visible: false };
        });
        setStoreMarkers(filteredMarkers);
    };

    // 사용자 위치,매장 수정요청
    const handleSetStore = async () => {
        if (choiceStore) {
            try {
                const response = await fetch('http://localhost:8090/eDrink24/api/updateCustomerToStore', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: parseInt(localStorage.getItem("userId"), 10),
                        currentStoreId: choiceStore.storeId,
                        currentLocation: locationData.address,
                    }),
                });

                if (response.ok) {
                    console.log(currentStoreId);
                    console.log(choiceStore.storeId);
                    localStorage.removeItem("currentLocation")
                    localStorage.removeItem("currentStoreId");

                    localStorage.setItem("currentLocation", locationData.address);
                    localStorage.setItem("currentStoreId", choiceStore.storeId);

                    openAlert('단골매장이 설정되었습니다!', true);
                } else {
                    openAlert('단골매장 설정에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                openAlert('단골매장 설정에 실패했습니다.');
            }
        } else {
            openAlert('매장을 선택해주세요.');
        }
    };


    return (
        <>
            <div className="setPlace-container">
                <div className='setPlace-header'>
                    <h1>단골매장 설정</h1>
                    <button className="close-button" onClick={() => navigate(-1)}>
                        <img src="assets/common/backIcon.png" className="XButton" alt="closeXButton" />
                    </button>
                </div>

                <div className="setPlace-body">
                    <div className="setPlace-map">
                        {locationData.latitude && locationData.longitude && (
                            <Map
                                center={{ lat: locationData.latitude, lng: locationData.longitude }}
                                style={{ width: '390px', height: '490px' }}
                                level={4}

                                onIdle={filterMarker}
                            >
                                <MapMarker position={{ lat: locationData.latitude, lng: locationData.longitude }} />
                                {storeMarkers.map((store) => (

                                    store.visible && (
                                        <MapMarker
                                            key={store.storeId}
                                            position={{ lat: store.latitude, lng: store.longitude }}
                                            title={store.storeName}
                                            clickable={true}
                                            image={{
                                                src: "assets/store/marker_store.png",
                                                size: {
                                                    width: 24,
                                                    height: 24,
                                                },
                                            }}

                                            onClick={() => setOpenInfo(store.storeId)}
                                        >
                                            {openInfo === store.storeId && (
                                                <div style={{ minWidth: "150px" }}>
                                                    <img
                                                        alt="close"
                                                        width="14"
                                                        height="13"
                                                        src="https://t1.daumcdn.net/localimg/localimages/07/mapjsapi/2x/bt_close.gif"
                                                        style={{
                                                            position: "absolute",
                                                            right: "5px",
                                                            top: "5px",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => setOpenInfo(null)}
                                                    />
                                                    <div style={{ padding: "5px", color: "#000" }}>
                                                        <h4>{store.storeName}</h4>
                                                        <p>{store.storeAddress}</p>
                                                        <p>{store.storePhoneNum}</p>
                                                        <button onClick={() => setChoiceStore(store)}>매장 선택</button>
                                                    </div>
                                                </div>
                                            )}
                                        </MapMarker>
                                    )
                                ))}
                            </Map>
                        )}
                    </div>

                    <div className="setPlace-change-button">
                        <button className='setPlace-address-btn' onClick={fetchAddressLocation}>내 주소</button>
                        <button className='setPlace-location-btn' onClick={fetchCurrentLocation}>현재위치</button>
                    </div>

                    <div className='setPlace-showAddress'>
                        <p>내 위치 : {locationData.address}</p>

                        {choiceStore && (
                            <div className="setPlace-store">
                                <p>선택매장id : {choiceStore.storeId} </p>
                                <p>선택매장이름 : {choiceStore.storeName}</p>
                                <p>매장주소 : {choiceStore.storeAddress}</p>
                            </div>
                        )}
                    </div>

                    <div className="setPlace-update-button">
                        <button className='setPlace-set-btn' onClick={handleSetStore}>단골매장 설정하기</button>
                    </div>
                </div>

                <FooterComponent />
                <AlertModal
                    isOpen={alertOpen}
                    onRequestClose={closeAlert}
                    message={alertMessage}
                    navigateOnClose={navigateOnClose}
                />
            </div>
        </>
    );
}

export default SetPlaceComponent;

/*
    https://apis.map.kakao.com/web/documentation/#services_Geocoder
    https://react-kakao-maps-sdk.jaeseokim.dev/
*/
