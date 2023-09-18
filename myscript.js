// shooting game 

// randomly appearing targets
// moving targets
// 5 shots before reloading
// 1 minute countown for each level


// vars
let img_src         = 'morhoon1.gif';
let img_size        = 140;
let set_timer       = 15;                                     // duration of the game in seconds
let width           = 900;
let height          = 900;
let smallSizeChance = 0.5;
let difficulty      = 5;                                      // 1 - 9, bigger = harder
let avg_targets     = 7 + difficulty;                                      // average targets count - difficulty
let playground      = document.querySelector('#playground');
let timer           = document.querySelector('#timer');
let points          = document.querySelector('#points');
let stats           = document.querySelector('.stats')
let audio           = document.querySelector('.shoot');
let shells          = 6;
let empty_sound     = document.querySelector('.empty')

let WAIT_FOR_BEGIN=0
let WAIT_FOR_START_BUTTON=1
let WAIT_FOR_SPAWN=2
let WAIT_FOR_SHOOT=3
let WAIT_FOR_END=4

let hit_count=0
let miss_count=0
resultJSON ={"hit":0, "miss":0, "failure_distances":[], "mouse_log":[]};


localStorage.setItem('total', 0);

function setGameState(gameSt) {
    localStorage.setItem('gameState', gameSt);
	console.log("State is:"+gameSt)
	return gameSt
}

function getState() {
    if (localStorage.getItem('gameState')) {
        return localStorage.getItem('gameState');
    }
}

let gameState=setGameState(WAIT_FOR_BEGIN)
let mouseMovementArray=[]
let shootMouseHitPositionEntityArray=[]
let shootMouseMissPositionArray=[]
let lastShoot=[0,0]
let generatedChickens=0

// Initialization=================================
function startGame() {
	console.log(getState())
	if(getState()==WAIT_FOR_BEGIN)
	{
		hit_count=0;
		window.focus();
		countdown();
		onmousemove = function(e){mouseMovementArray.push({'x':e.clientX,'y': e.clientY,'idx':generatedChickens})}
		setGameState(WAIT_FOR_SPAWN)
		targetInterval();

		document.querySelector('#start').style.display = 'none';
		playground.addEventListener('mousedown', function(e) {
			console.log("shoot fct")
			console.log(getState())
			
			if(getState()==WAIT_FOR_SHOOT){
				shoot(e);
			}
			
		});
		ammoReloader();
	}else{
		onmousemove = function(e){mouseMovementArray.push({'x':e.clientX,'y': e.clientY,'idx':generatedChickens})}
		if(getState()==WAIT_FOR_START_BUTTON){
			setGameState(WAIT_FOR_SPAWN)
			console.log(getState())
			document.querySelector('#start').style.display = 'none';
		}
	
	}
	generatedChickens++
}
// Initialization=================================




function shoot(e) {
	if(e.which === 3) {
		e.preventDefault;
		return false;
	}
	lastShoot=[e.screenX,e.screenY]
    let shells = document.querySelectorAll('.shell.visible');
    if(shells.length > 0) {
        shells[0].classList = 'shell hidden';

		shootSound();

        
		if (shells.length<=1){
			reloadAmmo();
		}

    } else {
        // empty sound
        empty_sound.currentTime = 0;
        empty_sound.play();
    }

}


function hitTarget(e) {
    if(e.which === 3) {
		e.preventDefault;
		return false;
	}
    // check if there is ammo
    let shells = document.querySelectorAll('.shell.visible');
    if(shells.length > 0) {
		let target_id = e.target.getAttribute('data-id');
		let size = e.target.width;
		addPoints(size);
		hitEffect(e, target_id);    
		
    }
}

function reloadAmmo() {
	let shells = document.querySelectorAll('img.shell');

	// show shells
	shells.forEach(function(shell) {
		shell.classList.remove('hidden');
		shell.classList.add('visible');
	});

	// substract total
    localStorage.total = localStorage.total - 10;
    if(localStorage.total < 0) {
        localStorage.total = 0;
    }
	points.innerHTML = localStorage.total;

	// play reload sound
	document.querySelector('#reload').currentTime = 0;
	document.querySelector('#reload').play();
}

function ammoReloader() {
	playground.addEventListener('mousedown', function(e) {
		e.preventDefault();
		if(e.which <= 4) {
			reloadAmmo();
		}
		
		if (getState()==WAIT_FOR_SHOOT){
			miss_count+=1
			shootMouseMissPositionArray.push([lastShoot[0],lastShoot[1]])
		}
		
	});

	playground.addEventListener('contextmenu', function(e) {
		e.preventDefault();
	});

}


// visual effect target hit
function hitEffect(e, target_id) {
        removeTarget(e, target_id); 
		document.querySelector('#start').style.display = 'block';
		document.querySelector('#start').style.position = 'absolute';
		document.querySelector('#start').style.top = "100px";
		document.querySelector('#start').style.left = "410px";
}


//add points
function addPoints(size) {

    if(size === 80) {
        localStorage.total = parseInt(localStorage.total) + 10
    } else {
        localStorage.total = parseInt(localStorage.total) + 5
    }

    points.innerHTML = localStorage.total;

}

// Countdown timer
function countdown() {
    
    // window.onload = function() {
        setInterval(function() {
            set_timer--;
            timer.innerHTML = set_timer;

            if(set_timer === 0) {
                endGame();
            }

        }, 1000);   
    // }
}

// Hide target
function removeTarget(e,target_id) {
    let target_remove = document.querySelector('[data-id="' + target_id + '"]');
	console.log(target_remove)
	console.log(e)
	//var w = window.innerWidth;
	//var h = window.innerHeight;
	//console.log(""+target_remove.offsetLeft+";"+target_remove.offsetTop + " Compare " + e.screenX + ";" + e.screenY)
	shootMouseHitPositionEntityArray.push({"type":"measureEntity","position":[e.screenX,e.screenY],"missed_shot_positions":shootMouseMissPositionArray.slice()})
	shootMouseMissPositionArray=[]
	
	setGameState(WAIT_FOR_START_BUTTON)
    // setTimeout(function() {
        target_remove.remove();
    // }, 500);
}



// Show target on a random place
function addTarget() {

    let target_id = Date.now() + Math.floor(Math.random() * 100) + 1;
    let elevation;
    let start_from;

    //create target
    let target = document.createElement('img');
    target.setAttribute('src', img_src);
    target.setAttribute('data-id', target_id);
    target.classList = 'target';
    target.style.maxWidth = img_size + 'px';
    target.style.maxHeight = img_size + 'px';

    target.addEventListener('mousedown', function(e) {
		hit_count+=1
		onmousemove = function(e){}
        hitTarget(e);
    });


    // Set elevation
    elevation  = Math.random() * (height - 300);
    target.style.top = elevation + 'px';

    // Place target at starting position
    if(Math.random() > 0.5) {
        // Fly in from left
        start_from = 'left';
        target.style.left = '+150px';
        target.style.transform = 'scaleX(-1)';

    } else {
        start_from = 'right';
        // fly in from right
        target.style.right = '+150px';
    }

    // Set size
    if(Math.random() > smallSizeChance) {
        // Set small size
        target.style.width = '80px';
        target.style.height = '80px';
    } 

    playground.append(target)


    // Move target
    let speed          = 12 - difficulty;                  // miliseconds interval
    let index          = 0;
    let breaking_point = Math.floor(Math.random() * 900);

    if(Math.random() > 0.5) {
        var vertical = 'asc';
    } else {
        var vertical = 'desc';
    }

     /*  setInterval(function() {
        
        // Set left or right offset and change it for each interval
        if(start_from == 'left') {
            let old_position = target.style.left;
            let old_px = old_position.slice(0,-2);
            let new_px = parseInt(old_px) + 1;
			if (new_px <=800){
				target.style.left = new_px + 'px';
			}
            

        } else {
            let old_position = target.style.right;
            let old_px = old_position.slice(0,-2);
            let new_px = parseInt(old_px) + 1;
			if (new_px <=800){
				target.style.right = new_px + 'px';
			}
        }



        // Break point for change in asceding or descending
        if(index == breaking_point) {

            if(vertical == 'asc') {
                vertical = 'desc';
            } else {
                vertical = 'asc';
            }
        }




        // Change elevation
        index++;
        let old_elevation = target.style.top.slice(0,-2);

        if(index % 10 === 0) {
            if(vertical == 'asc') {
                target.style.top = parseFloat(old_elevation) - 1 + 'px';
                
            } else {
                target.style.top = parseFloat(old_elevation) + 1 + 'px';
            }
        }

        
        
        
        // Remove target when off playground
        if(parseInt(target.style.left.slice(0,-2)) > 900 || parseInt(target.style.right.slice(0,-2)) > 900) {
            target.remove();
			setGameState(WAIT_FOR_START_BUTTON)
        }
    }, speed);*/






   
}


// Add targets at regular interval
function targetInterval() {
    // Regularly add targets
    showTargetsRegularly = setInterval(function() {
		if (getState() == WAIT_FOR_SPAWN){
			setGameState(WAIT_FOR_SHOOT)
			addTarget();
		}
    }, 10)

}





//TODO miss funktiniert noch nicht


// Endgame
function endGame() {
	onmousemove = function(e){}
	resultJSON.hit = hit_count
	resultJSON.miss = miss_count
	resultJSON.mouse_log = mouseMovementArray
	
	let failureDistanceArray=[]

	for(let recordIdx = 0; recordIdx < shootMouseHitPositionEntityArray.length; recordIdx++){
		console.log()
		for(let missIdx=0; missIdx < shootMouseHitPositionEntityArray[recordIdx]["missed_shot_positions"].length;missIdx++){
			let p_x = shootMouseHitPositionEntityArray[recordIdx]["position"][0]
			let p_y = shootMouseHitPositionEntityArray[recordIdx]["position"][1]
			let m_x = shootMouseHitPositionEntityArray[recordIdx]["missed_shot_positions"][missIdx][0]
			let m_y = shootMouseHitPositionEntityArray[recordIdx]["missed_shot_positions"][missIdx][1]
			console.log("p_x:"+p_x + ";" + "p_y:"+p_y + ";" + "m_x:"+m_x + ";" + "m_y:"+m_y + ";" )
			failureDistanceArray.push(Math.sqrt(Math.pow(p_x - m_x,2)+Math.pow(p_y - m_y,2)))
		}
	}
	if (failureDistanceArray.length>0){
		resultJSON.failure_distances=(failureDistanceArray.slice().reduce((a, b) => a + b, 0) / failureDistanceArray.length)
	}else{
		resultJSON.failure_distances=0
	}
	
	
	
	console.log(JSON.stringify(resultJSON)) //TODO write to file instead
	
	
    // Remove all 
    let targets = document.querySelectorAll('.target');

    targets.forEach(function(target) {
        target.remove();
    });

    // Cancel interval for showing targets
    clearInterval(showTargetsRegularly);

    // show stats
    stats.setAttribute('style', 'display: block');

    document.querySelector('.points').remove();
    timer.remove();
    document.querySelector('#final-total').innerHTML = points.innerHTML;
    
    // Record highest score
    if(localStorage.getItem('highest') === null) {
        localStorage.setItem('highest', localStorage.total)
 
    } else if (parseInt(localStorage.total) > parseInt(localStorage.highest)) {
        localStorage.highest = localStorage.total;
    }

    document.querySelector('#highest').innerHTML = localStorage.highest;

}

function restart() {
    location.reload();
}

function shootSound() {
    audio.currentTime = 0;
    audio.play();
}


////////////////////////////////////////////
// Event listeners

document.querySelector('#restart').addEventListener('click', restart);
document.querySelector('#start').addEventListener('click', startGame);



