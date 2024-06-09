var storage = window.localStorage;
function scores(){
	window.location.href = './tetris-rezultati.html'
}
function initStorage(){
	storage['selected'] =JSON.stringify({
		'Z':'null',
		'S':'null',
		'IZ':'null',
		'K':'null',
		'KL':'null',
		'KR':'null',
		'L':'null'
	});
	storage['diff'] = '';
	if(storage.getItem('players') == null) storage.setItem('players',JSON.stringify({}));
}
function play(){
	let cnt = 0;
	let selected = storage['selected'];
	selected = JSON.parse(selected);
	for(let i = 0;i < 7;i++){
		if ($(`#figure${i}`).prop('checked')){
			cnt++;
			console.log(typeof(selected));
			switch(i){
				case 0: selected['Z'] = 'ok';break;
				case 1: selected['S'] = 'ok';break;
				case 2: selected['IZ'] = 'ok';break;
				case 3: selected['K'] = 'ok';break;
				case 4: selected['KL'] = 'ok';break;
				case 5: selected['KR'] = 'ok';break;
				case 6: selected['L'] = 'ok';break;
			}
		}
	}
	if(cnt > 0){
		if($('#checkL').prop('checked')) storage['diff'] = 'L';
		else if ($('#checkS').prop('checked')) storage['diff'] = 'S';
		else if ($('#checkT').prop('checked')) storage['diff'] = 'T';
		storage['selected'] = JSON.stringify(selected);
		window.location.href = './tetris-igra.html';}
	else return;
}
$(document).ready(()=>{
	initStorage();
	let row = $('<tr></tr>');
	for(let i = 0;i < 7;i++){
		let cell = $(`<td>
			<table id = 'NEXT${i}'>
			<tr>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			</tr>
			<tr>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			</tr>
			<tr>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			</tr>
			<div>
			<input type="checkbox" id="figure${i}"
			</div>
			</table>
			</td>`);
		row.append(cell);
	}
	$('#tabela').append(row);
	btn = $(
	"<button>PLAY</button>"
	);
	$(btn).on('click',play);
	$('#tabela').append(btn);
	btn = $(
	"<button>TOP SCORES</button>"
	);
	$(btn).on('click',scores);
	$('#tabela').append(btn);
	new ZShape(2,2,'NEXT0');
	new SquareShape(2,1,'NEXT1');
	new InverseZShape(2,1,'NEXT2');
	new KeysShape(2,1,'NEXT3');
	new KeysLeftShape(2,1,'NEXT4');
	new KeysRightShape(2,1,'NEXT5');
	new LineShape(1,0,'NEXT6');
})
