import { animated, useSpring } from "react-spring";
import { useDrag, rubberbandIfOutOfBounds, useScroll } from '@use-gesture/react'
import './Slider.css';
import { useRef } from "react";

const items = [...new Array(20)];
const Slider = () => {
  const [{
    x,
    scrollerPos
  }, api] = useSpring(() => ({ x: 0, scrollerPos: 0, config: {
    tension: 300,
    friction: 32,
    velocity: 100
  }}))
  const innerRef = useRef(null);
  const containerRef = useRef(null)
  const scrollerRef = useRef(null);
  // const scrollerPosRef = useRef(0);
  const getContainerWidth = () => containerRef.current?.clientWidth || 0;
  const getScrollWidth = () => innerRef.current?.scrollWidth || 0
  const getScrollerWidth = () => scrollerRef.current?.clientWidth || 0
  const scrollRef = useRef(0.0);

  
  useDrag(({
    down,
    delta: [dx],
    movement: [mx]
  }) => {
    scrollRef.current += dx
    const maxScroll = - (getScrollWidth() - getContainerWidth());
    const isLeftEdgeBounce = scrollRef.current > 0;
    const isRightEdgeBounce = scrollRef.current < maxScroll;
    if (!down && isLeftEdgeBounce) {
      scrollRef.current = 0;
    }
    if (!down && isRightEdgeBounce) {
      scrollRef.current = maxScroll;
    }
    
    scrollRef.current = rubberbandIfOutOfBounds(scrollRef.current, maxScroll, 0,1)
    const scrollerPos = (scrollRef.current / maxScroll) * (getContainerWidth() - getScrollerWidth());
    // scrollerPosRef.current = (scrollRef.current / maxScroll) * (getContainerWidth() - getScrollerWidth());
    // console.log({ scollerPos: scrollerPosRef.current})
    api.start({ x: scrollRef.current, scrollerPos })
  }, {
    axis: 'x',
    target: containerRef,
  })
  useScroll(({
    scrolling,
    direction
  }) => {
    console.log({ direction })
  }, {
    axis: 'x',
    target: containerRef
  })
  const sliderStyle = {
    translateX: x
  }

  const scrollerStyle = { 
    translateX: scrollerPos
  }
  return (
    <div>
      <div className="scroll-container">
        <animated.div className="scroller" ref={scrollerRef} style={scrollerStyle} />
      </div>
      <div className="slider-container"  ref={containerRef}>
        <animated.div className="slider-container-inner" style={sliderStyle}
        draggable="false" ref={innerRef}>
          {
            items.map((_, i) => (
              <div className="slide">
                <SlideItem index={i} />
              </div>
            ))
          }
        </animated.div>
      </div>
    </div>
)}

const SlideItem = ({ index }) => (
  <a href={`#item-${index}`} draggable="false" className="slide-content">
    <img src="https://source.unsplash.com/200x100/?nature,water" draggable="false" />
    <div className="details">
      <div className="logo-wrapper">
        <img src="https://source.unsplash.com/100x100/?nature" draggable="false" className="logo"/>
      </div>
      <div>
        <div>Sample merchant</div>
        <div>milk, asian, something</div>
      </div>
    </div>
  </a>
)


export default Slider;