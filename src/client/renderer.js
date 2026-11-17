
const exitBtn = document.getElementById("exitBtn");

exitBtn.addEventListener('click', (e) => {
	let secondGuess = confirm("Are you sure you wanna exit?");
	if (secondGuess)
		window.close();
});
