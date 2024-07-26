import { Form, redirect, useActionData } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { useEffect, useState } from 'react';
import Modal from "react-modal";
import "./SignupComponent.css";

function SignupComponent() {
    const data = useActionData();

    const [postalCode, setPostalCode] = useState("");
    const [roadAddress, setRoadAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [gender, setGender] = useState('남');
    const [maxDate, setMaxDate] = useState("");

    const [alertOpen, setAlertOpen] = useState(false); // 알림창 상태
    const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지

    const [isIdChecked, setIsIdChecked] = useState(false);

    // 비밀번호 확인
    const [pw, setPw] = useState("");
    const [pwConfirm, setPwConfirm] = useState("");
    const [pwMatch, setPwMatch] = useState(true);

    // Modal 스타일
    const customStyles = {
        overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
        },
        content: {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: "auto",
            width: "400px",
            padding: "0",
            height: "400px",
            overflow: "hidden",
            textAlign: "center",
        },
    };

    // 알림창 스타일
    const alertStyles = {
        overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
        },
        content: {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: "auto",
            width: "300px",
            height: "180px",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            backgroundColor: "#fff",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
        },
    };

    const completeHandler = (data) => {
        setPostalCode(data.zonecode);
        setRoadAddress(data.roadAddress);
        setIsOpen(false);
    };

    // 검색 클릭
    const toggle = (e) => {
        e.preventDefault(); // 검색 버튼 눌렀을 때 submit 안되게 
        setIsOpen(!isOpen); // 왜냐하면 sign up버튼 눌렀을 때 submit되야 하기 때문에 
    };                      // 이때 미리 submit되면 안됨.

    // 상세 주소검색 event
    const changeHandler = (e) => {
        setDetailAddress(e.target.value);
    }

    // 알림창 열기
    const openAlert = (message) => {
        setAlertMessage(message);
        setAlertOpen(true);
    }

    // 알림창 닫기
    const closeAlert = () => {
        setAlertOpen(false);
    }

    // 비밀번호 일치 여부 확인
    useEffect(() => {
        setPwMatch(pw === pwConfirm);
    }, [pw, pwConfirm]);

    // 만 19세미만 선택불가
    useEffect(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        setMaxDate(`${yyyy - 19}-12-31`); // 만 19세 이상
    }, []);

    // 아이디 중복체크
    const checkId = async (e) => {
        e.preventDefault();
        const loginId = document.getElementById('loginId').value;

        if (!loginId) {
            openAlert("아이디를 입력해 주세요.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8090/eDrink24/customerIdCheck/${loginId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const message = await response.text();

            if (response.status === 409) {
                openAlert(message); // "이 아이디는 사용불가합니다."
                setIsIdChecked(false);
            } else if (response.ok) {
                openAlert(message); // "이 아이디는 사용가능합니다."
                setIsIdChecked(true);
            } else {
                throw new Error("중복체크 요청 실패");
            }
        } catch (error) {
            console.error("중복체크 오류: ", error);
            openAlert("중복체크 중 오류가 발생했습니다.");
            setIsIdChecked(false);
        }
    };

    const handleIdChange = (e) => {
        setIsIdChecked(false);
    }

    // 회원가입 완료 핸들러
    const clickHandler = (e) => {
        const requiredFields = [
            { name: 'loginId', value: document.getElementById('loginId').value },
            { name: 'pw', value: document.getElementById('pw').value },
            { name: 'pwConfirm', value: document.getElementById('pwConfirm').value },
            { name: 'userName', value: document.getElementById('userName').value },
            { name: 'birthdate', value: document.getElementById('birthdate').value },
            { name: 'phoneNum', value: document.getElementById('phoneNum').value },
            { name: 'email', value: document.getElementById('email').value },
            { name: 'postalCode', value: postalCode },
            { name: 'address1', value: roadAddress },
            { name: 'address2', value: detailAddress }
        ];

        let allValid = true;
        requiredFields.forEach(field => {
            if (field.value === '') {
                allValid = false;
            }
        });

        if (!allValid) {
            openAlert("모든 입력란을 채워주세요.");
            e.preventDefault();
        } else if (!pwMatch) {
            openAlert("비밀번호가 일치하지 않습니다.");
            e.preventDefault();
        } else if (!isIdChecked) {
            openAlert("아이디 중복체크를 완료해 주세요.");
            e.preventDefault();
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
                    <label htmlFor="loginId">아이디
                        <span className="requiredCheck"> *</span>
                    </label>
                    <input type="text" name="loginId" id="loginId" className="form-control"
                        placeholder="아이디를 입력해 주세요" onChange={handleIdChange} />
                    <button className={`check-button ${isIdChecked ? "check-complete" : ""}`} onClick={!isIdChecked ? checkId : (e) => e.preventDefault()}>
                        {isIdChecked ? "체크 완료" : "중복 체크"}
                    </button>
                </div>
                <div className="form-group">
                    <label htmlFor="pw">비밀번호
                        <span className="requiredCheck"> *</span>
                    </label>
                    <input type="password" name="pw" id="pw" className="form-control" placeholder="비밀번호를 입력해 주세요"
                        value={pw} onChange={(e) => { setPw(e.target.value) }} />
                </div>
                <div className="form-group">
                    <label htmlFor="pwConfirm">비밀번호 확인
                        <span className="requiredCheck"> *</span>
                    </label>
                    <input type="password" name="pwConfirm" id="pwConfirm" className="form-control" placeholder="비밀번호를 다시 입력해 주세요"
                        value={pwConfirm} onChange={(e) => { setPwConfirm(e.target.value) }} />
                    {pw && pwConfirm && (
                        <p className={pwMatch ? "pw-match" : "pw-mismatch"}>
                            {pwMatch ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다."}
                        </p>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="userName">이름
                        <span className="requiredCheck"> *</span>
                    </label>
                    <div className="name-genderGroup">
                        <input type="text" name="userName" id="userName" className="form-control" placeholder="이름을 입력해 주세요" />
                        <div className="gender-options">
                            <label htmlFor="genderMale" className="gender-label">
                                <input type="radio" name="gender" id="genderMale" value="남" onChange={handleGenderChange} checked={gender === "남"} />
                                <span></span><span className="text">남</span>
                            </label>
                            <label htmlFor="genderFemale" className="gender-label">
                                <input type="radio" name="gender" id="genderFemale" value="여" onChange={handleGenderChange} checked={gender === "여"} />
                                <span></span><span className="text">여</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="birthdate">생년월일
                        <span className="requiredCheck"> ( 만 19세미만 가입불가능 ) *</span>
                    </label>
                    <input type="date" name="birthdate" id="birthdate" className="form-control" max={maxDate} />
                </div>
                <div className="form-group">
                    <label htmlFor="phoneNum">전화번호
                        <span className="requiredCheck"> *</span>
                    </label>
                    <div className="tel-num">
                        <select className="tel-select">
                            <option value="SKT">SKT</option>
                            <option value="KT">KT</option>
                            <option value="LG">LG</option>
                        </select>
                        <input type="text" name="phoneNum" id="phoneNum" className="form-control" placeholder="010-1234-5678" />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">이메일
                        <span className="requiredCheck"> *</span>
                    </label>
                    <input type="text" name="email" id="email" className="form-control" placeholder="이메일을 입력해 주세요" />
                </div>
                <div className="form-group">
                    <label>주소
                        <span className="requiredCheck"> *</span>
                    </label>
                    <div className='postal-search'>
                        <input name='postalCode' id="postalCode" value={postalCode} readOnly placeholder="우편번호" className="form-control-postal" />
                        <button className="search-button" onClick={toggle}>주소 검색</button>
                    </div>
                    <input name='address1' id="address1" value={roadAddress} readOnly placeholder="도로명 주소" className="form-control" />
                    <br />
                    <Modal isOpen={isOpen} ariaHideApp={false} style={customStyles}
                        onRequestClose={() => setIsOpen(false)}>
                        <DaumPostcode onComplete={completeHandler} height="100%" />
                    </Modal>
                    <input type="text" name='address2' id="address2" onChange={changeHandler} value={detailAddress} placeholder="상세주소" className="form-control" />
                    <br />
                </div>

                <div className="form-group">
                    <button onClick={clickHandler} name="signup" className="btn-submit" >회원 가입 완료</button>
                </div>
            </Form>

            {/* 알림창 */}
            <Modal
                isOpen={alertOpen}
                onRequestClose={closeAlert}
                style={alertStyles}
                contentLabel="Alert"
            >
                <h2>알림</h2>
                <p>{alertMessage}</p>
                <button onClick={closeAlert} className="btn-alert-close">닫기</button>
            </Modal>
        </div>
    );
}

export async function action({ request }) {
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
