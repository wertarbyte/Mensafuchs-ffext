function upload() {
    var form = document.getElementById('upload_form');
    form.submit();
}

function loadValues() {
    var offer = window.arguments[0];

    document.getElementById('offer_id').setAttribute('value', offer.id);
    
    document.getElementById('date').setAttribute('value', offer.date);
    document.getElementById('meal').setAttribute('value', offer.mealName);
    document.getElementById('mensa').setAttribute('value', offer.mensaName);
}
