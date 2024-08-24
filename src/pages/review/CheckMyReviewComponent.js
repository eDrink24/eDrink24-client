import React, { useEffect, useState } from 'react';
import './CheckMyReviewComponent.css';
import { useNavigate } from 'react-router-dom';

const CheckMyReviewComponent = () => {
    const [review, setReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedReview, setEditedReview] = useState({});
    const savedReview = localStorage.getItem("reviewData");
    const navigate = useNavigate();

    useEffect(() => {
        if (savedReview) {
            setReview(JSON.parse(savedReview));
        }
    }, []);

    const handleUpdateReview = (e) => {
        const { name, value } = e.target; // name은 json형태에서 키값, value는 value값을 가져옴.
        setEditedReview(prevState => ({ // prevState는 현재의 상태 값
            ...prevState, // 현재 상태를 복사하고, 일부만 수정 가능하게 함.
            [name]: value // name 키값, value는 값
        }));
    };

    // 리뷰 내용 업데이트
    const updateReview = async () => {
        try {

            //Rating 계산
            const rating = (
                (parseFloat(editedReview.sugarRating || 0)) +
                (parseFloat(editedReview.acidityRating || 0)) +
                (parseFloat(editedReview.throatRating || 0))
            ) / 3.0;

            const updatedReview = {
                ...editedReview,
                reviewsId: JSON.parse(savedReview)[0].reviewsId,
                rating: rating.toFixed(1) // 소수점 첫째 자리까지
            };

            const response = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/fixReviewContent`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedReview)
            });

            console.log(">>>>>>>>>", rating);
            alert("리뷰가 수정되었습니다!!");
            // 수정 모드 종료
            setIsEditing(false);
            navigate(`/orderhistory`);

        } catch (error) {
            console.error("Error fetching updateReviews:", error);
        }
    };

    const startEditing = () => {
        setEditedReview(review[0]); // 현재 리뷰 데이터를 editedReview에 복사하여 초기화
        setIsEditing(true);
    };

    if (!review) {
        return <div>Loading...</div>;
    }

    const reviewItem = review[0];
    const enrolledDate = reviewItem.enrolledDate ? reviewItem.enrolledDate.split('T')[0] : '등록되지 않음';
    const modifiedDate = reviewItem.modifiedDate ? reviewItem.modifiedDate.split('T')[0] : '수정되지 않음';

    return (
        <div className="MyReview-container">
            <h2>내 리뷰 확인하기</h2>
            <div>리뷰 등록날짜:{enrolledDate}</div>
            <div>리뷰 수정날짜:{modifiedDate}</div>
            {isEditing ? (
                <div className="MyReview-content">
                    <img src={editedReview.defaultImage} alt={editedReview.productName} className="MyReview-product-image" />
                    <h3>{editedReview.productName}</h3>
                    <p>
                        <strong>당도:</strong>
                        <input type="number" name="sugarRating" value={editedReview.sugarRating} onChange={handleUpdateReview} min="0" max="5" />
                    </p>
                    <p>
                        <strong>산미:</strong>
                        <input type="number" name="acidityRating" value={editedReview.acidityRating} onChange={handleUpdateReview} min="0" max="5" />
                    </p>
                    <p>
                        <strong>목넘김:</strong>
                        <input type="number" name="throatRating" value={editedReview.throatRating} onChange={handleUpdateReview} min="0" max="5" />
                    </p>
                    <p>
                        <strong>리뷰 내용:</strong>
                        <textarea name="content" value={editedReview.content} onChange={handleUpdateReview} />
                    </p>
                    <button onClick={updateReview}>저장하기</button>
                    <button onClick={() => setIsEditing(false)}>취소</button>
                </div>
            ) : (
                <div className="MyReview-content">
                    <img src={reviewItem.defaultImage} alt={reviewItem.productName} className="MyReview-product-image" />
                    <h3>{reviewItem.productName}</h3>
                    <p><strong>단맛:</strong> {reviewItem.sugarRating}/5</p>
                    <p><strong>산미:</strong> {reviewItem.acidityRating}/5</p>
                    <p><strong>목넘김:</strong> {reviewItem.throatRating}/5</p>
                    <p><strong>리뷰 내용:</strong> {reviewItem.content}</p>
                    <button onClick={startEditing}>수정하기</button>
                </div>
            )}
        </div>
    );
};

export default CheckMyReviewComponent;

