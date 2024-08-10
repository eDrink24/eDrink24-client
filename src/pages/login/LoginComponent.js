import { useActionData, Form, useNavigate, redirect } from 'react-router-dom';
import { useEffect, useState } from 'react';
import "./LoginComponent.css";
import FindIdModal from '../login/modal/FindIdModal.js';
import FindPwModal from '../login/modal/FindPwModal.js';
import AlertModal from '../../components/alert/AlertModal.js';

import { KAKAO_AUTH_URL } from '../../config/kakao/oAuth.js';

function LoginComponent() {
    const data = useActionData();
    const navigate = useNavigate();

    const [loginId, setLoginId] = useState("");
    const [pw, setPw] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);


    // 비밀번호 표시/숨기기 함수
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleDirectNormalSignup = () => {
        navigate("/eDrink24/signup");
    }

    // ********************************************************
    const [alertOpen, setAlertOpen] = useState(false); // 알림창 상태
    const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지
    const [navigateOnClose, setNavigateOnClose] = useState(false); // 모달 닫힐 때 navigate

    // 알림창 열기
    const openAlert = (message, navigateOnClose = false) => {
        setAlertMessage(message);
        setAlertOpen(true);
        setNavigateOnClose(navigateOnClose);
    }

    // 알림창 닫기
    const closeAlert = () => {
        setAlertOpen(false);
    }

    useEffect(() => {
        if (data?.error) {
            openAlert(data.error);
            setLoginId("");
            setPw("");
        } else if (data?.success) {
            openAlert("로그인에 성공하였습니다!", true);
        }
    }, [data]);

    // ********************************************************
    // 아이디 찾기
    const [openFindId, setOpenFindId] = useState(false);

    const openFindIdModal = () => {
        setOpenFindId(true);
    }
    const closeFindIdModal = () => {
        setOpenFindId(false);
    }
    // 비밀번호 찾기
    const [openFindPw, setOpenFindPw] = useState(false);
    const openFindPwModal = () => {
        setOpenFindPw(true);
    }
    const closeFindPwModal = () => {
        setOpenFindPw(false);
    }



    return (
        <div className="login-body">
            <div className="login-container">
                <AlertModal
                    isOpen={alertOpen}
                    onRequestClose={closeAlert}
                    message={alertMessage}
                    navigateOnClose={navigateOnClose}
                    navigateClosePath={"/eDrink24"}
                />
                <FindIdModal
                    isOpen={openFindId}
                    onRequestClose={closeFindIdModal}
                />
                <FindPwModal
                    isOpen={openFindPw}
                    onRequestClose={closeFindPwModal}
                />
                <div className='login-header'>
                    <img src="assets/common/emart24_logo.png" alt="emart24 로고" />
                    <button className="close-button" onClick={() => { navigate("/eDrink24") }}>
                        <img src="assets/common/x-button.png" className="XButton" alt="closeXButton" />
                    </button>
                </div>
                <div className='greet'>
                    <h1>회원님,</h1>
                    <h1>환영합니다 : {')'}</h1>
                </div>
                <Form method="post">
                    <input
                        type="text"
                        name="loginId"
                        className="login-input"
                        placeholder="아이디를 입력해 주세요"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        required
                    />
                    <div className="password-container">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            name="pw"
                            className="password-input"
                            placeholder="비밀번호를 입력해 주세요"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            required
                        />
                        <button type="button" className="show-password" onClick={togglePasswordVisibility}>
                            <img src="assets/login/eye-open.png" alt="hide 버튼" />
                        </button>
                    </div>
                    <button type="submit" className="login-button">로그인</button>
                </Form>
                <div className="options">
                    <a onClick={openFindIdModal}>아이디 찾기 {'>'}</a>
                    <a onClick={openFindPwModal}>비밀번호 찾기 {'>'}</a>
                </div>
                <div className="signup-options">
                    <p>혹시, 계정이 없으신가요?</p>
                    <button className="normal-signup" onClick={handleDirectNormalSignup}>
                        <span>일반회원으로 가입하기</span>
                    </button>
                    <button className="google-signup">
                        <img src="assets/login/google.png" alt='google icon' />
                        <span>구글계정으로 가입하기</span>
                    </button>
                    <button className="kakao-signup" onClick={() => window.location.href = KAKAO_AUTH_URL}>
                        <img src="assets/login/kakao.png" alt='kakao icon' />
                        <span>카카오로 가입하기</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export async function action({ request }) {
    const loginData = await request.formData();
    const authData = {
        loginId: loginData.get("loginId"),
        pw: loginData.get("pw")
    };
    console.log("authData: ", authData);

    const response = await fetch('http://localhost:8090/eDrink24/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(authData)
    });
    console.log("로그인 요청결과: ", response);

    if (!response.ok) {
        if (response.status === 401) {
            return { error: "아이디 또는 패스워드가 다릅니다." };
        } else {
            return { error: "서버에 문제가 발생했습니다. 나중에 다시 시도해 주세요." };
        }
    }

    const resData = await response.json();
    console.log("resData: ", resData);

    const token = resData.token;
    const userId = resData.userId;

    localStorage.setItem('jwtAuthToken', token);
    localStorage.setItem('loginId', authData.loginId);
    localStorage.setItem('userId', userId);

    return { success: true };
}

export default LoginComponent;
