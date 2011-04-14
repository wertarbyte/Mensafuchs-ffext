function showDetailsPage() {
    var offer = getSelectedOffer();
    var url = offer.getDetailsUrl();
    openTab(url);
}

function getSelectedOffer() {
    var list = document.getElementById("offerlist");
    var item = list.selectedItem;
    return item.offer;
}

function parseDate(dateStr) {
    var parts = dateStr.split('-');
    var myDate = new Date(parts[0], parts[1]-1, parts[2]);
    return myDate;
}

function mensaOpened(offer) {
    var oDate = parseDate( offer.date );
    oDate.setHours(11);
    oDate.setMinutes(15);
    var now = new Date();
    return ( now.getTime() >= oDate.getTime() );
}

function rateOffer(score) {
    var strbundle=document.getElementById("strings");

    var offer = getSelectedOffer();
    var comment = "";
    if (mensaOpened(offer)) {
        window.openDialog("chrome://mensafuchs/content/confirmation-dialog.xul", "Confirm", "chrome", ratingPlaced, offer, score);
    } else {
        alert(strbundle.getString("notServedYet"));
    }
}

function statusbarIconClicked(ev) {
    if (ev.button == 0) {
        toggleMensafuchs();
    }
}

function ratingPlaced() {
    // Since accessing the XmlHttpRequest directly from the callback method
    // crashes the script, we have to trigger the button - WTF?
    var btn = document.getElementById("refreshBtn");
    btn.click();
    // updateMenu();
}

function toggleMensafuchs() {
    toggleSidebar('viewMensaSidebar');
}

function clearList(list) {
    var n = list.getRowCount();
    for (var i=0; i < n; i++) {
        var node = list.getItemAtIndex(0);
        list.removeChild(node);
    }
}

function menuReceived(data) {
    var lines = data.split("\n");
    
    var list = document.getElementById('offerlist');
    var odate = document.getElementById('offerdate');

    clearList(list);
    for (var i=0; i < lines.length; i++) {
        var offer = new MensaOffer(lines[i]);
        var photoCheckbox = document.getElementById('loadPictures');
        // enable back/forward button
        var prevBtn = document.getElementById('prevDay');
        prevBtn.setAttribute("disabled", false);
        var nextBtn = document.getElementById('nextDay');
        nextBtn.setAttribute("disabled", false);
        odate.setAttribute("value", offer.date);

        var mensaCheckbox = document.getElementById('showMensa-'+offer.mensaId);
        // Check if we want to display the mensa
        if ( mensaCheckbox != null && mensaCheckbox.getAttribute("checked") == "true" ) {
            // var item = createNewItem(lines[i]);

            var item = offer.getListItem( (photoCheckbox.getAttribute("checked") == "true") );
            list.appendChild( item );
            list.clearSelection();
        }
    }
}

function updateMenu() {
    var list = document.getElementById('offerlist');
    clearList(list);
    var time = "next";
    if (document.getElementById('offerdate').value != '') {
        time = document.getElementById('offerdate').value;
    }
    var request = new MensaMenuRequest(time, menuReceived);
    request.issueRequest();
}

function openTab(url) {
        const windowMediatorIID = Components.interfaces.nsIWindowMediator;
        const windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(windowMediatorIID);
        
        // add a new tab and open item link
        var topWin = windowMediator.getMostRecentWindow("navigator:browser");
        var browser = topWin.getBrowser();
        browser.selectedTab = browser.addTab(url);
}

function getDate() {
    var dateStr = document.getElementById('offerdate').value;
    var parts = dateStr.split('-');
    var myDate = new Date(parts[0], parts[1]-1, parts[2]);
    return myDate;
}

function fillString(str, length) {
    // convert it to string
    var newString = str+"";
    while (newString.length < length) {
        newString = "0"+newString;
    }
    return newString;
}

function formatDate(dateObj) {
    var year = dateObj.getFullYear();
    var month = dateObj.getMonth()+1;
    var day = dateObj.getDate();
    var str = year+"-"+fillString(month,2)+"-"+fillString(day, 2);
    return str;
}

function addDay(dateObj, days) {
    // create a copy of the date object
    var newDate = new Date();
    var timespan = days * 24 * 60 * 60 * 1000;
    newDate.setTime(dateObj.getTime() + timespan);
    return newDate;
}

function changeDay(days) {
    var odate = document.getElementById('offerdate');
    var list = document.getElementById('offerlist');
    clearList(list);
    var date = getDate();
    var cDate = addDay(date, days);
    var skipWeekends = (document.getElementById("skipWeekends").getAttribute("checked") == "true");
    while (skipWeekends && (cDate.getDay() == 0 || cDate.getDay() == 6)) {
        cDate = addDay(cDate, days);
    }
    odate.setAttribute("value", formatDate(cDate));
    var request = new MensaMenuRequest(formatDate(cDate), menuReceived);
    request.issueRequest();
}

function uploadPhoto() {
    var offer = getSelectedOffer();
    var url = offer.getUploadUrl();
    openTab(url);
}

function toggleSettings() {
    var panel = document.getElementById("mensaPanel");
    if (panel.getAttribute("hidden") == "true") {
        panel.setAttribute("hidden", false);
    } else {
        panel.setAttribute("hidden", true);
    }
}
