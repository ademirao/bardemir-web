var COLOR_PALLETE = new function () {
  this.paletes = [
   // Default
   ["#781c81","#43328d","#416fb8","#519cb8","#70b484","#99bd5c","#c3ba45","#e0a239","#e66b2d","#d92120"],
   // Red Blindness
   ["#242487","#c5c5ec","#a1a198","#707032","#989832","#cdcd76","#282808","#767677","#393955","#565698"],
   // Green Blindness
   ["#272785","#b7b7ea","#919197","#636335","#959531","#cdcd73","#3a3a00","#8a8a71","#505051","#6c6c94"],
  ];
  this.selected = 0;
};
COLOR_PALLETE.nextPalete= function() {
  this.selected = (++this.selected) % this.paletes.length;
  console.log(this.selected);
};
COLOR_PALLETE.getPalete = function() {
  return this.paletes[this.selected];
}

function color(i) {
  var palete = COLOR_PALLETE.getPalete();
  return palete[i%palete.length];
}


