import './DibsComponent.css'
import { useState, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 

function DibsComponent() {
    
    const [dibs, setDibs] = useState([]);
    const userId = localStorage.getItem('userId');

    const navigate = useNavigate();

    // 주문 내역 상세정보 가져오기
    const fetchDibs = async () => {

        try {
            const response = await fetch(`http://localhost:8090/eDrink24/showAllDibs/${userId}`);
            if (response.status === 200) {
                const data = await response.json();
                setDibs(data);
            } else {
                console.error('Failed to fetch dibs items. Status:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Error fetching dibs items:', error);
            return [];
        }
        console.log("BBBBBBBBB:", dibs);
    };

    useEffect(() => {
        console.log("useEffect")
        fetchDibs();
    }, [userId]);

    // 찜목록 삭제
    const deleteDibs = async (productId, event) => {
        event.stopPropagation(); // 삭제 버튼 클릭했을때 제품 상세페이지로 넘어가는거 방지
        try {
            const response = await fetch(`http://localhost:8090/eDrink24/cancelDIb/${userId}/${productId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setDibs(dibs.filter(item => item.productId !== productId));
                console.log("removed from dibs", dibs);
            } else {
                throw new Error("Failed to remove product from dibs");
            }

        } catch (error) {
            console.error("Error removing product from dibs:", error);
        }
    };

    // 제품 클릭 시 상세 페이지로 이동
    const handleProductClickEvent = (productId) => {
        const clickedProduct = dibs.find(dib => dib.productId === productId);
        if (clickedProduct) {
            //setProduct(clickedProduct);
            const category1 = clickedProduct.category1;
            const category2 = clickedProduct.category2;
            navigate(`/allproduct/${category1}/${category2}/${productId}`);
        } else {
            console.error('제품을 찾지 못했습니다.');
        }
    };

    return (
        <div className="dibs-container">
            <h2>찜 목록</h2>
    
            <div className="dibs-section">
                {dibs.length > 0 ? (
                    <div className="dibs-group">
                        <table>
                            <thead>
                                <tr>
                                    <th>상품 이미지</th>
                                    <th>상품 이름</th>
                                    <th>가격</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dibs.map((item, index) => (
                                    <tr key={index} 
                                    onClick={() => handleProductClickEvent(item.productId)}
                                    style={{ cursor: 'pointer' }}>
                                        <td>
                                            <img
                                                src={item.defaultImage}
                                                alt={item.productName}
                                                className="product-image"
                                                style={{ width: '100px', height: 'auto' }}
                                            />
                                        </td>
                                        <td>{item.productName}</td>
                                        <td>{item.price.toLocaleString()} 원</td>
                                        <td>
                                            <button 
                                                onClick={(e) => deleteDibs(item.productId, e)} 
                                                className="delete-button">
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>찜 목록이 비어있습니다.</p>
                )}
            </div>
        </div>
    );
    
}

export default DibsComponent;