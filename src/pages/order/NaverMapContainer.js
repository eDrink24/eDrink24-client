import React, { useEffect, useRef } from 'react';

// 지도 초기화 함수
const initializeMap = (mapContainer, address) => {
    if (window.naver && window.naver.maps) {
        const map = new window.naver.maps.Map(mapContainer, {
            center: new window.naver.maps.LatLng(37.3595704, 127.105399),
            zoom: 10,
        });

        // 주소를 좌표로 변환
        if (address) {
            window.naver.maps.Service.geocode({ query: address }, (status, response) => {
                if (status === window.naver.maps.Service.Status.OK) {
                    const result = response.v2;
                    const items = result.addresses;
                    if (items.length > 0) {
                        const latlng = new window.naver.maps.LatLng(items[0].y, items[0].x);
                        
                        // 마커 추가
                        new window.naver.maps.Marker({
                            position: latlng,
                            map: map,
                        });
                        
                        // 지도의 중심을 업데이트
                        map.setCenter(latlng);
                    } else {
                        console.error('주소 검색 결과가 없습니다.');
                    }
                } else {
                    console.error('주소 검색 실패:', status);
                }
            });
        }
    } else {
        console.error('Naver maps API is not loaded.');
    }
};

const NaverMapContainer = ({ storeAddress }) => {
    const mapContainer = useRef(null); // 지도를 담을 DOM 엘리먼트 참조

    useEffect(() => {
        const loadMapScript = () => {
            const scriptSrc = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=3heqqrw2p1&submodules=geocoder';
            const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

            if (!existingScript) {
                const script = document.createElement('script');
                script.src = scriptSrc;
                script.async = true;
                script.onload = () => initializeMap(mapContainer.current, storeAddress);
                script.onerror = () => console.error('Naver Maps script failed to load');
                document.head.appendChild(script);

                // Cleanup function to remove script on unmount
                return () => {
                    document.head.removeChild(script);
                };
            } else {
                // 스크립트가 이미 로드된 경우 즉시 지도 초기화
                initializeMap(mapContainer.current, storeAddress);
            }
        };

        loadMapScript();

    }, [storeAddress]); // storeAddress가 변경될 때마다 지도 업데이트

    return <div ref={mapContainer} style={{ width: '150%', height: '200px' }} />;
};

export default NaverMapContainer;
