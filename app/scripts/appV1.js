/**
 * Created by pc on 16/03/2018.
 */
var map;
var items=[];
var locals=[];
var lstReg= [];
var lstProv= [];
var markers=[];
$(document).ready(function () {
    loadRegions();
    initialize();
    loadLocals();
});

function SortByName(a, b){
    var aName = a.Nombre.toLowerCase();
    var bName = b.Nombre.toLowerCase();
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function loadRegions()
{
    $.ajax({
        url: "https://www.aosadmiral.com/CalimaIOT/SrvCrud.svc/cl/lr/",
        type: "GET",
        contentType: "application/json;charset=UTF8",
        dataType: 'json',
        headers: {
            token: 1,
            'Content-Type':'application/json'
        },
        success: loadRegionSuccess,
        error: loadRegionError
    });
}

function loadRegionSuccess(data)
{
    lstReg = data.sort(SortByName);
    $('#ddlReg').append($("<option></option>")
        .attr("value", '')
        .text('Todos'));
    $.each(lstReg, function (i, item) {
        $('#ddlReg').append($("<option></option>")
            .attr("value", item.Nombre)
            .text(item.Nombre));
    });
    $('#ddlReg').on('change', function() {
        loadProv();
    })

}



function loadRegionError(data) {

}



function initialize() {
    try {
        var latlng = new google.maps.LatLng(40.44,-3.66);
        var mapOptions = {
            zoom: 6,
            minZoom:5,
            maxZoom:20,
            center: latlng,
            disableDefaultUI: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,

            streetViewControl: false,
            overviewMapControl: false,
            mapTypeControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            }
        };

        map = new google.maps.Map(document.getElementById('winMap'), mapOptions);
        map.setCenter(latlng);
    }
    catch (e)
    {
        alert('Init:'+e.message);
    }
}


function loadLocals()
{
    $.ajax({
        url: "https://www.aosadmiral.com/CalimaIOT/SrvCrud.svc/cl/ll/",
        type: "GET",
        contentType: "application/json;charset=UTF8",
        dataType: 'json',
        headers: {
            token: 1,
            'Content-Type':'application/json'
        },
        success: loadLocalSuccess,
        error: loadLocalError
    });
}
var geocoder = new google.maps.Geocoder();

function loadLocalSuccess(data)
{
    items = [];
    locals=[];
    for(var i=0;i<data.length;i++)
    {
        if((data[i].IdTipo==2 || data[i].IdTipo==3) && data[i].Lat!=0)
        {
            items.push(data[i]);
            locals.push(data[i]);
        }
    }
    loadProv();
   // if(items.length>0) codeAddress(0);
    if(items.length>0) makeMarkers();

}

function loadProv()
{
    var reg=$('#ddlReg').val().toLowerCase();
    lstProv=[];
    $('#ddlProv').find('option').remove();
    $('#ddlProv').append($("<option></option>")
        .attr("value", '')
        .text('Todos'));

try {

    $.each(locals, function (i, item) {
        if(reg=='' || item.Region.toLowerCase().includes(reg)) {
            if ($.inArray(item.Provincia, lstProv) === -1) {
                lstProv.push(item.Provincia);

            }
        }
    });
    lstProv.sort();
    $.each(lstProv, function (i, item) {
        $('#ddlProv').append($("<option></option>")
            .attr("value", item)
            .text(item));
    });

}
    catch(e)
    {}
}

function loadLocalError(data) {
    alert("Error:"+data.responseText);

}


/*
function codeAddress(ind) {
    if(ind==items.length)
    {
        makeMarkers(coords);
        return;
    }
    var item=items[ind];
    var dir=item.Direccion.replace("N�",",");
    var address = dir+','+item.Poblacion+','+item.Provincia;

    geocoder.geocode({ 'address': address },
        function (results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                coords.push(results[0].geometry.location);
                    codeAddress(ind+1);

            } else {
                coords.push(null);
                   alert( status);
                codeAddress(ind+1);
            }
        })(ind);
}
*/
function makeMarkers()
{
    $("#localData").hide();
    for(var i=0;i<markers.length;i++)
        markers[i].setMap(null);
    markers=[];
    var reg=$('#ddlReg').val().toLowerCase();
    var prov = $('#ddlProv').val().toLowerCase();
    if(reg=='' && prov=='') map.setZoom(6);
    else  map.setZoom(8);
    var first=true;
    for(var i=0;i<items.length;i++) {

            if((reg=='' || items[i].Region.toLowerCase().includes(reg)) && (prov=='' || items[i].Provincia.toLowerCase().includes(prov))) {
                createMarker(items[i],first);
                first=false;
            }

    }
}

function createMarker(item,initPos)
{
    var lat = (item.Lat||0);
    var lon = (item.Lon||0);
    var latlng = new google.maps.LatLng(lat, lon);
    var marker = new google.maps.Marker({
        position: latlng,
        draggable: false,
        clickable:true,
        map: map
        /*icon: {
            url: 'scripts/img2.ico',
            scaledSize: new google.maps.Size(40, 40), // size of the icon
            anchor: new google.maps.Point(20, 20) // point of the icon which will correspond to marker's location
        }*/
    });

    var pin = new google.maps.MarkerImage(
        "http://chart.apis.google.com/chart?chst=d_bubble_texts_big&chld=bb|ffffff|002a5c|Admiral|Operations Spain",
        //  'http://chart.apis.google.com/chart?chst=d_fnote&chld=pinned_c|2|002a5c|h|Admiral|Operations Spain',
        null,
        null,
        null,
        new google.maps.Size(55, 40)


       );
    marker.setIcon(pin);
    marker.setPosition(latlng);
    marker.setTitle(item.Nombre);
    markers.push(marker);
    attachLocal(marker, item);
    if(initPos)
    {
        map.setCenter(latlng);

    }
  /*  google.maps.event.addListener(marker, 'click', function (item) {
        alert(item.Nombre);
    })(item);
*/
}

function attachLocal(marker, local) {

    marker.addListener('click', function() {
        $("#localData").show();
        $('#localName').html(local.Nombre);
        $('#localDir').html(local.Direccion);
        $('#localLoc').html(local.Poblacion);
        $('#localProv').html(local.Provincia);
        $('#localReg').html(local.Region);
    });
}

function searchLocals()
{

    makeMarkers();
}
