function dragstart (e){
    this.style.opacity = 0.5;
    console.log(e);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function dragend (e){
    console.log(e);
    this.style.opacity= 1;
    if (e.screenX > 1000) {
        persone.hot = -1;
        localStorage.setItem('profile'+teller, JSON.stringify(persone));
        teller++;
        localStorage.setItem('profileteller', teller);
        profileCounterhotcold++;
        localStorage.setItem('profilecounterhotcold', profileCounterhotcold);
        
        runProfile();
    }
    else if (e.screenX < 500){
        persone.hot = 1;
        localStorage.setItem('profile'+teller, JSON.stringify(persone));
        teller++;
        localStorage.setItem('profileteller', teller);
        profileCounterhotcold++;
        localStorage.setItem('profilecounterhotcold', profileCounterhotcold);

        
        runProfile();

    }
}




