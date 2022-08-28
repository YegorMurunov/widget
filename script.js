const isMobile = {
	Android: function () {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function () {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function () {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function () {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function () {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function () {
		return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
	},
};

document.addEventListener('DOMContentLoaded', () => {
	const widget = document.querySelector('.video-widget');
	const video = widget.querySelector('#video-widget__video');
	let lastTime = 0;

	widget.onclick = (e) => {
		return widget.getAttribute('data-state') == 'default' ? openWidget() : closeWidget();
	}

	widget.querySelector(".video-widget__close").onclick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		return !widget.getAttribute('data-state') == 'default' ? widget.remove() : closeWidget();
	}

	widget.querySelector(".video-widget__button").onclick = (e) => {
		if ( widget.getAttribute('data-state') == 'opened' ) {
			e.stopPropagation();
		}
	}

	document.onclick = (e) => {
		// если клик вне виджета, то закрываем виджет
		if ( !e.target.closest(`.${widget.className.split(' ')[0]}`) ) { // если вдруг у виджета сраз 2 класса "video-widget video-widget2" то мы берем первый
			closeWidget();
		}
	}


	// работа с тач.устройствами
	if ( isMobile.any() ) {

		// отключаем события при клике
		widget.onclick = null;
		widget.querySelector(".video-widget__close").onclick = null;
		widget.querySelector(".video-widget__button").onclick = null;

		widget.querySelector(".video-widget__close").ontouchstart = (e) => {
			e.preventDefault();
			e.stopPropagation();
			return !widget.getAttribute('data-state') == 'default' ? widget.remove() : closeWidget();
		}

		widget.querySelector(".video-widget__button").ontouchstart = (e) => {
			if ( widget.getAttribute('data-state') == 'opened' ) {
				e.stopPropagation();
			}
		}
	}


	function closeWidget() {
		lastTime = video.currentTime;
		widget.setAttribute("data-state", "default");
		video.muted = true;
	}
	function openWidget() {
		video.currentTime = lastTime;
		widget.setAttribute("data-state", "opened");
		video.muted = false;
	}


	// функция перетягивания
	let opened = false;

	dragElement(widget); //.querySelector('.video-widget__container')
	function dragElement(elmnt) {
		var pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0;

		if (isMobile.any()) { // если тач скрин
			elmnt.ontouchstart = (e) => {

				let x1 = e.touches[0].clientX;
				let y1 = e.touches[0].clientY;
				const touchStart = {
					x: x1,
					y: y1
				};
				const touchPosition = {
					x: x1,
					y: y1
				}
				dragMouseDown(e, x1, y1);

				function dragMouseDown(e, x1, y1) {
					if (widget.getAttribute("data-state") == "opened") {
						opened = true;
					} else {
						opened = false;
					}
					/* // get the mouse cursor position at startup: */
					pos3 = e.touches[0].clientX;
					pos4 = e.touches[0].clientY;
					/* // call a function whenever the cursor moves: */
					document.ontouchend = (e) => {
						document.ontouchend = null;
						document.ontouchmove = null;
						if ( touchStart.x == touchPosition.x && touchStart.y == touchPosition.y ) {
							opened ? closeWidget() : (e.preventDefault(), openWidget());
						}
						return;
					};
					document.ontouchmove = (e) => {
						elementDrag(e);
					};
				}

				function elementDrag(e) {
					 e = e || window.event; 
					/* // calculate the new cursor position: */
					pos1 = pos3 - e.touches[0].clientX;
					pos2 = pos4 - e.touches[0].clientY;
					pos3 = e.touches[0].clientX;
					pos4 = e.touches[0].clientY;

					touchPosition.x = pos1;
					touchPosition.y = pos2

					/* // set the element's new position: */
					elmnt.style.top = elmnt.offsetTop - pos2 + "px";
					elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
				}
			};
		} else { // если пк
			elmnt.onmousedown = (e) => {
				let x1 = e.clientX;
				let y1 = e.clientY;
				dragMouseDown(e, x1, y1);
			};

			function dragMouseDown(e, x1, y1) {
				widget.getAttribute("data-state") == "opened" ? opened = true : opened = false;

				e = e || window.event;
				// get the mouse cursor position at startup:
				pos3 = e.clientX;
				pos4 = e.clientY;
				// call a function whenever the cursor moves:
				document.onmouseup = (e) => {
					let x2 = e.clientX;
					let y2 = e.clientY;
					if (x1 === x2 && y1 === y2) {
						document.onmouseup = null;
						document.onmousemove = null;
						return;
					} else {
						closeDragElement();
					}
				};
				document.onmousemove = (e) => {
					elementDrag(e);
				};
			}

			function elementDrag(e) {
				e = e || window.event;
				// calculate the new cursor position:
				pos1 = pos3 - e.clientX;
				pos2 = pos4 - e.clientY;
				pos3 = e.clientX;
				pos4 = e.clientY;
				// set the element's new position:
				elmnt.style.top = elmnt.offsetTop - pos2 + "px";
				elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
			}

			function closeDragElement(e) {
				/* stop moving when mouse button is released:*/
				document.onmouseup = null;
				document.onmousemove = null;
				setTimeout(() => {
					if (opened) {
						openWidget();
					} else {
						closeWidget();
					}
				}, 0);
			}
		}
	}

});