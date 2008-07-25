// functions for confirmation dialog

function done(confirmed) {
    var strbundle=document.getElementById("strings");
    
    var cb = window.arguments[0];
    var offer = window.arguments[1];
    var score = window.arguments[2];

    var comment = document.getElementById('comment').value;

    if (confirmed) {
        offer.rate(score, comment);
        var text = strbundle.getString("ratingSucceeded");
        alert(text);
    } else {
        var text = strbundle.getString("ratingAborted");
        alert(text);
    }
    // See http://www.captain.at/howto-ajax-parent-opener-window-close-error.php
    // and http://groups.google.com/group/comp.lang.javascript/browse_thread/thread/5b414aa1550a7698/1e85eec1cd76e45a
    // https://bugzilla.mozilla.org/show_bug.cgi?query_format=specific&order=relevance+desc&bug_status=__open__&id=168128
    // WTF?!
    // cb(confirmed, offer, score, comment);
    cb();
}

function loadValues() {
    var cb = window.arguments[0];
    var offer = window.arguments[1];
    var score = window.arguments[2];

    document.getElementById('score').setAttribute('value', score);
    document.getElementById('meal').setAttribute('value', offer.mealName);
    document.getElementById('mensa').setAttribute('value', offer.mensaName);
}
