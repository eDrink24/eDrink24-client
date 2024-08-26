import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './ManagerComponent.css';
4
const ManagerComponent = () => {
  const [brNum, setBrNum] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const storeId = localStorage.getItem("currentStoreId");
  const loginId = localStorage.getItem("loginId");
  
  const handleInputChange = (event) => {
    setBrNum(event.target.value);  // 입력 필드의 값을 상태로 설정
  }

  const checkBrNum = async () => {
    try{
    const response = await fetch(`http://localhost:8090/eDrink24/api/checkBrNum/${storeId}/${brNum}`);
    const resdata = await response.json();

    // 빈 배열 또는 유효하지 않은 데이터 처리
    if (response.ok && (Number.parseInt(brNum) === resdata.brNum)) {
      await updateToManager();
      alert('사업자번호가 등록되었습니다.');
      navigate('/admin');
    } else {
      alert("유효하지 않은 사업자 등록번호입니다.");
    }
    }catch(error){
      console.error("Error fetching the data", error);
    }
  }

  const updateToManager = async () => {
    try{
    const response = await fetch(`http://localhost:8090/eDrink24/api/updateToManager`,{
      method:"POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({brNum, loginId, userId: userId})
      });

      if(!response.ok){
        alert('사업자등록 번호를 확인해주세요.');
      }

    }catch(error){
      console.error("Error processing the request", error);
    }
  };


  return (
    <div className="manager-container">

        <div className="manager-business-form">
          <label>
            사업자 등록번호:
            <input
              type="text"
              maxLength="10"
              className="manager-input-field"
              value={brNum}
              onChange={handleInputChange}
            />
          </label>
          <button 
          className="manager-confirm-button"
          onClick={checkBrNum}>
            저장
          </button>
        </div>
    </div>
  );
};

export default ManagerComponent;
