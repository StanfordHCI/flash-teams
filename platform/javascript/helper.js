function pressEnterKeyToSubmit(inputId, buttonId) {
	$(inputId).keyup(function(event){
		if(event.keyCode == 13){
			$(buttonId).click();
		}
	});
}