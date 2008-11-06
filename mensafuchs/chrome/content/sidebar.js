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
    //offer.rate(score, comment, ratingPlaced);
    //confirmationCallback(true, offer, score, comment);
    if (mensaOpened(offer)) {
        window.openDialog("chrome://mensafuchs/content/confirmation-dialog.xul", "Confirm", "chrome", ratingPlaced, offer, score);
    } else {
        alert(strbundle.getString("notServedYet"));
    }
}



/*
// In a perfect world this should work: However, XmlHttpRequest
// does _not_ work from a callback method, so the confirmation
// dialog has to do the rating itself
function confirmationCallback(confirmed, offer, score, comment) {
    if (confirmed) {
        offer.rate(score, comment, ratingPlaced);
    }
}
*/

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
        // list.removeItemAt(0);
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
    // window.openDialog("chrome://mensafuchs/content/upload-dialog.xul", "Confirm", "chrome", offer);
    var url = offer.getUploadUrl();
    openTab(url);
}

/*
function uploadPhoto() {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a File", nsIFilePicker.modeOpen);
    // fp.appendFilters(nsIFilePicker.filterImages);
    // fp.appendFilter("JPEG","*.jpg; *.jpeg");
    
    var res = fp.show();
    if (res == nsIFilePicker.returnOK) {
        var thefile = fp.file;

        var offer = getSelectedOffer();
        offer.uploadPicture( readFile(thefile), uploadSucceeded );
    }
}

function uploadSucceeded() {
    alert("Done!");
}
function readFile(file) {
    // open the local file
    stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
            .createInstance(Components.interfaces.nsIFileInputStream);
    stream.init(file,       0x01, 00004, null);
    var bstream =  Components.classes["@mozilla.org/network/buffered-input-stream;1"]
            .getService();
    bstream.QueryInterface(Components.interfaces.nsIBufferedInputStream);
    bstream.init(stream, 1000);
    bstream.QueryInterface(Components.interfaces.nsIInputStream);
    binary = Components.classes["@mozilla.org/binaryinputstream;1"]
            .createInstance(Components.interfaces.nsIBinaryInputStream);
    binary.setInputStream (stream);
    var data = binary.readBytes(binary.available());
    alert(data.length+" bytes read");
    return data;
}
*/

function toggleSettings() {
    var panel = document.getElementById("mensaPanel");
    if (panel.getAttribute("hidden") == "true") {
        panel.setAttribute("hidden", false);
    } else {
        panel.setAttribute("hidden", true);
    }
}
