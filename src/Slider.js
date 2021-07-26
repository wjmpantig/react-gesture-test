import { animated, useSpring } from "react-spring";
import { rubberbandIfOutOfBounds, useGesture } from '@use-gesture/react'
import './Slider.css';
import { useCallback, useRef, useState, useEffect } from "react";

const items = [...new Array(12)];
const Slider = ({ padding = 0,  }) => {
  const [index, setIndex] = useState(0);
  const [disabled, setDisabled] = useState(false);

  const [{
    x,
    scrollerPos
  }, api] = useSpring(() => ({ x: 0, scrollerPos: 0, config: {
    tension: 300,
    friction: 25,
    velocity: 20,
  }}))

  const innerRef = useRef(null);
  const containerRef = useRef(null)
  const scrollerRef = useRef(null);
  const getContainerWidth = () => containerRef.current?.clientWidth || 0;
  const getScrollWidth = () => innerRef.current?.scrollWidth || 0
  const getScrollerWidth = () => scrollerRef.current?.clientWidth || 0
  const scrollRef = useRef(0.0);

  const currentIndexRef = useRef(0);
  const itemWidth = useRef(0);

  const maxScroll = - (getScrollWidth() - getContainerWidth());

  const isLast = (maxScroll) => Math.abs(scrollRef.current - maxScroll + padding) <= 0;
  console.log("itemWidth.current", itemWidth.current);
  console.log('isLast', isLast(maxScroll));
  const currentIndex = (ref = scrollRef.current) => Math.round(Math.abs(ref - padding) / (getScrollWidth() / items.length));
  console.log('currentIndex', currentIndex())

  useEffect(() => {
    const container = innerRef.current;
    const observer = new ResizeObserver((item) => {
      itemWidth.current = item[0].contentRect.width;
      currentIndexRef.current = currentIndex();
      // reset position when the elements are resized
      const maxScroll = - (getScrollWidth() - getContainerWidth());
      scrollRef.current = Math.max(
        -(getScrollWidth() / items.length) * currentIndexRef.current +
          (currentIndexRef.current > 0 ? padding : 0),
        maxScroll
      );
      if (onIndexChange) {
        onIndexChange(currentIndexRef.current, isLast(maxScroll));
      }
      api
        .update({
          x: currentIndexRef.current === 0 ? 0 : scrollRef.current,
          immediate: true
        })
        .start();
    });

    if (container && container.children.length > 0) {
      observer.observe(container.children[0]);
    }
    return () => {
      observer.disconnect();
    };

  }, [containerRef, innerRef, items, api, padding])

  useEffect(() => {
      scrollRef.current = 0;
      currentIndexRef.current = 0;
      const maxScroll = -(getScrollWidth() - getContainerWidth());
      if (onIndexChange) {
        onIndexChange(currentIndexRef.current, isLast(maxScroll));
      }
      api
        .update({
          x: 0,
          immediate: true
        })
        .start();
  }, [items, scrollRef, api, padding]);

  useEffect(() => {
      if (index !== undefined && index !== currentIndexRef.current) {
        const maxScroll = -(getScrollWidth() - getContainerWidth());
        scrollRef.current = Math.max(-(getScrollWidth() / items.length) * index + (index > 0 ? padding : 0),
        maxScroll
        );
        
        currentIndexRef.current = index;
        if (onIndexChange) {
          onIndexChange(currentIndexRef.current, isLast(maxScroll));
        }
        const scrollerPos = (scrollRef.current / maxScroll) * (getContainerWidth() - getScrollerWidth());
        api.start({
          x: scrollRef.current,
          scrollerPos,
        });
      }
    }, [index, api, scrollRef, padding]);

  const config = {
    drag: {
      axis: 'x',
    },
    wheel: {
      axis: 'x',
    }
  }
  
  const bind = useGesture({
    onDrag: ({
      down,
      delta: [dx],
      movement: [mx]
    }) => {
      scrollRef.current += dx;
      const maxScroll = - (getScrollWidth() - getContainerWidth());
      const isLeftEdgeBounce = scrollRef.current > 0;
      const isRightEdgeBounce = scrollRef.current < maxScroll;

      const maxSlides = Math.ceil(getScrollWidth() / getContainerWidth());
      const minOffset = itemWidth.current / 4;
      const shouldSlide = Math.abs(mx) > minOffset;
      const thisIndex = currentIndex(scrollRef.current + dx * minOffset);
      const scrollNexSnap = Math.max(-(getScrollWidth() / items.length) * thisIndex + (thisIndex > 0 ? padding : 0), maxScroll);


      if (!down && !shouldSlide) {
        scrollRef.current = scrollNexSnap;
      }
      
      if (!down && isLeftEdgeBounce) {
        scrollRef.current = 0;
        currentIndexRef.current = 0;
      }
      if (!down && isRightEdgeBounce) {
        currentIndexRef.current = Math.min(thisIndex, maxSlides - 1);
        scrollRef.current = currentIndexRef.current === 0 ? 0 : maxScroll;
      }
      if (!down && !isLeftEdgeBounce && !isRightEdgeBounce && shouldSlide) {
        scrollRef.current = scrollNexSnap;
        currentIndexRef.current = thisIndex;
      }

      if (onIndexChange && !down) {
        onIndexChange(currentIndexRef.current, isLast(maxScroll));
      }
      
      scrollRef.current = rubberbandIfOutOfBounds(scrollRef.current, maxScroll, 0,0.5)
      const scrollerPos = (scrollRef.current / maxScroll) * (getContainerWidth() - getScrollerWidth());
      
      api.start({ x: scrollRef.current, scrollerPos })
    },
    onWheel: ({ wheeling, delta: [dx] }) => {
      scrollRef.current += -dx;
      const maxScroll = - (getScrollWidth() - getContainerWidth());
      const isLeftEdgeBounce = scrollRef.current > 0;
      const isRightEdgeBounce = scrollRef.current < maxScroll;

      const maxSlides = Math.ceil(getScrollWidth() / getContainerWidth());
      const minOffset = itemWidth.current / 4;
      // const shouldSlide = Math.abs(dx) > minOffset;
      const thisIndex = currentIndex(scrollRef.current - dx * minOffset);
      const scrollNexSnap = Math.max(-(getScrollWidth() / items.length) * thisIndex + (thisIndex > 0 ? padding : 0), maxScroll);

      // if (!shouldSlide) {
      //   scrollRef.current = scrollNexSnap;
      // }

      if (!wheeling && isLeftEdgeBounce) {
        scrollRef.current = 0;
        currentIndexRef.current = 0;
      }

      if (!wheeling && isRightEdgeBounce) {
        currentIndexRef.current = Math.min(thisIndex, maxSlides - 1);
        scrollRef.current = currentIndexRef.current === 0 ? 0 : maxScroll;
      }

      if (!isLeftEdgeBounce && !isRightEdgeBounce) {
        scrollRef.current = scrollNexSnap;
        currentIndexRef.current = thisIndex;
      }

      if (onIndexChange) {
        onIndexChange(currentIndexRef.current, isLast(maxScroll));
      }
      
      scrollRef.current = rubberbandIfOutOfBounds(scrollRef.current, maxScroll, 0,0.8)
      const scrollerPos = (scrollRef.current / maxScroll) * (getContainerWidth() - getScrollerWidth());
      api.start({ x: scrollRef.current, scrollerPos })
    }
  },
  config)

  const sliderStyle = {
    translateX: x
  }

  const scrollerStyle = { 
    translateX: scrollerPos
  }

  useEffect(() => {

  })

  const onIndexChange = useCallback((nextIndex, isLast) => {
    setIndex(nextIndex);
    setDisabled(isLast);
  }, []);

  const onNextClick = useCallback(() => {
    setIndex(index + 1);
    console.log(index);
  }, [setIndex, index]);

  const onPrevClick = useCallback(() => {
    setIndex(index - 1);
    console.log(index);
  }, [setIndex, index]);

  return (
    <div>
      <div className="scroll-container">
        <animated.div className="scroller" ref={scrollerRef} style={scrollerStyle} />
      </div>
      <div className="slider-container"  ref={containerRef}>
        <animated.div className="slider-container-inner" style={sliderStyle}
        draggable="false" ref={innerRef} {...bind()}>
          {
            items.map((_, i) => (
              <div className="slide">
                <SlideItem index={i} />
              </div>
            ))
          }
        </animated.div>
        <button className="left-arrow" onClick={onPrevClick} disabled={index === 0}>prev</button>
        <button className="right-arrow" onClick={onNextClick} disabled={disabled}>next</button>
      </div>

    </div>
)}

const SlideItem = ({ index }) => (
  <a href={`#item-${index}`} draggable="false" className="slide-content">
    <img src="https://source.unsplash.com/200x100/?nature,water" draggable="false" />
    <div className="number">
    { index }
    </div>
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