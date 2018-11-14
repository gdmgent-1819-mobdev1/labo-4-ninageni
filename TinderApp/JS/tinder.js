let InfoProfile = function (picture, name, age, location, street, id){
 this.picture = picture;
 this.name = name;
 this.age = age;
 this.location = location;
 this.street = street;
 this.id = id;
 this.hot = 0;
 this.coordinates = {
    longitude: 0,
    latitude: 0
 };
}

let profileCounter;
let teller = 0;
let tempstr = "";
let profileCounterhotcold = 0;
let persone = '';
let called = localStorage.getItem('called') != null ? localStorage.getItem('called'): false;

function fetchProfile(){
    fetch('https://randomuser.me/api/?results=10')
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if(localStorage.getItem('profielteller') != null && localStorage.getItem('profileteller') != null){
            profileCounter = localStorage.getItem('profielteller');
        }
        else {
            profileCounter = 0;
        }

        for (let i = 0; i < data.results.length; i++){
            let newProfile =  new InfoProfile(data.results[i].picture.large, data.results[i].name.first, data.results[i].dob.age, data.results[i].location.city,data.results[i].location.street, data.results[i].login.uuid);
            
            localStorage.setItem('profile' + profileCounter, JSON.stringify(newProfile));

            coordinates(newProfile.street+ " " + newProfile.location, profileCounter);
            profileCounter++;
             }
        localStorage.setItem('profielteller' ,profileCounter);
    })
    .then(function(){
        runProfile();
    })
    .catch(function(error) {
        console.log(error);
    })
}

if (called == false) {
    called = true;
    localStorage.setItem('called', called);
    window.onload = function (){
        if (navigator.geolocation) {
            if(localStorage.getItem('currentLocation') == null) {
                navigator.geolocation.getCurrentPosition(getLocation);
            }
        }
        else {
            alert('geolocation is not supported in this browser');
        }
        fetchProfile();
}}
else {
    runProfile();
}
function getLocation (position){
    let current = {longitude: '', latitude: ''};
    current.longitude = position.coords.longitude;
    current.latitude = position.coords.latitude;
    localStorage.setItem('currentLocation', JSON.stringify(current));
}

function runProfile (){
    profileCounterhotcold = localStorage.getItem('profilecounterhotcold') != null ? localStorage.getItem('profilecounterhotcold') : 0;
    teller = localStorage.getItem('profileteller') != null ? localStorage.getItem('profileteller') : 0;

    persone =  JSON.parse(localStorage.getItem("profile" + teller));
    
    let youHere = toBeOrNotToBe(persone, teller); 
    currentLocation = JSON.parse(localStorage.getItem('currentLocation'));
    if(currentLocation == null){
        currentLocation = {longitude: 3.670823000014252, latitude: 51.0875347825972};
    }
    if (youHere == false){
        if (profileCounterhotcold <=8){
        let distance = calculateDistance(currentLocation, persone.coordinates);
        tempstr = `
            <div class="Info_Persone" draggable="true">
            <div class='Map_Picture'>
                <div class="Info_Persone_Picture"><img src="${persone.picture}" draggable="false"></div>
                <div id='map' class='map'></div>
            </div>
            <div class='Name_Age'>
                <div class="Info_Persone_Name"> <h1>${persone.name}</h1></div>
                <div class="Info_Persone_Age"><h2>${persone.age}</h2></div>
            </div>
                <div class="Info_Persone_Location">${persone.location}  ${Math.round(distance)}km</div>
            </div>
            <div class="HotOrCold">
                <button class="Hot"><i class="fas fa-fire"></i></button>
                <button class="Cold"><i class="fas fa-snowflake"></i></button>
            </div>`;

        document.querySelector(".Profile").innerHTML = tempstr;
        mapje(persone.coordinates);
        document.querySelector('.Hot').addEventListener('click', function(){
        
            persone.hot = 1;
            localStorage.setItem('profile'+teller, JSON.stringify(persone));
            teller++;
            localStorage.setItem('profileteller', teller);
            profileCounterhotcold++;
            localStorage.setItem('profilecounterhotcold', profileCounterhotcold);
            runProfile();

        })
        document.querySelector('.Cold').addEventListener('click', function(){
            persone.hot = -1;
            localStorage.setItem('profile'+teller, JSON.stringify(persone));
            teller++;
            localStorage.setItem('profileteller', teller);
            profileCounterhotcold++;
            localStorage.setItem('profilecounterhotcold', profileCounterhotcold);
            runProfile();
        })
        document.querySelector('.Info_Persone').addEventListener('dragstart', dragstart, false);
        document.querySelector('.Info_Persone').addEventListener('dragend', dragend, false);

        }

        else { 
            profileCounterhotcold = 0;
            localStorage.setItem('profilecounterhotcold', profileCounterhotcold);
            fetchProfile();
        
        }
    }
    else {
        profileCounterhotcold++;
        localStorage.setItem('profilecounterhotcold', profileCounterhotcold);
        runProfile();
    }
}
document.querySelector('.HotOrNot').addEventListener('click', function(){
    document.querySelector('.HotOrNot').classList.add('active');
    document.querySelector('.Profiles').classList.remove('active');
    viewlist();

});
document.querySelector('.Profiles').addEventListener('click', function(){
    document.querySelector('.HotOrNot').classList.remove('active');
    document.querySelector('.Profiles').classList.add('active');


    runProfile();
})
function mapje (location){
    mapboxgl.accessToken = 'pk.eyJ1IjoibmluYWdlbmkiLCJhIjoiY2pvYTg3Zzd0MGNpcTNrbXJxMmtkNXo2cCJ9.ZQg31fYeJDmLbIf0Xolz-Q';
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [location.longitude, location.latitude],
    zoom: 13
    });
    map.on('load', function(){
        map.addLayer({
            'id': 'locationPerson',
            'type' : 'circle',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [location.longitude, location.latitude],
                    }
                }
            },
            'paint': {
                
                'circle-radius': {
                    'base': 40,
                    'stops': [[4, 28], [8, 80], [18, 34]]
                },
                'circle-color': '#f50625',
                'circle-opacity': 0.5
            }
        })
    });
}

function calculateDistance(currentLocation, locationPerson) {
    let startPoint = turf.point([currentLocation.longitude, currentLocation.latitude]);
    let endPoint = turf.point([locationPerson.longitude, locationPerson.latitude]);
    let distance = turf.distance(startPoint, endPoint);

    return distance;
}

function viewlist (){
    let profileOutStorage = 0;
    let saveProfile = [];
    let hot = "<h1>HOT</h1>";
    let cold ="<h1>COLD</h1>";

    while (localStorage.getItem('profile'+profileOutStorage)!= null){
        saveProfile.push(JSON.parse(localStorage.getItem('profile'+profileOutStorage)));
        profileOutStorage++;
    }
    
    if(saveProfile[0].hot == 0){
        document.querySelector('.Profile').innerHTML= "<h1>You didn't choose yet...</h1>";
    }
    else {
        for(i=0; i< saveProfile.length; i++){

            if(saveProfile[i].hot == 1){
                hot+=`<div class="Lijst">
                        <ul>
                            <li class="image"><img src="${saveProfile[i].picture}"></li>
                            <li class="name"><h1>${saveProfile[i].name}</h1></li>
                            <li class="cold"> <button id="button_${i}" class="Cold_List"><i class="fas fa-snowflake"></i></button></li>
                        </ul>
                    </div>`;
            }
            else if(saveProfile[i].hot == -1){
               cold+= `<div class="Lijst">
                        <ul>
                            <li class="image"><img src="${saveProfile[i].picture}"></li>
                            <li class="name"><h1>${saveProfile[i].name}</h1></li>
                            <li class="hot"><button id="button_${i}" class="Hot_List"><i class="fas fa-fire"></i></button></li>
                        </ul>
                    </div>`;
            }
        }
    }

    document.querySelector('.Profile').innerHTML = hot + cold;
    profileOutStorage = 0;
    for (let i = 0; i < saveProfile.length; i++){
        document.getElementById('button_'+i).addEventListener('click', function (){
            changeChoise(saveProfile[i], i);
           
            viewlist();
        })
    }}
    function changeChoise (profile, i){
        if (profile.hot == -1){
            profile.hot = 1;
        }
        else if (profile.hot == 1){
            profile.hot = -1;
        }
        localStorage.setItem('profile'+i,JSON.stringify(profile));
    }
function toBeOrNotToBe (persone, i){
    let tel = 0
    let profile = '';
    let exists = false;
    do  { 
        profile = JSON.parse(localStorage.getItem('profile' + tel));
        if(profile.id == persone.id){
            exists == true;
            break;
        }
        tel++;
    } while (tel < i);

    return exists;
}
function coordinates(search, profileNumber) {
    let address = encodeURI(search);
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?limit=1&access_token=pk.eyJ1IjoiamFybnZhbnMiLCJhIjoiY2puY2NjOGFoMDV3czNrbnZjNzJicTFvbiJ9.YmULBJZC1OMMVucfXxLliA`;
    fetch(url)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        let coordinates = data.features[0].center;
        let profile = JSON.parse(localStorage.getItem('profile' + profileNumber));
        profile.coordinates.longitude = coordinates[0];
        profile.coordinates.latitude = coordinates[1];
        localStorage.setItem('profile' + profileNumber, JSON.stringify(profile));   
    })
    .catch(function(error){
        console.log(error);
    });
}