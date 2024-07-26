import { redirect, useActionData, Form, useNavigate } from 'react-router-dom';
import "./LoginComponent.css";
import { useEffect, useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function LoginComponent() {
    const data = useActionData();
    const navigate = useNavigate();

    const [loginId, setLoginId] = useState("");
    const [pw, setPw] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 비밀번호 표시/숨기기 함수
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleRedirectHome = () => {
        window.location.href = "/eDrink24";
    };

    const handleDirectNormalSignup = () => {
        navigate("/eDrink24/signup");
    }

    useEffect(() => {
        if (data?.error) {
            setErrorMessage(data.error);
            setLoginId("");
            setPw("");
        } else if (data?.success) {
            setIsModalOpen(true);
            setTimeout(() => {
                setIsModalOpen(false);
                navigate('/eDrink24');
            }, 2000); // 2초 후에 모달 닫고 리다이렉트
        }
    }, [data, navigate]);

    return (
        <div className="login-container">
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="로그인 성공"
                className="modal"
                overlayClassName="overlay"
            >
                <button className="modal-close-button" onClick={() => setIsModalOpen(false)}>X</button>
                <h2>로그인에 성공하였습니다!</h2>
            </Modal>
            <header>
                <img src="assets/common/emart24_logo.png" alt="emart24 로고" />
                <button className="close-button" onClick={handleRedirectHome}>
                    <img src="assets/common/x-button.png" className="XButton" alt="closeXButton" />
                </button>
            </header>
            <div className='greet'>
                <h1>회원님,</h1>
                <h1>환영합니다 : )</h1>
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
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="login-button">로그인</button>
            </Form>
            <div className="options">
                <a href="#">아이디 찾기 ></a>
                <a href="#">비밀번호 찾기 ></a>
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
                <button className="kakao-signup">
                    <img src="assets/login/kakao.png" alt='kakao icon' />
                    <span>카카오로 가입하기</span>
                </button>
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
            return { error: "아이디 또는 패스워드가 잘못되었습니다." };
        } else {
            return { error: "서버에 문제가 발생했습니다. 나중에 다시 시도해 주세요." };
        }
    }

    const resData = await response.json();
    console.log("resData: ", resData);

    const token = resData.token;

    localStorage.setItem('jwtAuthToken', token);
    localStorage.setItem('userid', authData.loginId);

    return { success: true };
}

export default LoginComponent;
