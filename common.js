if (/Mobi|Android/i.test(navigator.userAgent)) {
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    header.style.top = window.scrollY + 'px';
  });
}

document.addEventListener('DOMContentLoaded', () => {

    /* ===========================
       1. Header Scroll, Footer, GoToTop, Popups, Parallax
    =========================== */
    const header = document.querySelector('header');
    const popups = document.querySelectorAll('.popupBtn');
    const scrollBtn = document.getElementById('scrollToTop');
    const parallaxSections = document.querySelectorAll('section[data-parallax]');

    function handleScroll() {
        // 모바일/모든 브라우저 호환용 스크롤 위치
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        // header toggle (충돌 없는 최소 처리)
        if(header) {
            if(scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }

        // popup toggle
        popups.forEach(p => {
            if(scrollY > 100) p.classList.add('show');
            else p.classList.remove('show');
        });

        // Go to Top toggle
        if(scrollBtn) {
            if(scrollY > 300) scrollBtn.classList.add('show');
            else scrollBtn.classList.remove('show');
        }

        // parallax (섹션별 transform 독립 처리)
        parallaxSections.forEach(section => {
            const speed = 0.5;
            // section 자체 offsetTop 기준으로 적용
            const offset = section.offsetTop;
            section.style.backgroundPosition = `center ${-(scrollY - offset) * speed}px`;
        });
    }

    window.addEventListener('scroll', handleScroll);

    // 초기 로딩 시에도 적용
    window.addEventListener('load', () => requestAnimationFrame(handleScroll));
    setTimeout(handleScroll, 100);
    // Go to Top 클릭
    if(scrollBtn){
        scrollBtn.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 팝업 X, 하루 안보기
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => btn.parentElement.style.display = 'none');
    });
    document.querySelectorAll('.hide-today-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const popup = btn.parentElement;
            const popupId = popup.id;
            document.cookie = `${popupId}=hidden; path=/; max-age=${60*60*24}`;
            popup.style.display = 'none';
        });
    });

    function getCookie(name){
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if(parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    window.addEventListener('load', () => {
        popups.forEach(popup => {
            const popupId = popup.id;
            if(getCookie(popupId) === 'hidden') popup.style.display = 'none';
        });
    });
/* ---------------------------
  nav 활성화
--------------------------- */
const navLinks = document.querySelectorAll('.section-links a');
const sectionsWithId = document.querySelectorAll('section[id]');

if (navLinks.length && sectionsWithId.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (entry.isIntersecting) {
        // 모든 링크에서 active 제거 후 현재 섹션 링크만 active
        navLinks.forEach(link => {
          const hrefId = link.getAttribute('href').split('#')[1];
          link.classList.toggle('active', hrefId === id);
        });
      }
    });
  }, { threshold: 0.1 }); // 화면 10%만 보여도 감지

  sectionsWithId.forEach(sec => navObserver.observe(sec));
}


    /* ===========================
       2. Hero Text Animation (Load 이후)
    =========================== */
    const heroTitle = document.querySelector('.hero h1');
    if(heroTitle){
        heroTitle.innerHTML = heroTitle.textContent
            .split('')
            .map(c => `<span style="display:inline-block; transform:translateY(40px); transition:0.5s;">${c}</span>`)
            .join('');

        const spans = heroTitle.querySelectorAll('span');
        window.addEventListener('load', () => {
            spans.forEach((s,i)=>setTimeout(()=>{ s.style.transform='translateY(0)'; }, i*50));
        });
    }

   /* ===========================
   Hero Slider (무한 루프 + Drag + Auto)
=========================== */
const sliderEl = document.querySelector('.hero_slider');
const heroSlidesRow = document.querySelector('.hero_slides');
const heroSlideElems = document.querySelectorAll('.hero_slide');
const heroPrevBtn = document.querySelector('.hero_prev');
const heroNextBtn = document.querySelector('.hero_next');

if(sliderEl && heroSlidesRow && heroSlideElems.length>0 && heroPrevBtn && heroNextBtn){
    let heroIndex = 0;
    let heroSlideWidth = sliderEl.offsetWidth;
    const heroTotal = heroSlideElems.length;
    let heroAutoTimer;
    let isTransitioning = false;

    // 1. 슬라이드 복제 (무한 루프)
    const firstClone = heroSlideElems[0].cloneNode(true);
    const lastClone = heroSlideElems[heroTotal-1].cloneNode(true);
    heroSlidesRow.appendChild(firstClone);
    heroSlidesRow.insertBefore(lastClone, heroSlideElems[0]);
    heroIndex = 1; // 실제 첫 슬라이드는 index 1

    heroSlidesRow.style.transform = `translateX(${-heroIndex*heroSlideWidth}px)`;

    // 2. 슬라이드 이동 함수
    const moveToSlide = (targetIndex)=>{
        if(isTransitioning) return; // 이동 중이면 무시
        isTransitioning = true;

        heroSlidesRow.style.transition = 'transform 0.6s ease-in-out';
        heroSlidesRow.style.transform = `translateX(${-targetIndex*heroSlideWidth}px)`;
        heroIndex = targetIndex;
    };

    // 3. transitionend 이벤트로 무한 루프 처리
    heroSlidesRow.addEventListener('transitionend', ()=>{
        if(heroIndex === 0){ // 마지막 클론에서 첫 슬라이드로 점프
            heroSlidesRow.style.transition = 'none';
            heroIndex = heroTotal;
            heroSlidesRow.style.transform = `translateX(${-heroIndex*heroSlideWidth}px)`;
        }
        if(heroIndex === heroTotal + 1){ // 첫 클론에서 마지막 슬라이드로 점프
            heroSlidesRow.style.transition = 'none';
            heroIndex = 1;
            heroSlidesRow.style.transform = `translateX(${-heroIndex*heroSlideWidth}px)`;
        }
        isTransitioning = false;
    });

    // 4. 버튼 클릭
    heroPrevBtn.addEventListener('click', ()=>moveToSlide(heroIndex-1));
    heroNextBtn.addEventListener('click', ()=>moveToSlide(heroIndex+1));

    // 5. 자동 슬라이드
    const startAuto = ()=>{
        clearInterval(heroAutoTimer);
        heroAutoTimer = setInterval(()=>moveToSlide(heroIndex+1),10000);
    };
    startAuto();
    sliderEl.addEventListener('mouseenter', ()=>clearInterval(heroAutoTimer));
    sliderEl.addEventListener('mouseleave', startAuto);

    // 6. 드래그
    let startX=0, currentX=0, isDragging=false, initialTranslate=0;

    const setTranslate = (val)=>{ heroSlidesRow.style.transition='none'; heroSlidesRow.style.transform=`translateX(${val}px)`; };
    const resetTranslate = ()=>{ heroSlidesRow.style.transition='transform 0.6s ease-in-out'; heroSlidesRow.style.transform=`translateX(${-heroIndex*heroSlideWidth}px)`; };

    const dragStart = x=>{
        isDragging=true;
        startX=x;
        initialTranslate=-heroIndex*heroSlideWidth;
        heroSlidesRow.style.cursor='grabbing';
    };
    const dragMove = x=>{
        if(!isDragging) return;
        currentX=x;
        setTranslate(initialTranslate + (currentX-startX));
    };
    const dragEnd = ()=>{
        if(!isDragging) return;
        isDragging=false;
        heroSlidesRow.style.cursor='grab';
        const diff = currentX - startX;
        if(Math.abs(diff) > heroSlideWidth/4){
            moveToSlide(diff>0 ? heroIndex-1 : heroIndex+1);
        } else {
            resetTranslate();
        }
    };

    sliderEl.addEventListener('mousedown', e=>{
        e.preventDefault();
        dragStart(e.clientX);
        const onMove = e2=>dragMove(e2.clientX);
        const onUp = ()=>{
            dragEnd();
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
    sliderEl.addEventListener('touchstart', e=>dragStart(e.touches[0].clientX));
    sliderEl.addEventListener('touchmove', e=>dragMove(e.touches[0].clientX));
    sliderEl.addEventListener('touchend', dragEnd);

    // 7. 리사이즈
    window.addEventListener('resize', ()=>{
        heroSlideWidth = sliderEl.offsetWidth;
        heroSlidesRow.style.transition='none';
        heroSlidesRow.style.transform = `translateX(${-heroIndex*heroSlideWidth}px)`;
    });
}

    /* ===========================
       4. Small Products Carousel
    =========================== */
    const track = document.querySelector('.carousel-track');
    if(track){
        const slides = Array.from(track.children);
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        let index = 0;

        const updateCarousel = ()=>{ 
            track.style.transform = `translateX(-${index*100}%)`;
            slides.forEach((slide,i)=>slide.classList.toggle('active',i===index));
        };

        prevBtn.addEventListener('click', ()=>{ index=(index-1+slides.length)%slides.length; updateCarousel(); });
        nextBtn.addEventListener('click', ()=>{ index=(index+1)%slides.length; updateCarousel(); });

        // Drag
        let startX=0, isDown=false;
        track.addEventListener('pointerdown', e=>{ isDown=true; startX=e.clientX; track.style.transition='none'; });
        track.addEventListener('pointermove', e=>{ if(!isDown) return; const dx=e.clientX-startX; track.style.transform=`translateX(${-index*100 + dx/track.offsetWidth*100}%)`; });
        track.addEventListener('pointerup', e=>{
            if(!isDown) return; isDown=false; const dx=e.clientX-startX; track.style.transition='transform 0.6s ease';
            if(dx<-50) index=(index+1)%slides.length;
            else if(dx>50) index=(index-1+slides.length)%slides.length;
            updateCarousel();
        });

        setInterval(()=>nextBtn.click(),4000);
    }

/* ===========================
   5. FAQ Accordion (멀티 오픈 가능)
=========================== */
const questions = document.querySelectorAll('.faq-question');
const closeAllBtn = document.getElementById('close-all');
const openAllBtn = document.getElementById('open-all'); // 새로 추가한 버튼

function updateBtnVisibility() {
    const anyOpen = Array.from(questions).some(q => q.classList.contains('active'));
    const allOpen = Array.from(questions).every(q => q.classList.contains('active'));

    // 모두 닫기 버튼: 질문이 하나 이상 열려 있을 때만 표시
    if (closeAllBtn) closeAllBtn.style.display = anyOpen ? 'inline-block' : 'none';

    // 모두 열기 버튼: 질문이 하나 이상 있고 모두 열려 있지 않을 때만 표시
    if (openAllBtn) openAllBtn.style.display = (questions.length > 0 && !allOpen) ? 'inline-block' : 'none';
}

if (questions.length > 0) {
    questions.forEach(q => {
        q.addEventListener('click', () => {
            const answer = q.nextElementSibling;
            const isOpen = q.classList.contains('active');

            if (isOpen) {
                q.classList.remove('active');
                answer.style.maxHeight = null;
            } else {
                q.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }

            updateBtnVisibility(); // 클릭 후 버튼 상태 갱신
        });
    });
}

// 모든 FAQ 닫기
if (closeAllBtn) {
    closeAllBtn.addEventListener('click', () => {
        questions.forEach(q => {
            q.classList.remove('active');
            q.nextElementSibling.style.maxHeight = null;
        });
        updateBtnVisibility();
    });
}

// 모든 FAQ 열기
if (openAllBtn) {
    openAllBtn.addEventListener('click', () => {
        questions.forEach(q => {
            q.classList.add('active');
            q.nextElementSibling.style.maxHeight = q.nextElementSibling.scrollHeight + 'px';
        });
        updateBtnVisibility();
    });
}

// 초기 상태 버튼 표시 업데이트
updateBtnVisibility();


    /* ===========================
       6. Timeline Fade-in
    =========================== */
    const timelineItems = document.querySelectorAll('.timeline-item');
    if(timelineItems.length>0){
        timelineItems.forEach(item=>{
            const obs = new IntersectionObserver(entries=>{
                if(entries[0].isIntersecting){
                    item.style.transform='translateX(0)';
                    item.style.opacity='1';
                    obs.unobserve(item);
                }
            },{threshold:0.3});
            item.style.transform='translateX(-50px)';
            item.style.opacity='0';
            obs.observe(item);
        });
    }

    /* ===========================
       7. Stats Count-up
    =========================== */
    const counters = document.querySelectorAll('.count');
    const speed = 50;
    if(counters.length>0){
        counters.forEach(counter=>{
            const updateCount = ()=>{
                const target = parseFloat(counter.dataset.target);
                const count = parseFloat(counter.innerText);
                const increment = target / 30;
                if(count<target){
                    counter.innerText = (count+increment).toFixed(1);
                    setTimeout(updateCount,speed);
                }else{
                    counter.innerText = target;
                }
            };
            const obs = new IntersectionObserver(entries=>{
                if(entries[0].isIntersecting){
                    updateCount();
                    obs.unobserve(counter);
                }
            },{threshold:0.5});
            obs.observe(counter);
        });
    }

    /* ===========================
       8. Scroll Animate & Parallax Sections
    =========================== */
    const sections = document.querySelectorAll('section:not(.c_row)');
    const rows = document.querySelectorAll('.c_row');

    if(sections.length>0 || rows.length>0){
        const observer = new IntersectionObserver((entries)=>{
            entries.forEach(entry=>{
                if(!entry.isIntersecting) return;
                const el = entry.target;
                if(el.classList.contains('c_row')){
                    el.classList.add(el.classList.contains('left') ? 'fade-in-left' : 'fade-in-right');
                } else {
                    el.classList.add('animate');
                }
            });
        },{threshold:0.2});

        sections.forEach(sec=>observer.observe(sec));
        rows.forEach((row,index)=>{
            row.classList.add(index%2===0 ? 'left' : 'right');
            observer.observe(row);
        });
    }
	
/* ===========================
   Lcarousel (Large Horizontal Carousel)
=========================== */
(function(){
    const Lcarousel = document.querySelector('.Lcarousel');
    if(!Lcarousel) return;

    const viewport = Lcarousel.querySelector('.viewport');
    const track = Lcarousel.querySelector('.track');
    const prevBtn = Lcarousel.querySelector('.Lnav.prev');
    const nextBtn = Lcarousel.querySelector('.Lnav.next');
    const dotsContainer = Lcarousel.querySelector('.dots');

    let slides = Array.from(track.children);
    const originalCount = slides.length;

    const TRANSITION_MS = 400;
    const DRAG_SPEED = 0.9;
    const THRESHOLD_RATIO_PC = 0.2;
    const THRESHOLD_RATIO_MOBILE = 0.1;

    let cloneCount = 0, index = 0, gap = 0, slideWidth = 0;
    const root = document.documentElement;

    const getVisible = ()=> parseFloat(getComputedStyle(root).getPropertyValue('--visible')) || 3.3333;
    const getCloneCount = ()=> Math.max(4, Math.ceil(getVisible())+1);

    const setTransition = on => { track.style.transition = on ? `transform ${TRANSITION_MS}ms ease` : 'none'; };

    const measure = ()=>{
        const slideEl = track.querySelector('.slide');
        if(!slideEl) return;
        const styles = getComputedStyle(track);
        gap = parseFloat(styles.columnGap || styles.gap) || 0;
        slideWidth = slideEl.getBoundingClientRect().width + gap;
    };

    const goToIndex = (i, animate=true)=>{
        setTransition(animate);
        index=i;
        track.style.transform = `translateX(${-index*slideWidth}px)`;
        updateDots();
    };

    const snapIfLoopEdge = ()=>{
        const firstReal=cloneCount;
        const lastRealStart=cloneCount+originalCount-1;
        if(index>lastRealStart) goToIndex(index-originalCount,false);
        else if(index<firstReal) goToIndex(index+originalCount,false);
    };

    const rebuild = ()=>{
        Array.from(track.querySelectorAll('.slide.__clone')).forEach(n=>n.remove());
        slides = Array.from(track.querySelectorAll('.slide')).filter(el=>!el.classList.contains('__clone'));
        cloneCount = getCloneCount();

        const firstClones = slides.slice(0,cloneCount).map(n=>n.cloneNode(true));
        const lastClones = slides.slice(-cloneCount).map(n=>n.cloneNode(true));

        firstClones.forEach(n=>{ n.classList.add('__clone'); track.appendChild(n); });
        lastClones.forEach(n=>{ n.classList.add('__clone'); track.insertBefore(n, track.firstChild); });

        measure();
        requestAnimationFrame(()=>{ goToIndex(cloneCount,false); });
        createDots();
    };

    const next = ()=>goToIndex(index+1);
    const prev = ()=>goToIndex(index-1);

    if(prevBtn) prevBtn.addEventListener('click', prev);
    if(nextBtn) nextBtn.addEventListener('click', next);

    /* Drag */
    let isDown=false, startX=0, startIndex=0, startTransform=0;
    const getCurrentTranslate = ()=> {
        const m=/translateX\((-?\d+(?:\.\d+)?)px\)/.exec(track.style.transform);
        return m?parseFloat(m[1]):0;
    };

    const onDown = e=>{
        // 버튼 클릭 시 드래그 이벤트 무시
        if(e.target.closest('.Lnav')) return;

        isDown=true;
        startX=e.clientX??e.touches?.[0]?.clientX??0;
        startIndex=index;
        startTransform=getCurrentTranslate();
        setTransition(false);
    };

    const onMove = e=>{
        if(!isDown) return;
        const x = e.clientX??e.touches?.[0]?.clientX??0;
        const dx = x-startX;
        track.style.transform = `translateX(${startTransform+dx*DRAG_SPEED}px)`;
    };

    const onUp = e=>{
        if(!isDown) return;
        isDown=false;
        const endX = e.clientX??e.changedTouches?.[0]?.clientX??startX;
        const dx = endX-startX;
        const isMobile = window.innerWidth<=768;
        const threshold = slideWidth*(isMobile?THRESHOLD_RATIO_MOBILE:THRESHOLD_RATIO_PC);
        setTransition(true);

        if(Math.abs(dx)>5){
            const link = e.target.closest('a');
            if(link) e.preventDefault();
        }

        if(dx<-threshold) goToIndex(startIndex+1,true);
        else if(dx>threshold) goToIndex(startIndex-1,true);
        else goToIndex(startIndex,true);
    };

    // Pointer / Touch 이벤트
    Lcarousel.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', e=>{ if(isDown) onMove(e); });
    window.addEventListener('pointerup', e=>{ if(isDown) onUp(e); });

    Lcarousel.addEventListener('touchstart', onDown);
    window.addEventListener('touchmove', e=>{ if(isDown) onMove(e); });
    window.addEventListener('touchend', e=>{ if(isDown) onUp(e); });

    track.addEventListener('transitionend', snapIfLoopEdge);

    const onResize = ()=>{
        const currentRealOffset=(index-cloneCount+originalCount)%originalCount;
        rebuild();
        requestAnimationFrame(()=>{ goToIndex(cloneCount+currentRealOffset,false); });
    };
    window.addEventListener('resize', onResize);

    /* Dots */
    const createDots = ()=>{
        if(!dotsContainer) return;
        dotsContainer.innerHTML='';
        for(let i=0;i<originalCount;i++){
            const dot=document.createElement('div');
            dot.className='dot';
            dot.addEventListener('click', ()=>goToIndex(cloneCount+i));
            dotsContainer.appendChild(dot);
        }
        updateDots();
    };

    const updateDots = ()=>{
        if(!dotsContainer) return;
        const realIndex=(index-cloneCount+originalCount)%originalCount;
        dotsContainer.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active', i===realIndex));
    };

    /* AutoPlay */
    let autoPlayTimer;
    const startAutoPlay = ()=>{ stopAutoPlay(); autoPlayTimer=setInterval(next,3000); };
    const stopAutoPlay = ()=>clearInterval(autoPlayTimer);
    Lcarousel.addEventListener('mouseenter', stopAutoPlay);
    Lcarousel.addEventListener('mouseleave', startAutoPlay);

    rebuild();
    startAutoPlay();

})();


	/* ===========================
  10. testimonials (Large Horizontal Carousel)
=========================== */
(function(){
    const testimonials = document.querySelector('#testimonials .slides');
    if(!testimonials) return;

    const slides = Array.from(testimonials.children);
    const total = slides.length;
    let index = 0;
    let slideWidth = testimonials.offsetWidth;

    // 슬라이드 위치 업데이트
    const updateSlide = i => {
        testimonials.style.transition = 'transform 0.6s ease';
        testimonials.style.transform = `translateX(-${i * slideWidth}px)`;
        index = i;
    };

    // 자동 슬라이드
    let autoTimer = setInterval(()=>updateSlide((index+1)%total), 4000);

    // 드래그
    let isDown=false, startX=0, startTranslate=0;

    const getTranslateX = () => {
        const m = /translateX\((-?\d+(?:\.\d+)?)px\)/.exec(testimonials.style.transform);
        return m ? parseFloat(m[1]) : 0;
    };

    testimonials.addEventListener('pointerdown', e=>{
        isDown=true;
        startX=e.clientX??e.touches?.[0]?.clientX;
        startTranslate=getTranslateX();
        testimonials.style.transition='none';
        clearInterval(autoTimer);
    });

    window.addEventListener('pointermove', e=>{
        if(!isDown) return;
        const x = e.clientX??e.touches?.[0]?.clientX;
        const dx = x-startX;
        testimonials.style.transform = `translateX(${startTranslate + dx}px)`;
    });

    const onEnd = e=>{
        if(!isDown) return;
        isDown=false;
        const x = e.clientX??e.changedTouches?.[0]?.clientX;
        const dx = x-startX;
        if(dx<-slideWidth/4) updateSlide((index+1)%total);
        else if(dx>slideWidth/4) updateSlide((index-1+total)%total);
        else updateSlide(index);

        // 다시 자동 슬라이드
        autoTimer = setInterval(()=>updateSlide((index+1)%total), 4000);
    };

    window.addEventListener('pointerup', onEnd);
    testimonials.addEventListener('touchend', onEnd);

    // 리사이즈 대응
    window.addEventListener('resize', ()=>{
        slideWidth = testimonials.offsetWidth;
        updateSlide(index);
    });

    // 초기 위치
    updateSlide(0);

})();


});

/* ===========================
   모바일 햄버거 메뉴 + 아코디언 (최종 통합)
=========================== */
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');         // 햄버거 버튼
  const navMenu = document.querySelector('.nav-menu');               // nav-menu
  const CLASS_SHOW = 'show';                                         // 메뉴 열림 클래스
  const CLASS_OPEN = 'open';                                         // 아코디언 열림 클래스

  function isMobile() { return window.innerWidth <= 768; }

  // 모든 열린 서브메뉴 닫기
  function closeAllSubmenus() {
    navMenu.querySelectorAll(`.menu-item.${CLASS_OPEN}`).forEach(li => li.classList.remove(CLASS_OPEN));
  }

  // 햄버거 메뉴 열기
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.add(CLASS_SHOW);
    });
  }

  // X 버튼 / 메뉴 외부 클릭 처리 (이벤트 위임으로 통합)
  document.addEventListener('click', (e) => {
    if (!isMobile()) return;

    // X 버튼 클릭 시
    if (e.target.closest('.close-menu')) {
      navMenu.classList.remove(CLASS_SHOW);
      closeAllSubmenus();
      return;
    }

    // 메뉴 외부 클릭 시
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navMenu.classList.remove(CLASS_SHOW);
      closeAllSubmenus();
    }
  });

  // 모바일 아코디언 메뉴 (이벤트 위임)
  navMenu.addEventListener('click', (e) => {
    if (!isMobile()) return;

    const link = e.target.closest('li > a');
    if (!link) return;

    const parentLi = link.parentElement;
    const submenu = parentLi.querySelector(':scope > ul');
    if (!submenu) return; // 하위 메뉴 없으면 링크 그대로

    e.preventDefault();  // 링크 이동 막기

    // 같은 레벨의 다른 메뉴 닫기
    parentLi.parentElement.querySelectorAll(`:scope > li.${CLASS_OPEN}`)
      .forEach(sib => { if (sib !== parentLi) sib.classList.remove(CLASS_OPEN); });

    // 클릭한 메뉴 토글
    parentLi.classList.toggle(CLASS_OPEN);
  });

  // 화면 크기 변경 시 초기화
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      navMenu.classList.remove(CLASS_SHOW);
      closeAllSubmenus();
    }
  });
});


  
  
  
  
  

