import React, { useState } from 'react';
import Modal from 'react-modal';
import './FindIdModal.css';

const FindIdModal = ({ isOpen, onRequestClose, onFindId }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:8090/eDrink24/findId', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        });

        const resData = await response.json();
        setResult(resData.message);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Find ID Modal"
            className="find-id-modal"
            overlayClassName="find-id-overlay"
        >
            <h2 className="alert-h2">아이디 찾기</h2>

            <form onSubmit={handleSubmit}>
                <div className="find-id-form-group">
                    <label htmlFor="name">이름</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="find-id-form-group">
                    <label htmlFor="email">이메일</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="find-id-btn-container">
                    <button type="submit" className="find-id-btn">찾기</button>
                    <button type="button" onClick={onRequestClose} className="find-id-close-btn">닫기</button>
                </div>
            </form>
            {result && <p className="alert-p">{result}</p>}
        </Modal>
    );
};

export default FindIdModal;
