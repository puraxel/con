/* ---------------------------
   header Scroll Effect
--------------------------- */
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

/* ---------------------------
   Scroll Animate & Parallax
--------------------------- */
const hero = document.querySelector('.hero');
const sections = document.querySelectorAll('section:not(.c_row)');
const rows = document.querySelectorAll('.c_row');

const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        if(el.classList.contains('c_row')) {
            el.classList.add(el.classList.contains('left') ? 'fade-in-left' : 'fade-in-right');
        } else {
            el.classList.add('animate');
        }
    });
}, { threshold: 0.2 });

// 일반 섹션 observer
sections.forEach(sec => observer.observe(sec));

// crossing rows observer
rows.forEach((row, index) => {
    // 홀수=left, 짝수=right
    row.classList.add(index % 2 === 0 ? 'left' : 'right');
    observer.observe(row);
});

// Parallax
window.addEventListener('scroll', () => {
    document.querySelectorAll('section[data-parallax]').forEach(section => {
        const speed = 0.5;
        const offset = window.scrollY * speed;
        section.style.backgroundPosition = `center ${-offset}px`;
    });
});

/* ---------------------------
   Hero Text Animation (Letter by Letter)
--------------------------- */
const heroTitle = document.querySelector('.hero h1');
heroTitle.innerHTML = heroTitle.textContent
    .split('')
    .map(c => `<span style="display:inline-block; transform:translateY(40px); transition:0.5s;">${c}</span>`)
    .join('');

const spans = heroTitle.querySelectorAll('span');
window.addEventListener('load', () => {
    spans.forEach((s, i) => {
        setTimeout(() => { s.style.transform = 'translateY(0)'; }, i * 50);
    });
});

/* ---------------------------
   Products Carousel (Infinite Loop + Drag)
   - 기존 small carousel
--------------------------- */
(function(){
    const track = document.querySelector('.carousel-track');
    if(!track) return;
    const slides = Array.from(track.children);
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let index = 0;

    const updateCarousel = () => {
        track.style.transform = `translateX(-${index * 100}%)`;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    };

    prevBtn.addEventListener('click', () => { index = (index -1 + slides.length) % slides.length; updateCarousel(); });
    nextBtn.addEventListener('click', () => { index = (index +1) % slides.length; updateCarousel(); });

    // Drag
    let startX = 0, isDown = false;
    track.addEventListener('pointerdown', e => { isDown=true; startX=e.clientX; track.style.transition='none'; });
    track.addEventListener('pointermove', e => { if(!isDown) return; const dx=e.clientX-startX; track.style.transform=`translateX(${-index*100 + dx/track.offsetWidth*100}%)`; });
    track.addEventListener('pointerup', e => {
        if(!isDown) return; isDown=false;
        const dx = e.clientX-startX;
        track.style.transition='transform 0.6s ease';
        if(dx<-50) index=(index+1)%slides.length;
        else if(dx>50) index=(index-1+slides.length)%slides.length;
        updateCarousel();
    });

    setInterval(()=>{ nextBtn.click(); },4000);
})();

/* ---------------------------
   Products LCarousel (Large Horizontal Carousel)
--------------------------- */
(function () {
    const root = document.documentElement;
    const Lcarousel = document.querySelector('.Lcarousel');
    if(!Lcarousel) return;

    const viewport = Lcarousel.querySelector('.viewport');
    const track = Lcarousel.querySelector('.track');
    const prevBtn = Lcarousel.querySelector('.prev');
    const nextBtn = Lcarousel.querySelector('.next');
    const dotsContainer = Lcarousel.querySelector('.dots');

    let slides = Array.from(track.children);
    const originalCount = slides.length;

    const DRAG_SPEED = 0.9;
    const TRANSITION_MS = 400;
    const THRESHOLD_RATIO_PC = 0.2;
    const THRESHOLD_RATIO_MOBILE = 0.1;

    const getVisible = () => parseFloat(getComputedStyle(root).getPropertyValue('--visible')) || 3.3333;
    const getCloneCount = () => Math.max(4, Math.ceil(getVisible()) + 1);

    let cloneCount = 0, index = 0, gap = 0, slideSpan = 0;

    const setTransition = (on) => { track.style.transition = on ? `transform ${TRANSITION_MS}ms ease` : 'none'; };

    const measure = () => {
        const slideEl = track.querySelector('.slide');
        if(!slideEl) return;
        const slideRect = slideEl.getBoundingClientRect();
        const styles = getComputedStyle(track);
        gap = parseFloat(styles.columnGap || styles.gap) || 0;
        slideSpan = slideRect.width + gap;
    };

    const goToIndex = (i, animate=true) => { setTransition(animate); index=i; track.style.transform=`translateX(${-index*slideSpan}px)`; updateDots(); };
    const snapIfLoopEdge = () => {
        const firstReal=cloneCount;
        const lastRealStart=cloneCount+originalCount-1;
        if(index>lastRealStart) goToIndex(index-originalCount,false);
        else if(index<firstReal) goToIndex(index+originalCount,false);
    };

    const rebuild = () => {
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
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // Drag
    let isDown=false, startX=0, startIndex=0, startTransform=0;
    const getCurrentTranslate = ()=> { const m=/translateX\((-?\d+(?:\.\d+)?)px\)/.exec(track.style.transform); return m?parseFloat(m[1]):0; };
    const onDown = e=> { e.preventDefault(); isDown=true; startX=e.clientX??e.touches?.[0]?.clientX??0; startIndex=index; startTransform=getCurrentTranslate(); setTransition(false); };
    const onMove = e=> { if(!isDown) return; const x=e.clientX??e.touches?.[0]?.clientX??0; const dx=x-startX; track.style.transform=`translateX(${startTransform+dx*DRAG_SPEED}px)`; };
    const onUp = e=> {
        if(!isDown) return; isDown=false;
        const endX = e.clientX??e.changedTouches?.[0]?.clientX??startX;
        const dx = endX-startX;
        const isMobile = window.innerWidth<=768;
        const threshold = slideSpan*(isMobile?THRESHOLD_RATIO_MOBILE:THRESHOLD_RATIO_PC);
        setTransition(true);
        if(Math.abs(dx)>5) { const link=e.target.closest('a'); if(link) e.preventDefault(); }
        if(dx<-threshold) goToIndex(startIndex+1,true);
        else if(dx>threshold) goToIndex(startIndex-1,true);
        else goToIndex(startIndex,true);
    };

    Lcarousel.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', e=>{ if(isDown) onMove(e); });
    window.addEventListener('pointerup', e=>{ if(isDown) onUp(e); });
    Lcarousel.addEventListener('touchstart', onDown);
    window.addEventListener('touchmove', e=>{ if(isDown) onMove(e); });
    window.addEventListener('touchend', e=>{ if(isDown) onUp(e); });
    track.addEventListener('transitionend', snapIfLoopEdge);

    const onResize = ()=>{
        const currentRealOffset=(index-cloneCount)%originalCount;
        rebuild();
        requestAnimationFrame(()=>{ goToIndex(cloneCount+(currentRealOffset+originalCount)%originalCount,false); });
    };
    window.addEventListener('resize', ()=>{ measure(); onResize(); });

    const createDots = ()=>{
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
        const realIndex=(index-cloneCount+originalCount)%originalCount;
        dotsContainer.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active', i===realIndex));
    };

    let autoPlayTimer;
    const startAutoPlay = ()=>{ stopAutoPlay(); autoPlayTimer=setInterval(next,3000); };
    const stopAutoPlay = ()=>clearInterval(autoPlayTimer);
    Lcarousel.addEventListener('mouseenter', stopAutoPlay);
    Lcarousel.addEventListener('mouseleave', startAutoPlay);

    rebuild();
    startAutoPlay();
})();

/* ---------------------------
   Testimonials Slide (Auto + Drag)
--------------------------- */
(function(){
    const testContainer = document.querySelector('.testimonials .slides');
    if(!testContainer) return;
    const testSlides = Array.from(testContainer.children);
    let testIndex=0;

    const updateTestimonial=()=>{ 
        testContainer.style.transform=`translateX(-${testIndex*100}%)`; 
        testContainer.style.transition='transform 0.6s ease';
    };

    // Auto Play
    let autoTestimonial = setInterval(()=>{
        testIndex=(testIndex+1)%testSlides.length;
        updateTestimonial();
    },5000);

    // Drag
    let tStartX=0, tIsDown=false, tStartIndex=0, tStartTransform=0;
    const getCurrentTranslate = () => {
        const m=/translateX\((-?\d+(?:\.\d+)?)%\)/.exec(testContainer.style.transform);
        return m?parseFloat(m[1]):-testIndex*100;
    };

    const onDown = e=>{
        tIsDown=true; 
        tStartX=e.clientX??e.touches?.[0]?.clientX??0;
        tStartIndex=testIndex;
        tStartTransform=getCurrentTranslate();
        testContainer.style.transition='none';
        clearInterval(autoTestimonial);
    };
    const onMove = e=>{
        if(!tIsDown) return;
        const x=e.clientX??e.touches?.[0]?.clientX??0;
        const dx=(x-tStartX)/testContainer.offsetWidth*100;
        testContainer.style.transform=`translateX(${tStartTransform+dx}%)`;
    };
    const onUp = e=>{
        if(!tIsDown) return;
        tIsDown=false;
        const endX = e.clientX??e.changedTouches?.[0]?.clientX??tStartX;
        const dx=(endX-tStartX)/testContainer.offsetWidth*100;
        if(dx<-15) testIndex=(tStartIndex+1)%testSlides.length;
        else if(dx>15) testIndex=(tStartIndex-1+testSlides.length)%testSlides.length;
        updateTestimonial();
        autoTestimonial = setInterval(()=>{
            testIndex=(testIndex+1)%testSlides.length;
            updateTestimonial();
        },5000);
    };

    testContainer.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    testContainer.addEventListener('touchstart', onDown);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
})();

/* ---------------------------
  nav 활성화
--------------------------- */
const navLinks = document.querySelectorAll('header nav a');

// id가 있는 section만 선택
const sectionsWithId = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href').substring(1) === id);
      });
    }
  });
}, { threshold: 0.1 }); // 화면 중앙 근처에 왔을 때

sectionsWithId.forEach(sec => navObserver.observe(sec));

/* ---------------------------
   Stats Count-up
--------------------------- */
const counters = document.querySelectorAll('.count');
const speed = 50; // ms

counters.forEach(counter => {
  const updateCount = () => {
    const target = parseFloat(counter.dataset.target);
    const count = parseFloat(counter.innerText);
    const increment = target / 30; // 속도 조절
    if (count < target) {
      counter.innerText = (count + increment).toFixed(1);
      setTimeout(updateCount, speed);
    } else {
      counter.innerText = target;
    }
  };

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      updateCount();
      obs.unobserve(counter);
    }
  }, { threshold: 0.5 });

  obs.observe(counter);
});

/* ---------------------------
   FAQ Accordion
--------------------------- 
const faqButtons = document.querySelectorAll('.faq-question');
faqButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    answer.style.display = (answer.style.display === 'block') ? 'none' : 'block';
  });
});*/

document.addEventListener('DOMContentLoaded', () => {
  const questions = document.querySelectorAll('.faq-question');

  questions.forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isOpen = question.classList.contains('active');

      // 모든 FAQ 닫기
      questions.forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        question.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
});


/* ---------------------------
   Timeline Fade-in
--------------------------- */
const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach(item => {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      item.style.transform = 'translateX(0)';
      item.style.opacity = '1';
      obs.unobserve(item);
    }
  }, { threshold: 0.3 });
  item.style.transform = 'translateX(-50px)';
  item.style.opacity = '0';
  obs.observe(item);
});

/* ---------------------------
   Contact Form Submission
--------------------------- */
document.querySelector('.contact-form').addEventListener('submit', e => {
  e.preventDefault();
  alert('Message sent!'); 
  e.target.reset();
});

/* ---------------------------
   Popup Btn + Go to Top
--------------------------- */
const popups = document.querySelectorAll('.popupBtn');
const scrollBtn = document.getElementById('scrollToTop');

function handleScroll() {
    const scrollPosition = window.scrollY;

    // 팝업 버튼 표시
    if (scrollPosition > 100) {
        popups.forEach(popup => popup.classList.add('show'));
    } else {
        popups.forEach(popup => popup.classList.remove('show'));
    }

    // Go to Top 버튼 표시
    if (scrollPosition > 300) {
        scrollBtn.classList.add('show');
    } else {
        scrollBtn.classList.remove('show');
    }
}

window.addEventListener('scroll', handleScroll);

//  Go to Top 버튼 클릭 이벤트
scrollBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// X 버튼 클릭 시 숨기기
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.parentElement.style.display = 'none';
    });
});

//하루 안보기 (쿠키 사용)
document.querySelectorAll('.hide-today-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const popup = btn.parentElement;
        const popupId = popup.id;
        document.cookie = `${popupId}=hidden; path=/; max-age=${60*60*24}`; // 1일
        popup.style.display = 'none';
    });
});

// 쿠키 확인 후 팝업 숨김
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

window.addEventListener('load', () => {
    document.querySelectorAll('.popupBtn').forEach(popup => {
        const popupId = popup.id;
        if (getCookie(popupId) === 'hidden') {
            popup.style.display = 'none';
        }
    });
});
