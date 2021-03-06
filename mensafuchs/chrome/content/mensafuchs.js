function getFirstElementByClass(node, searchClass) {
    var els = node.getElementsByTagName("*");
    var elsLen = els.length;
    // var pattern = new RegExp("\b"+searchClass+"\b");
    var pattern = new RegExp(searchClass);
    for (i = 0; i < elsLen; i++) {
        if ( pattern.test(els[i].className) ) {
            return els[i];
        }
    }
    return null;
}

function MensaMenuRequest(date, menuCallback) {
    this.http_request = new XMLHttpRequest();

    this.menuCallback = menuCallback;
    this.url = 'http://mensafuchs.de/csv/client-mensafuchs/'+date;

    var me = this;

    this.http_request.onreadystatechange = function() {
        if (me.http_request.readyState == 4) {
            if (me.http_request.status == 200) {
                var data = me.http_request.responseText;
                if (me.menuCallback) {
                    me.menuCallback(data);
                }
            }
        }
    };

    this.issueRequest = function () {
        me.http_request.open('GET', me.url, true);
        me.http_request.send(null);
    };
}

function MensaRatingRequest(ratingCallback, offerId) {
    this.http_request = new XMLHttpRequest();
    this.offerId = offerId;
    this.ratingCallback = ratingCallback;

    var me = this;

    this.http_request.onreadystatechange = function () {
        var http = me.http_request;
        if (http.readyState == 4) {
            if (http.status == 200) {
                if (me.ratingCallback) {
                    me.ratingCallback();
                }
            }
        }
    };

    this.placeRating = function (score, comment) {
        var url = "http://mensafuchs.de/ratingHandler.pl?tool=ffext&score-"+me.offerId+"="+score+"&comment="+escape(comment);
        me.http_request.open('GET', url, true);
        me.http_request.send(null);
    };
}

function getIcon(name) {
    var pic = document.createElement("image");
    pic.setAttribute("width", "24");
    pic.setAttribute("height", "24");
    pic.setAttribute("class", "groupicon");
    pic.setAttribute("src", "chrome://mensafuchs/skin/"+name);
    return pic;
}

function MensaOffer(line) {
    var fields = line.split(";");

    this.id = fields[0];
    this.date = fields[1];
    this.mensaId = fields[2];
    this.mensaShortname = fields[3];
    this.mensaName = fields[4];
    this.mealId = fields[5];
    this.mealName = fields[6];
    this.mealVegetarian = (fields[7] == '1') ? true : false;
    if (fields[9] != "") {
        this.pictureIds = fields[9].split(',');
    } else {
        this.pictureIds = new Array();
    }
    this.averageRating = fields[10];
    this.numberOfVotes = fields[11];
    this.newMeal = fields[12];
    if (fields[13] != "") {
        this.groups = fields[13].split(',');
    } else {
        this.groups = new Array();
    }

    var me = this;

    this.rate = function (score, comment, callback) {
        var rate = new MensaRatingRequest(callback, me.id);
        rate.placeRating(score, comment);
    };
    
    this.getUploadUrl = function () {
        return "http://mensafuchs.de/upload-"+me.id;
    };

    this.getDetailsUrl = function () {
        return "http://mensafuchs.de/offer-"+me.id;
    };

    this.getPictureUrls = function (small) {
        var urls = new Array();
        for (i = 0; i < me.pictureIds.length; i++) {
            urls[i] = "http://mensafuchs.de/picture-"+(small?"small-":"")+me.pictureIds[i];
        }
        return urls;
    };
    
    this.getListItem = function (withPicture) {
        var strbundle = document.getElementById("strings");
        var template = document.getElementById("offertemplate");

        var node = template.cloneNode(true);
        node.setAttribute('value', me.id);
        node.offer = me;

        var mensa = getFirstElementByClass(node, "mensaName");
        if (mensa) {
            mensa.setAttribute('value', me.mensaName);
        }
        var meal = getFirstElementByClass(node, "mealName");
        if (meal) {
            // meal.setAttribute('value', me.mealName);
            meal.appendChild( document.createTextNode(me.mealName) );
        }

        var votesString = strbundle.getString("votesReceived"+ ( (me.numberOfVotes==1) ? "Singular" : "Plural" ));
        var votes = getFirstElementByClass(node, "votes");
        if (votes) {
            votes.setAttribute('value', me.numberOfVotes+" "+votesString);
        }

        var bar = getFirstElementByClass(node, "ratingbar");
        if (bar) {
            bar.setAttribute('value', ((me.averageRating/5)*100)+"%");
        }

        var img = getFirstElementByClass(node, "mealPicture");
        if (withPicture && img) {
            if (me.pictureIds.length > 0) {
                img.setAttribute('class', "mealPhoto mealPicture");
                var urls = me.getPictureUrls(true);
                var rnd = Math.floor(Math.random()*urls.length);
                img.setAttribute('src', urls[rnd]);
            }
        }
        // insert icons
        var iconbox = getFirstElementByClass(node, "iconbox");
        // remove everything
        // we don't need this
        /*
        while (iconbox != null && iconbox.hasChildNodes()) {
            iconbox.removeChild(iconbox.firstChild());
        }
        */

        for (var i=0; i < me.groups.length; i++) {
            var group = me.groups[i];
            var iname = "";
            switch(group) {
                case "Fisch": iname = "fish-icon.png"; break;
                case "Rind": iname = "beef-icon.png"; break;
                case "Schwein": iname = "pork-icon.png"; break;
                case "Vegetarisch": iname = "veg-icon.png"; break;
                case "Wild": iname = "game-icon.png"; break;
                case "Gefl"+String.fromCharCode(252)+"gel": iname = "chicken-icon.png"; break;
                case "Lamm": iname = "sheep-icon.png"; break;
            }
            if (iname != "") {
               var icon = getIcon(iname);
               iconbox.appendChild(icon);
            }
        }
        if (me.newMeal == "1") {
            var newIcon = getIcon("new-icon.png");
            iconbox.appendChild(newIcon);
        }

        return node;
    };
}

