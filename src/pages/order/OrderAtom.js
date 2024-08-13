import { atom } from 'recoil';

export const orderState = atom({
    key: 'orderState',
    default: {
        storeId: '',
        pickupDate: '',
        coupon: null,
        pointUse: false,
        paymentMethod: '',
        userId: '',
        totalPrice: 0,
        discount: 0,
        finalAmount: 0
    },
});
