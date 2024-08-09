import { atom } from 'recoil';

// 장바구니의 전체 항목을 관리
export const basketState = atom({
  key: 'basketState',
  default: []
});

// 사용자가 선택한 항목을 관리
export const selectedBasketState = atom({
  key: 'selectedBasketState',
  default: []
});