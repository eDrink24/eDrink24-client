import React, { useState } from 'react';
import Modal from 'react-modal';
import './FindPwModal.css';

const FindPwModal = ({ isOpen, onRequestClose }) => {
    const [loginId, setLoginId] = useState('');
    const [email, setEmail] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:8090/eDrink24/findPw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ loginId, email })
        });

        const resData = await response.json();
        setResult(resData.message);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Find Password Modal"
            className="find-pw-modal"
            overlayClassName="find-pw-overlay"
        >
            <h2 className="alert-h2">비밀번호 찾기</h2>
            <form onSubmit={handleSubmit}>
                <div className="find-pw-form-group">
                    <label htmlFor="LoginId">아이디</label>
                    <input
                        id="loginId"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        required
                    />
                </div>
                <div className="find-pw-form-group">
                    <label htmlFor="email">이메일</label>
                    <input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="find-pw-btn-container">
                    <button type="submit" className="find-pw-btn">찾기</button>
                    <button type="button" onClick={onRequestClose} className="find-pw-close-btn">닫기</button>
                </div>
            </form>
            {result && <p className="alert-p">{result}</p>}
        </Modal>
    );
};

export default FindPwModal;
