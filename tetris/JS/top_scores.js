$(document).ready(()=>{
	let storage = window.localStorage;
	let players_obj = storage.getItem('players');
	players_obj = JSON.parse(players_obj);
	let players = Object.entries(players_obj);
	
	players = players.sort((a,b) => {
		return parseInt(b[1]) - parseInt(a[1])
	});
	if(players == null) return;
	let n = players.length
	if(n > 5) n = 5;
	for(let i = 0;i < n;i++){
		let row = $('<tr></tr>');
		let cell = $(`<td>
			Score:${players[i][1]} User:${players[i][0]}	
					</td>`);
		row.append(cell);
		$('#scores').append(row);
	}
	btn = $(
	"<button>MANUAL</button>"
	)
	$(btn).on('click',() => window.location.href = './tetris-upustvo.html');
	$('#header').prepend(btn);
});
