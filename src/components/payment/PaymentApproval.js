import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function PaymentApproval() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const pgToken = query.get('pg_token');
    const tid = localStorage.getItem('tid');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const approvePayment = async () => {
            if (pgToken && tid) {
                try {
                    // 1. 결제 승인
                    const approvalResponse = await axios.get(`http://localhost:8090/eDrink24/api/kakaoPay/approve`, {
                        params: {
                            pg_token: pgToken,
                            tid: tid
                        }
                    });

                    console.log('Approval Response:', approvalResponse.data);
                    console.log('결제가 성공적으로 완료되었습니다.', approvalResponse.data);

                    // 2. 주문 저장 및 장바구니 삭제
                    const orderTransactionDTO = JSON.parse(localStorage.getItem('orderTransactionDTO')); // 이전에 저장한 주문 정보

                    const orderResponse = await fetch(`http://localhost:8090/eDrink24/showAllBasket/userId/${userId}/buyProductAndSaveHistory`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(orderTransactionDTO),
                    });

                    if (!orderResponse.ok) {
                        const errorText = await orderResponse.text();
                        throw new Error(`Error processing purchase: ${errorText}`);
                    }

                    console.log('Order and history saved successfully');

                    const deleteResponse = await fetch(`http://localhost:8090/eDrink24/showAllBasket/userId/${userId}/deleteBasketAndItem`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(orderTransactionDTO),
                    });

                    if (deleteResponse.ok) {
                        console.log('Basket and items deleted successfully');
                    } else {
                        const errorText = await deleteResponse.text();
                        throw new Error(`Error processing deletion: ${errorText}`);
                    }

                    window.location.href = 'http://localhost:3000/eDrink24';

                } catch (error) {
                    console.error('결제 승인 중 오류가 발생했습니다.', error);
                    alert(`결제 승인 중 오류가 발생했습니다: ${error.message}`);
                }
            } else {
                alert('결제 승인에 필요한 정보가 부족합니다.');
            }
        };

        approvePayment();
    }, [pgToken, tid, userId]);

    return (
        <div>
            <h1>결제가 진행 중입니다. 잠시만 기다려 주세요...</h1>
        </div>
    );
}

export default PaymentApproval;
