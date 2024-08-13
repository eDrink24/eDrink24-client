import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FooterComponent from '../../components/footer/FooterComponent.js';

import './SetPlaceComponent.css';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

function SetPlaceComponent() {
    const navigate = useNavigate();
    const location = useLocation();
    const { customerData } = location.state || {};

    //-----------------------------------------------------------------------------------------
    const geocoder = new window.kakao.maps.services.Geocoder();

    var currentLocation = customerData.currentLocation; // CUSTOMER.currentLocation
    var currentStore = customerData.currentStore; // CUSTOMER.currentStore

    const [myLocation, setMyLocation] = useState(null); // 위도, 경도
    const [myAddress, setMyAddress] = useState(""); // 도로명주소


    // 페이지 랜더링시, 가져오는 위치
    useEffect(() => {
        if (currentLocation) {
            fetchAddressToLL(currentLocation);
        } else {
            fetchCurrentLocation();
        }
    }, []);

    // 패이지 랜더링시, 주소 가져오기
    useEffect(() => {
        if (myLocation) {
            fetchLLToAddress(myLocation);
        }
    }, [myLocation]);


    // 주소 => 위경도
    const fetchAddressToLL = (address) => {
        geocoder.addressSearch(address, (result, status) => { // result => 0 : {..., x, y,...}
            if (status === window.kakao.maps.services.Status.OK) {
                setMyLocation({ latitude: result[0].y, longitude: result[0].x });
            } else {
                console.error(status);
            }
        })
    };

    // 위경도 => 주소
    const fetchLLToAddress = (location) => {
        const coord = new window.kakao.maps.LatLng(location.latitude, location.longitude);
        geocoder.coord2Address(coord.getLng(), coord.getLat(), (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setMyAddress(result[0].address.address_name);
            } else {
                console.error(status);
            }
        });
    };

    // 본인주소 기준 위치찾기
    const fetchAddressLocation = () => {
        fetchAddressToLL(currentLocation);
        navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
    }
    // 현재 본인위치 기준 위치찾기
    const fetchCurrentLocation = () => {
        setMyLocation(null);
        navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
    };

    const successHandler = (response) => {
        const { latitude, longitude } = response.coords;
        setMyLocation({ latitude, longitude });
    };

    const errorHandler = (error) => {
        console.log(error);
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
                    {myLocation && (
                        <Map
                            center={{ lat: myLocation.latitude, lng: myLocation.longitude }}
                            style={{ width: '390px', height: '390px' }}
                            level={5}
                        >
                            <MapMarker position={{ lat: myLocation.latitude, lng: myLocation.longitude }} />
                        </Map>
                    )}
                </div>

                <div className="setPlace-change-button">
                    <button className='setPlace-address-btn' onClick={fetchAddressLocation}>내 주소</button>
                    <button className='setPlace-location-btn' onClick={fetchCurrentLocation}>현재위치</button>
                </div>

                <div className='setPlace-showAddress'>
                    <p>
                        {myAddress}
                    </p>
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
*/