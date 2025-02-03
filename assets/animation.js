export { streakAnimation,setttingAni, spawnBloodSplatter, shakeContainer, con_animation, key_animation, hang_animation, pop_up_animation, bounce_effect, wrong_effect };

const streak = document.querySelector('.streak-container');
const selector = document.querySelector('#selector');
const logo = document.querySelector('.logo');
let isReversed = false;

logoAnimation();
const con_animation = () => {
    anime({
        targets: '.container',
        translateX: [-500, 0], 
        opacity: [0, 1],       
        duration: 1500,
        easing: 'easeOutExpo'
    });
}

const key_animation = () => {
    anime({
        targets: '.letter',
        scale: [0, 1], 
        opacity: [0, 1], 
        duration: 500,
        easing: 'easeOutExpo',
        delay: anime.stagger(20)  
    });
}

const hang_animation = () => {
    anime({
        targets: '.hang',
        scaleY: [0.8, 1],
        opacity: [0, 1],
        easing: 'easeOutBounce',
        duration: 1000
    });

}

const pop_up_animation = () => {
    anime({
        targets: '.popup-content',
        scale: [0.8, 1],  
        opacity: [0, 1], 
        translateY: [250, 0], 
        duration: 1000,
        easing: 'easeOutExpo'
    });
}

const bounce_effect = () => {
    anime({
        targets: '.playAgain',
        scale: [0.3, 1], 
        opacity: [0, 1], 
        duration: 1000,
        easing: 'easeOutBounce', 
        delay: 200, 
    });
}

const wrong_effect = () => {
    anime({
        targets: '.wrong',
        scale: [0, 1],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutExpo',
        duration: 1000,
        delay: anime.stagger(100),
    })
}

function shakeContainer() {
    anime({
        targets: '.container',  
        translateX: [
            { value: -10, duration: 100 },
            { value: 10, duration: 100 },
            { value: -7, duration: 100 },
            { value: 7, duration: 100 },
            { value: 0, duration: 100 }
        ],
        easing: 'easeInOutQuad'
    });
}

function spawnBloodSplatter() {
    const container = document.querySelector('.container');
    const splatter = document.createElement('div');
    splatter.classList.add('blood-splatter');

    const containerRect = container.getBoundingClientRect();
    const randomX = Math.random() * (containerRect.width - 20);  // Subtract splatter size
    const randomY = Math.random() * (containerRect.height - 20);

    splatter.style.left = `${randomX}px`;
    splatter.style.top = `${randomY}px`;

    const randomSize = Math.random() * 100 + 50;
    splatter.style.width = `${randomSize}px`;
    splatter.style.height = `${randomSize}px`;

    container.appendChild(splatter);
    anime({
        targets: splatter,
        scale: [0, 1.5],
        opacity: [0, 0.5],
        rotate: Math.random() * 360,
        easing: 'easeOutBounce',
        duration: 800,
        complete: function () {
            anime({
                targets: splatter,
                opacity: [.6, 0],
                duration: 1500,
                easing: 'easeInExpo',
                delay: 4000,
                complete: function () {
                    splatter.remove();
                }   
            });
        }
    });
}

function streakAnimation() {
    streak.classList.remove("hide");
    anime({
        targets: '.streak-container',
        translateX: [300, -300],
        duration: 4000,
        easing: 'easeOutExpo',
        complete: function () {
            streak.classList.add("hide");
        }
    });
    
}

function logoAnimation() {
    anime.timeline()
        .add({
            targets: '.logo',
            scale: [0, 1.5],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutBounce'
        })
        .add({
            targets: '.logo',
            scale: [1.5, 1],
            duration: 500,
            easing: 'easeOutElastic(1, .8)'
        })
        .add({
            targets: '.logo',
            scaleX: [1, 1.2],
            scaleY: [1, 0.8],
            duration: 300,
            easing: 'easeInOutQuad'
        })
        .add({
            targets: '.logo',
            scaleX: [1.2, 1],
            scaleY: [0.8, 1],
            duration: 300,
            easing: 'easeInOutQuad'
        })
        .add({
            targets: '.logo',
            opacity: [1, 0],
            duration: 500,
            easing: 'easeInOutQuad',
            complete: function () {
                selector.classList.remove('hide');
                logo.classList.add('hide');
            }
        });
}

function setttingAni() {
    anime({
        targets: '.settings',
        translateY: isReversed ? [10, -200] : [-100, 10],
        duration: 2000,
        easing: 'easeOutBounce',
    });
    anime({
        targets: '.gear',
        rotate: isReversed ? '-90deg' : '90deg',
        duration: 2000,
        easing: 'easeOutBounce',
    });
    isReversed = !isReversed;
}
logoAnimation();
