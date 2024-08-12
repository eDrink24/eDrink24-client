import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./SearchComponent.css";

function SearchComponent() {
    const navigate = useNavigate();
    const valueRef = useRef(null);
    const [filteredData, setFilteredData] = useState([]); // 필터링된 데이터를 저장할 상태
    const [dbData, setDbData] = useState([]); // 서버에서 가져온 전체 데이터를 저장할 상태

    // 전체 제품 목록을 가져오는 함수
    const fetchAllProducts = async () => {
        try {
            const response = await axios.get("http://localhost:8090/eDrink24/showAllProduct"); // 전체 제품 목록을 가져오는 API 호출
            setDbData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchAllProducts(); // 컴포넌트 마운트 시 전체 제품 목록을 가져옴
    }, []);

    const submitHandler = (e) => {
        e.preventDefault();
        const value = valueRef.current.value;

        // 검색어로 데이터를 필터링합니다.
        const filtered = dbData.filter((el) => 
            (el.name && el.name.toLowerCase().includes(value.toLowerCase())) ||   // 제품 이름에서 검색
            (el.product && el.product.toLowerCase().includes(value.toLowerCase())) ||  // 카테고리1에서 검색
            (el.category2 && el.category2.toLowerCase().includes(value.toLowerCase()))   // 카테고리2에서 검색
        );
        setFilteredData(filtered);
    };

    return (
        <div className="search-container">
            <div className="search-header"> {/* 상단 네비게이션 바 */}
                <div className="search-navigation-bar">
                    <div>
                        <button className="search-back-button" onClick={() => { navigate(-1) }}>
                            <img src="assets/common/backIcon.png" alt="Back" className="search-nav-bicon" /> {/* 뒤로 가기 아이콘 */}
                        </button>
                    </div>
                    <form className="search-container" onSubmit={submitHandler}>
                        <input type="text" ref={valueRef} placeholder="Search products..." /> {/* 입력 필드에 useRef 연결 */}
                        <button type="submit">검색</button>
                    </form>
                </div>
            </div>

            <div className="search-main-content">
                {filteredData.length > 0 ? (
                    <ul>
                        {filteredData.map((product, index) => (  // index를 map 함수의 두 번째 매개변수로 받아옴
                            <li key={product.id || index}>  {/* key prop에 고유한 product.id 사용, 없으면 index 사용 */}
                                <img src={product.defaultImage} alt={product.productName} className="allproduct-product-defaultImage" />
                                <h3>{product.name}</h3>
                                <p>item name: {product.productName}</p>
                                <p>Category1: {product.category1}</p>
                                <p>Price: {product.price}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>검색하신 상품을 찾을 수 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default SearchComponent;
