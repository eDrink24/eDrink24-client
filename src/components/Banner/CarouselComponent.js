import React, { useEffect, useState } from 'react';
import './CarouselComponent.css';

// 파일에서 이미지 불러오기
const imageList = [
  './assets/common/banner1.png?text=Slide+1',
  './assets/common/banner2.png?text=Slide+2',
  './assets/common/banner3.png?text=Slide+3',
  './assets/common/banner4.png?text=Slide+4',
  // ==> 여기에 이미지 URL 추가하기
  //     지금은 색상이미지 4개 넣어둠 
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 슬라이드 인덱스를 관리함

  // 이전 슬라이드로 이동하게 하는 함수
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? imageList.length - 1 : prevIndex - 1));
  };

  // 다음 슬라이드로 이동하게 하는 함수
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === imageList.length - 1 ? 0 : prevIndex + 1));
  };

  // 슬라이드를 3초마다 자동으로 넘어가게함
  useEffect(() => {
    const interval = setInterval(goToNext, 3000); // 3초 마다 goToNext 함수 실행함
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="carousel">
      {/* 왼쪽-이전 슬라이드 버튼 */}
        <button onClick={goToPrevious} className="carousel-button carousel-button-left">
          ❮
        </button>

        {/* 슬라이드 이미지들의 컨테이너 */}
        <div className="carousel-images">
          {imageList.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Slide ${index}`}
              className={`carousel-image ${index === currentIndex ? 'active' : ''}`} // 현재 인덱스와 일치하는 이미지에 'active' 클래스를 추가함
            />
          ))}
        </div>

        {/* 오른쪽-다음 슬라이드 버튼 */}
        <button onClick={goToNext} className="carousel-button carousel-button-right">
          ❯
        </button>

        {/* 현재 슬라이드의 페이지를 알 수 있게 표시하는 인디케이터 */}
        <div className="carousel-indicator">
          {currentIndex + 1} / {imageList.length}
        </div>
    </div>
  );
};

export default Carousel;
