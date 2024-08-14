import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FooterComponent from '../../components/footer/FooterComponent.js';
import './SetPlaceComponent.css';
import { Map, MapMarker, Polyline } from 'react-kakao-maps-sdk';

function SetPlaceComponent() {
    const navigate = useNavigate();
    const location = useLocation();
    const { customerData } = location.state || {};

    const geocoder = new window.kakao.maps.services.Geocoder();

    const currentLocation = customerData.currentLocation;
    const currentStore = customerData.currentStore;

    const [locationData, setLocationData] = useState({
        latitude: null,
        longitude: null,
        address: ""
    });

    const [stores, setStores] = useState([]); // 매장 json
    const [storeMarkers, setStoreMarkers] = useState([]); // 필터된 매장 위치

    const [choiceStore, setChoiceStore] = useState(null);
    const [openInfo, setOpenInfo] = useState(null);

    // 페이지 랜더링 시, 가져오는 위치
    useEffect(() => {
        const fetchInit = async () => {
            if (currentLocation) {
                fetchAddressToLL(currentLocation);
            } else {
                fetchCurrentLocation();
            }
            try {
                const response = await fetch('assets/store/store_with_latlng.json');
                const store_data = await response.json();
                setStores(store_data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchInit();
    }, []);

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
            } else {
                console.error(status);
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

    return (
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
                        <div className="chosen-store">
                            <p>선택한 매장 : {choiceStore.storeName}</p>
                            <p>주소 : {choiceStore.storeAddress}</p>
                            <p>전화번호 : {choiceStore.storePhoneNum}</p>
                        </div>
                    )}
                </div>

                <div className="setPlace-update-button">
                    <button className='setPlace-set-btn'>단골매장 설정하기</button>
                </div>
            </div>

            <FooterComponent />
        </div>
    );
}

export default SetPlaceComponent;

/*
    https://apis.map.kakao.com/web/documentation/#services_Geocoder
    https://react-kakao-maps-sdk.jaeseokim.dev/
*/
