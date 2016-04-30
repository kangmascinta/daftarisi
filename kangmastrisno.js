/*
 
 */

var cl_summlen = jumlah_kata_dalam_ringkasan;
var all_entries; var entries; var all_labels = []; var json;

function createEntries(json){
    var entries_obj_list = [];
    var entries = json.feed.entry;
    for(var i=0; i<entries.length; i++){
        var entry           = entries[i];
        var entry_obj       = new Object;
        entry_obj.id        = entry.id.$t;
        entry_obj.title     = entry.title.$t;
        entry_obj.href      = getEntryHref(entry);
        entry_obj.content   = getEntryContent(entry);
        entry_obj.labels    = getEntryLabels(entry);
        entry_obj.published = entry.published.$t.substr(0, 10);
        entries_obj_list.push(entry_obj);
    }
    return entries_obj_list;
}
function getEntryById(id){
    for(var i=0; i<all_entries.length; i++){
        if(all_entries[i].id == id){return all_entries[i];}
    } return null;
}
function getEntryContent(entry){
    return entry.content ? entry.content.$t : entry.summary.$t;
}
function getEntryHref(entry){
    var links = entry.link;
    for(var i=0; i<links.length; i++){
        if(links[i].rel == "alternate"){return links[i].href;}
    }
    return null;
}
function getEntryLabels(entry){
    var labels     = [];
    var categories = entry.category;
    if(!categories){return labels;}
    for(var i=0; i<categories.length; i++){
        var label = categories[i].term;        
        if(!isExists(all_labels, label)){all_labels.push(label);} // while collecting all labels
        labels.push(label);
    }
    return labels;
}
function getSomeEntries(cmp){
    entries = [];
    for(var i=0; i<all_entries.length; i++){
        var entry = all_entries[i];
        if(cmp(entry)){entries.push(entry);}
    }
    return entries;
}
function isExists(array, val){
    for(var i=0; i<array.length; i++){
        if(array[i] == val){return true;}
    } return false;
}
function onLoadFeed(json_arg){
    json = json_arg;
    setTimeout("onLoadFeedTimeout()", 10);
}
function onLoadFeedTimeout(){
    entries = createEntries(json);
    all_entries = entries;
    showHeaderOption();
    showEntries(entries);
}
function showEntries(entries){
    var s = "";
    for(var i=0; i<entries.length; i++){
        var entry = entries[i];
        s += "<p>";
        s += titleCode(entry);
        s += "<span style='font-size:80%'>Label: " + labelsCode(entry);
        s += " pada " + publishedDateCode(entry) + "</span>";
        s += "</p>";
    }
  
    document.getElementById("cl_content_list").innerHTML = s;
}
function showHeaderOption(){
    var s = "";
    s += "<table>";
    s += "<tr>";
    s += "<td style='text-align:right'>Urut berdasar: ";
    s += "<td><select onchange='sortBy(this.value.substr(1), this.value.substr(0,1))'>";
    s += "<option value='0published'/>Tanggal";
    s += "<option value='1title'/>Judul";
    s += "</select>";
    s += "<tr>";
    s += "<td style='text-align:right'>Label: ";
    s += "<td><select onchange='showPostsWLabel(this.value)' id='cl_labels'>";
    s += "<option value='*'/>Semua label";
    for(var i=0; i<all_labels.length; i++){
        var label = all_labels[i];
        s += "<option value='"+label+"'/>" + label;
    }
    s += "</select>";
    s += "<tr>";
    s += "<td><td><a href='javascript:showPostsWLabel(\"*\");'>Lihat semua label</a>";
    s += "</table>";
    document.getElementById("cl_option").innerHTML = s;
}
function shortenContent(entry){
    var content = entry.content;
    content = stripHTML(content);
    if(content.length > cl_summlen){
        content = content.substr(0, cl_summlen);
        if(content.charAt(content.length-1) != " "){content = content.substr(0, content.lastIndexOf(" ")+1);}
        content += "...";
    }
    entry.content = content;
    return content;
}
function showHideSummary(obj){
    var p = obj.nextSibling;
    while(p.className != "cl_content"){p = p.nextSibling;}
    var id = p.id;
    var entry = getEntryById(id);
    var content = shortenContent(entry);
    if(p.innerHTML == ""){
        p.innerHTML = content + "<br/>";
        obj.innerHTML = "▼";
        obj.title = "sembunyikan ringkasan";
    } else {
        p.innerHTML = "";
        obj.innerHTML = "►";
        obj.title = "lihat ringkasan";
    }
}
function sortBy(attribute, asc){
    var cmp = function(entry1, entry2){
        if(entry1[attribute] == entry2[attribute]){return 0;}
        else if(asc=='1'){return entry1[attribute].toLowerCase() > entry2[attribute].toLowerCase();}
        else{return entry1[attribute].toLowerCase() < entry2[attribute].toLowerCase();}
    }
    entries.sort(cmp);
    showEntries(entries);
}
function stripHTML(s) {
    var c;
    var intag = false; var newstr = "";
    for(var i=0; i<s.length; i++){
        c = s.charAt(i);
        if(c=="<"){intag = true;}
        else if(c==">"){intag = false;}
        if(c == ">"){newstr += " ";}
        else if(!intag){newstr += c;}
    }
    return newstr;
}

// --------------------- functions returning HTML code -------------------- \\
function labelsCode(entry){
    var s = "";
    if(entry.labels.length == 0){return " (tidak berlabel) ";}
    for(var j=0; j<entry.labels.length; j++){
        var label = entry.labels[j];
        s += "<a href='javascript:showPostsWLabel(\""+label+"\")' ";
        s += "title='lihat semua post dengan label \""+label+"\"'>" + label + "</a>";
        s += (j != entry.labels.length-1) ? ", " : "";
    }
    return s;
}
function publishedDateCode(entry){
    var y = entry.published.substr(0, 4);
    var m = entry.published.substr(5, 2);
    var d = entry.published.substr(8, 2);
    var s = "<a href='javascript:showPostsInDate(\""+y+"\")' title='Sort article by "+y+"'>" + y + "</a>/";
    s += "<a href='javascript:showPostsInDate(\""+y+"-"+m+"\")' title='Sort article by "+y+"/"+m+"'>" + m + "</a>/";
    s += "<a href='javascript:showPostsInDate(\""+y+"-"+m+"-"+d+"\")'title='Sort article by  "+y+"/"+m+"/"+d+"'>" + d + "</a>";
    return s;
}
function titleCode(entry){
    var s = "<span title='lihat ringkasan' onclick='showHideSummary(this)' style='cursor:pointer'>►</span> ";
    s += "<b><a href='"+entry.href+"'>" + entry.title + "</a></b> <br/>";
    s += "<span class='cl_content' id='"+entry.id+"'></span>";
    return s;
}

// ----------------------- selection functions ------------------------------ \\

function showPostsInDate(date){
    var cmp = function(entry){return entry.published.indexOf(date) == 0;}
    var entries = getSomeEntries(cmp);
    showEntries(entries);
}
function showPostsWLabel(label){
    var cmp = function(entry){
        if(label == "*"){return true;}
        for(var i=0; i<entry.labels.length; i++){
            if(entry.labels[i] == label){return true;}
        }
        return false;
    }
    var entries = getSomeEntries(cmp);
    showEntries(entries);
    document.getElementById("cl_labels").value = label;
}




var postTitle=new Array();var postUrl=new Array();var postMp3=new Array();var postDate=new Array();var postLabels=new Array();var postBaru=new Array();var sortBy="titleasc";var tocLoaded=false;var numChars=250;var postFilter="";var numberfeed=0;function loadtoc(a){function b(){if("entry" in a.feed){var d=a.feed.entry.length;numberfeed=d;ii=0;for(var h=0;h<d;h++){var n=a.feed.entry[h];var e=n.title.$t;var m=n.published.$t.substring(0,10);var j;for(var g=0;g<n.link.length;g++){if(n.link[g].rel=="alternate"){j=n.link[g].href;break}}var o="";for(var g=0;g<n.link.length;g++){if(n.link[g].rel=="enclosure"){o=n.link[g].href;break}}var c="";if("category" in n){for(var g=0;g<n.category.length;g++){c=n.category[g].term;var f=c.lastIndexOf(";");if(f!=-1){c=c.substring(0,f)}postLabels[ii]=c;postTitle[ii]=e;postDate[ii]=m;postUrl[ii]=j;postMp3[ii]=o;if(h<10){postBaru[ii]=true}else{postBaru[ii]=false}ii=ii+1}}}}}b();sortBy="titleasc";sortPosts(sortBy);sortlabel();tocLoaded=true;displayToc2();document.write('</br><a href="https://salampathokan.blogspot.com" style="font-size: 12px; text-decoration:none; color: #00FF00;">Widget by Sutrisno Widodo</a>')}function filterPosts(a){scroll(0,0);postFilter=a;displayToc(postFilter)}function allPosts(){sortlabel();postFilter="";displayToc(postFilter)}function sortPosts(d){function c(e,g){var f=postTitle[e];postTitle[e]=postTitle[g];postTitle[g]=f;var f=postDate[e];postDate[e]=postDate[g];postDate[g]=f;var f=postUrl[e];postUrl[e]=postUrl[g];postUrl[g]=f;var f=postLabels[e];postLabels[e]=postLabels[g];postLabels[g]=f;var f=postMp3[e];postMp3[e]=postMp3[g];postMp3[g]=f;var f=postBaru[e];postBaru[e]=postBaru[g];postBaru[g]=f}for(var b=0;b<postTitle.length-1;b++){for(var a=b+1;a<postTitle.length;a++){if(d=="titleasc"){if(postTitle[b]>postTitle[a]){c(b,a)}}if(d=="titledesc"){if(postTitle[b]<postTitle[a]){c(b,a)}}if(d=="dateoldest"){if(postDate[b]>postDate[a]){c(b,a)}}if(d=="datenewest"){if(postDate[b]<postDate[a]){c(b,a)}}if(d=="orderlabel"){if(postLabels[b]>postLabels[a]){c(b,a)}}}}}function sortlabel(){sortBy="orderlabel";sortPosts(sortBy);var a=0;var b=0;while(b<postTitle.length){temp1=postLabels[b];firsti=a;do{a=a+1}while(postLabels[a]==temp1);b=a;sortPosts2(firsti,a);if(b>postTitle.length){break}}}function sortPosts2(d,c){function e(f,h){var g=postTitle[f];postTitle[f]=postTitle[h];postTitle[h]=g;var g=postDate[f];postDate[f]=postDate[h];postDate[h]=g;var g=postUrl[f];postUrl[f]=postUrl[h];postUrl[h]=g;var g=postLabels[f];postLabels[f]=postLabels[h];postLabels[h]=g;var g=postMp3[f];postMp3[f]=postMp3[h];postMp3[h]=g;var g=postBaru[f];postBaru[f]=postBaru[h];postBaru[h]=g}for(var b=d;b<c-1;b++){for(var a=b+1;a<c;a++){if(postTitle[b]>postTitle[a]){e(b,a)}}}}function displayToc(a){var l=0;var h="";var e="Judul Artikel";var m="Klik untuk sortir berdasarkan judul";var d="Tanggal";var k="Klik untuk Sortir bedasarkan tanggal";var c="Kategori";var j="";if(sortBy=="titleasc"){m+=" (descending)";k+=" (newest first)"}if(sortBy=="titledesc"){m+=" (ascending)";k+=" (newest first)"}if(sortBy=="dateoldest"){m+=" (ascending)";k+=" (newest first)"}if(sortBy=="datenewest"){m+=" (ascending)";k+=" (oldest first)"}if(postFilter!=""){j="Klik untuk menampilkan semua"}h+="<table>";h+="<tr>";h+='<td class="toc-header-col1">';h+='<a href="javascript:toggleTitleSort();" title="'+m+'">'+e+"</a>";h+="</td>";h+='<td class="toc-header-col2">';h+='<a href="javascript:toggleDateSort();" title="'+k+'">'+d+"</a>";h+="</td>";h+='<td class="toc-header-col3">';h+='<a href="javascript:allPosts();" title="'+j+'">'+c+"</a>";h+="</td>";h+='<td class="toc-header-col4">';h+="Download MP3";h+="</td>";h+="</tr>";for(var g=0;g<postTitle.length;g++){if(a==""){h+='<tr><td class="toc-entry-col1"><a href="'+postUrl[g]+'">'+postTitle[g]+'</a></td><td class="toc-entry-col2">'+postDate[g]+'</td><td class="toc-entry-col3">'+postLabels[g]+'</td><td class="toc-entry-col4"><a href="'+postMp3[g]+'">Download</a></td></tr>';l++}else{z=postLabels[g].lastIndexOf(a);if(z!=-1){h+='<tr><td class="toc-entry-col1"><a href="'+postUrl[g]+'">'+postTitle[g]+'</a></td><td class="toc-entry-col2">'+postDate[g]+'</td><td class="toc-entry-col3">'+postLabels[g]+'</td><td class="toc-entry-col4"><a href="'+postMp3[g]+'">Download</a></td></tr>';l++}}}h+="</table>";if(l==postTitle.length){var f='<span class="toc-note">Menampilkan Semua '+postTitle.length+" Artikel<br/></span>"}else{var f='<span class="toc-note">Menampilkan '+l+" artikel dengan kategori '";f+=postFilter+"' dari "+postTitle.length+" Total Artikel<br/></span>"}var b=document.getElementById("toc");b.innerHTML=f+h}function displayToc2(){var a=0;var b=0;while(b<postTitle.length){temp1=postLabels[b];document.write("<p/>");document.write('<p><a href="/search/label/'+temp1+'">'+temp1+"</a></p><ol>");firsti=a;do{document.write("<li>");document.write('<a href="'+postUrl[a]+'">'+postTitle[a]+"</a>");if(postBaru[a]==true){document.write(' - <strong><em><blink><span style="color: rgb(255, 0, 0);">Terbaru !!!</span></blink> </em></strong>')}document.write("</li>");a=a+1}while(postLabels[a]==temp1);b=a;document.write("</ol>");sortPosts2(firsti,a);if(b>postTitle.length){break}}}function toggleTitleSort(){if(sortBy=="titleasc"){sortBy="titledesc"}else{sortBy="titleasc"}sortPosts(sortBy);displayToc(postFilter)}function toggleDateSort(){if(sortBy=="datenewest"){sortBy="dateoldest"}else{sortBy="datenewest"}sortPosts(sortBy);displayToc(postFilter)}function showToc(){if(tocLoaded){displayToc(postFilter);var a=document.getElementById("toclink")}else{alert("Just wait... TOC is loading")}}function hideToc(){var a=document.getElementById("toc");a.innerHTML="";var b=document.getElementById("toclink");b.innerHTML='<a href="#" onclick="scroll(0,0); showToc(); Effect.toggle(\'toc-result\',\'blind\');">?? Menampilkan Daftar Isi</a> <img src="https://radiorodja.googlepages.com/new_1.gif"/>'}function looptemp2(){for(var a=0;a<numberfeed;a++){document.write("<br>");document.write('Post Link		  : <a href="'+postUrl[a]+'">'+postTitle[a]+"</a><br>");document.write('Download mp3  : <a href="'+postMp3[a]+'">'+postTitle[a]+"</a><br>");document.write("<br>")}};
