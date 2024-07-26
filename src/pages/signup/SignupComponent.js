import {
    Form,
    redirect,
    useActionData
} from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { useState } from 'react';
import Modal from "react-modal";
import "./SignupComponent.css";

function SignupComponent() {

    const data = useActionData();

    const [postalCode, setPostalCode] = useState("");
    const [roadAddress, setRoadAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [gender, setGender] = useState('남');

    const completeHandler = (data) => {
        console.log(">>", data);
        setPostalCode(data.zonecode);
        setRoadAddress(data.roadAddress);
        setIsOpen(false);
    }

    // Modal 스타일
    const customStyles = {
        overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
        },
        content: {
            left: "0",
            margin: "auto",
            width: "500px",
            height: "600px",
            padding: "0",
            overflow: "hidden",
        },
    };

    // 검색 클릭
    const toggle = (e) => {
        e.preventDefault(); // 검색 버튼 눌렀을 때 submit 안되게 
        setIsOpen(!isOpen); // 왜냐하면 sign up버튼 눌렀을 때 submit되야 하기 때문에 
    };                    // 이때 미리 submit되면 안됨.

    // 상세 주소검색 event
    const changeHandler = (e) => {
        setDetailAddress(e.target.value);
    }

    // 회원가입 완료 event
    const clickHandler = (e) => {
        if (detailAddress === "") {
            alert("상세주소를 입력해주세요.");
            e.preventDefault(); //상세주소 입력하지 않으면 submit 되지 않도록
        } else {
            console.log(postalCode, roadAddress, detailAddress);
        }
    }

    const handleGenderChange = (e) => {
        setGender(e.target.value);
    };

    return (
        <div className="signup-container">
            <div className='signup-header'>
                <h1>회원가입</h1>
                <button className="close-button" onClick={() => window.location.href = "/eDrink24/login"}>
                    <img src="assets/common/x-button.png" className="XButton" alt="closeXButton" />
                </button>
            </div>
            <Form method="post" className="signUpForm">
                {data && data.message && <p>{data.message}</p>}
                <div className="form-group">
                    <label htmlFor="loginId">아이디</label>
                    <input type="text" name="loginId" id="loginId" className="form-control" placeholder="아이디를 입력해 주세요" />
                    <button className="check-button">중복 확인</button>
                </div>
                <div className="form-group">
                    <label htmlFor="pw">비밀번호</label>
                    <input type="password" name="pw" id="pw" className="form-control" placeholder="비밀번호를 입력해 주세요" />
                </div>
                <div className="form-group">
                    <label htmlFor="pwConfirm">비밀번호 확인</label>
                    <input type="password" name="pwConfirm" id="pwConfirm" className="form-control" placeholder="비밀번호를 다시 입력해 주세요" />
                </div>
                <div className="form-group">
                    <label htmlFor="userName">이름</label>
                    <input type="text" name="userName" id="userName" className="form-control" placeholder="이름을 입력해 주세요" />
                </div>
                <div className="form-group">
                    <label>성별</label>
                    <div className="gender-options">
                        <label htmlFor="genderMale" className="gender-label">남</label>
                        <input type="radio" name="gender" id="genderMale" value="남" onChange={handleGenderChange} checked={gender === "남"} />
                        <label htmlFor="genderFemale" className="gender-label">여</label>
                        <input type="radio" name="gender" id="genderFemale" value="여" onChange={handleGenderChange} checked={gender === "여"} />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="phoneNum">전화번호</label>
                    <select className="tel-select">
                        <option value="SKT">SKT</option>
                        <option value="KT">KT</option>
                        <option value="LG">LG</option>
                    </select>
                    <input type="text" name="phoneNum" id="phoneNum" className="form-control" placeholder="010-1234-5678" />
                </div>
                <div className="form-group">
                    <label htmlFor="email">이메일</label>
                    <input type="text" name="email" id="email" className="form-control" placeholder="이메일을 입력해 주세요" />
                </div>
                <div className="form-group">
                    <label>주소</label>
                    <input name='postalCode' value={postalCode} readOnly placeholder="우편번호" className="form-control" />
                    <button className="search-button" onClick={toggle}>주소 검색</button>
                    <br />
                    <input name='address1' value={roadAddress} readOnly placeholder="도로명 주소" className="form-control" />
                    <br />
                    <Modal isOpen={isOpen} ariaHideApp={false} style={customStyles}
                        onRequestClose={() => setIsOpen(false)}>
                        <DaumPostcode onComplete={completeHandler} height="100%" />
                    </Modal>
                    <input type="text" name='address2' onChange={changeHandler} value={detailAddress} placeholder="상세주소" className="form-control" />
                    <br />
                </div>

                <div className="form-group">
                    <button onClick={clickHandler} name="signup" className="btn-submit" >회원 가입 완료</button>
                </div>
            </Form>
        </div>
    );
}

export async function action({ request }) {

    // 회원가입폼 데이터 얻기
    const data = await request.formData();
    console.log(data.get("gender"));
    const authData = {
        loginId: data.get('loginId'),
        pw: data.get('pw'),
        userName: data.get("userName"),
        birthdate: data.get("birthdate"),
        gender: data.get("gender"),
        phoneNum: data.get("phoneNum"),
        email: data.get("email"),
        postalCode: data.get("postalCode"),
        address1: data.get("address1"),
        address2: data.get("address2")
    };
    const response = await fetch("http://localhost:8090/eDrink24/signup", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData)
    });

    console.log("회원가입 요청결과: ", response);

    return redirect("/eDrink24/login");
}

export default SignupComponent;
