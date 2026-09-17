const button=document.querySelector('.menu-button');
const menu=document.querySelector('.mobile-nav');
button.addEventListener('click',()=>{const open=menu.classList.toggle('open');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.classList.remove('open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open navigation')}));
document.getElementById('year').textContent=new Date().getFullYear();
