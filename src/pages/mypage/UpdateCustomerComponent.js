import "./UpdateCustomerComponent.css";
import { Form, useActionData, useLocation, useNavigate } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { useEffect, useState } from 'react';
import Modal from "react-modal";

function UpdateCustomerComponent() {
    const data = useActionData();
    const navigate = useNavigate();

    // mypage로부터 받은 customer 정보
    const location = useLocation();
    const { customerData } = location.state || {};
    console.log(customerData);

    const [postalCode, setPostalCode] = useState("");
    const [roadAddress, setRoadAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

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
            height: "300px",
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
        e.preventDefault();
        setIsOpen(!isOpen);
    };

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

    return (
        <div className="updateCustomer-container">
            <div className='updateCustomer-header'>
                <h1>회원정보수정</h1>
                <button className="close-button" onClick={() => navigate(-1)}>
                    <img src="assets/common/x-button.png" className="XButton" alt="closeXButton" />
                </button>
            </div>

            <Form method="post" className="updateCustomerForm">
                {data && data.message && <p>{data.message}</p>}
                <div className="form-group">
                    <label htmlFor="loginId">아이디</label>
                    <input type="text" name="loginId" id="loginId" className="form-control"
                        placeholder={customerData.loginId} disabled />
                </div>

                <div className="form-group">
                    <label htmlFor="pw">비밀번호</label>
                    <input type="password" name="pw" id="pw" className="form-control" placeholder="변경 시에만 입력해 주세요."
                        value={pw} onChange={(e) => { setPw(e.target.value) }} />
                </div>
                <div className="form-group">
                    <label htmlFor="pwConfirm">비밀번호 확인</label>
                    <input type="password" name="pwConfirm" id="pwConfirm" className="form-control" placeholder="입력한 비밀번호를 다시 입력해 주세요."
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
                        <input type="text" name="userName" id="userName" className="form-control" placeholder={customerData.userName} disabled />
                    </div>
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
                        <input type="text" name="phoneNum" id="phoneNum" className="form-control" placeholder={customerData.phoneNum} />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">이메일
                        <span className="requiredCheck"> *</span>
                    </label>
                    <input type="text" name="email" id="email" className="form-control" placeholder={customerData.email} />
                </div>
                <div className="form-group">
                    <label>주소
                        <span className="requiredCheck"> *</span>
                    </label>
                    <div className='postal-search'>
                        <input name='postalCode' id="postalCode" value={postalCode} readOnly placeholder={customerData.postalCode} className="form-control-postal" />
                        <button className="search-button" onClick={toggle}>주소 검색</button>
                    </div>
                    <input name='address1' id="address1" value={roadAddress} readOnly placeholder={customerData.address1} className="form-control" />
                    <br />
                    <Modal isOpen={isOpen} ariaHideApp={false} style={customStyles}
                        onRequestClose={() => setIsOpen(false)}>
                        <DaumPostcode onComplete={completeHandler} height="100%" />
                    </Modal>
                    <input type="text" name='address2' id="address2" onChange={changeHandler}
                        value={detailAddress} placeholder={customerData.address2} className="form-control" />
                    <br />
                </div>

                <div className="form-group-submit">
                    <button onClick={undefined} name="updateCustomer" className="btn-submit-complete" >수정완료</button>
                </div>
            </Form>
            <div className="form-group-submit">
                <button onClick={() => navigate(-1)} className="btn-submit-cancel" >수정취소</button>
            </div>

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


export default UpdateCustomerComponent;