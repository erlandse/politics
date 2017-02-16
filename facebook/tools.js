function addOption(elSel,text,value){
  var elOptNew = document.createElement('option');
  elOptNew.text = text;
  elOptNew.value = value;
  try {
    elSel.options.add(elOptNew, null); // standards compliant; doesn't work in IE
  }
  catch(ex) {
    elSel.options.add(elOptNew); // IE only
  }
}

function removeOptionSelected(selectId)
{
  var elSel = document.getElementById(selectId);
  var i;
  for (i = elSel.length - 1; i>=0; i--) {
    if (elSel.options[i].selected) {
      elSel.remove(i);
    }
  }
}

function removeAllOptions(selectId){
 var elSel = document.getElementById(selectId);
 while(elSel.length > 0)
      elSel.remove(elSel.length-1);
}

function selectAllOptions(selectId){
 var sel = document.getElementById(selectId);
 for(var temp = 0; temp < sel.length;temp++)
    sel.options[temp].selected = true;
}





