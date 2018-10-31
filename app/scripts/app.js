/**
 * Created by pc on 16/03/2018.
 */

var map;
var items=[];
var locals=[];
var lstReg= [];
var lstProv= [];
var lstCiud= [];
var markers=[];
var  first=true;
var url='https://www.aosadmiral.com/CalimaIOT/SrvCrud.svc/';
//var url='https://servidor.adealoxica.com:8433/wcfCalimaIOT/SrvCrud.svc/';



$(document).ready(function () {
  //  loadRegions();
    initialize();
    loadLocals();
    $('#ddlProv').on('change', function() {
        loadCiudades();
    })
});

function SortByName(a, b){
    var aName = a.Nombre.toLowerCase();
    var bName = b.Nombre.toLowerCase();
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function loadRegions()
{
    $.ajax({
        url: url+"cl/lr/",
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
        url: url+"cl/ll/",
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
        if((data[i].IdTipo==2 || data[i].IdTipo==3) && data[i].Lat!=0 && data[i].WebVisible)
        {
            items.push(data[i]);
            locals.push(data[i]);
        }
    }
    loadProv();
    searchLocals();
    //if(items.length>0) makeMarkers();

}

function loadCiudades()
{
    lstCiud=[];
    $('#ddlCiud').find('option').remove();
    $('#ddlCiud').append($("<option></option>")
        .attr("value", '')
        .text('Todos'));
    var prov=$('#ddlProv').val().toLowerCase();
    try {

        $.each(locals, function (i, item) {
            if(prov=='' || item.Provincia.toLowerCase().includes(prov)) {
                if ($.inArray(item.Poblacion.toUpperCase(), lstCiud) === -1) {
                    lstCiud.push(item.Poblacion.toUpperCase());

                }
            }
        });
        lstCiud.sort();
        $.each(lstCiud, function (i, item) {
            $('#ddlCiud').append($("<option></option>")
                .attr("value", item)
                .text(item));
        });

    }
    catch(e)
    {}
}

function loadProv()
{

    lstProv=[];
    $('#ddlProv').find('option').remove();
    $('#ddlProv').append($("<option></option>")
        .attr("value", '')
        .text('Todos'));


try {

    $.each(locals, function (i, item) {

            if ($.inArray(item.Provincia, lstProv) === -1) {
                lstProv.push(item.Provincia);

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
$(document).on("click", "a.local" , function() {

    var selected = $(this).attr('ind');
    showLocal(items[selected]);
    var lat = (items[selected].Lat||0);
    var lon = (items[selected].Lon||0);
    if(lat!=0 && lon!=0) {
        var latlng = new google.maps.LatLng(lat, lon);
        map.setCenter(latlng);
    }
    map.setZoom(16);
    window.scrollTo(0, 0);
});

function makeMarkers()
{
    $('#list .list li').remove();


    $("#localData").hide();
    for(var i=0;i<markers.length;i++)
        markers[i].setMap(null);
    markers=[];
    var ciud=($('#ddlCiud').val()||'');
    var prov = $('#ddlProv').val().toLowerCase();
    if(ciud=='' && prov=='') map.setZoom(6);
    else if(ciud=='')  map.setZoom(11);
    else map.setZoom(13);
    var first=true;
    for(var i=0;i<items.length;i++) {

            if((ciud=='' || items[i].Poblacion.toUpperCase().includes(ciud)) && (prov=='' || items[i].Provincia.toLowerCase().includes(prov))) {

                createMarker(items[i],first);
                first=false;
                $('#list .list').append("<li ><a href='javascript:void(0);' class='local' ind="+i+" >"+items[i].Nombre+"</a></li>");
            }

    }



}

function createMarker(item,initPos)
{
    var lat = (item.Lat||0);
    var lon = (item.Lon||0);
    var latlng = new google.maps.LatLng(lat, lon);
  //  var name=item.Nombre.replace(/ /g,"|");
    var name=item.Nombre;
    var marker =  new MarkerWithLabel({//new google.maps.Marker({
        position: latlng,
        draggable: false,
        clickable:true,
        map: map,
        icon: {
            url: 'images/marker.png',
            scaledSize: new google.maps.Size(25, 25), // size of the icon
            anchor: new google.maps.Point(0, 0) // point of the icon which will correspond to marker's location
        },
       /* label: {
            text: name,
            fontWeight: 'bold',
            fontSize: '10px',
            color: '#002a5c'

        }*/
        labelContent:name,
        labelAnchor: new google.maps.Point(20, -20),
        labelClass: "labels", // the CSS class for the label
    });



  /*  var lblOptions = {
        content: name,
        boxStyle: {
            border: "1px solid yellow" //1px solid black"
            ,
            textAlign: "center",
            fontSize: "10pt",
            fontWeight: "bold",
            width: "150px",
            color: "#002a5c",
            bgcolor:"white"

        },
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(10, -10),
        position: latlng,
        closeBoxURL: "",
        isHidden: false,
        pane: "mapPane",
        enableEventPropagation: true
    };

    var ibLabel = new InfoBox(lblOptions);
    ibLabel.open(map);
*/
    var pin = new google.maps.MarkerImage(

        "http://chart.apis.google.com/chart?chst=d_bubble_texts_big&chld=bb|ffffff|002a5c|"+name,
       // "http://chart.apis.google.com/chart?chst=d_bubble_texts_big&chld=bb|ffffff|002a5c|Admiral|Operations Spain",
        //  'http://chart.apis.google.com/chart?chst=d_fnote&chld=pinned_c|2|002a5c|h|Admiral|Operations Spain',
        null,
        null,
        null,
        new google.maps.Size(55, 40)


       );
 //   marker.setIcon(pin);
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
       showLocal(local);
    });
}

function Bool2Str(item)
{
    if(item) return "SI";
    else return "NO";
}

function showLocal(local)
{
    $('#dlgLocal').modal();
    $("#localData").show();

    $('#localName').html((local.WebNombre||local.Nombre));
    $('#localDir').html((local.WebDireccion||local.Direccion));
    $('#localLoc').html((local.WebPoblacion||local.Poblacion));
    $('#localProv').html((local.WebProvincia||local.Provincia));
    $('#localCP').html((local.WebCP||local.CP));
    $('#localEmail').html((local.WebMain||local.Email));
 //   $('#localHorario').html();
  //  $('#localCatering').html( Bool2Str(local.WebServicioCatering));
  //  $('#localWifi').html( Bool2Str(local.WebServicioWifi));

    if(local.WebServicioWifi)
        $("#localWifiImg").show();
    else
        $("#localWifiImg").hide();
  //  $('#localPark').html( Bool2Str(local.WebServicioParking));
 //   $('#localBar').html( Bool2Str(local.WebServicioBar));
  //  $('#localTPV').html( Bool2Str(local.WebServicioTpv));
  //  $('#localDisc').html( Bool2Str(local.WebServicioMinusvalidos));

    if(local.WebServicioMinusValidos)
        $("#localDiscImg").show();
    else
        $("#localDiscImg").hide();
  //  $('#localRet').html( Bool2Str(local.WebServicioRestransmision));
   // $('#localCaja').html( Bool2Str(local.WebApuestas));
    var url='images/';

    if(local.WebApuestas)
    $('#localCajaImg').attr('src', url+'Sportium.png');
    else
        $('#localCajaImg').attr('src', url+'codere.png');

    $('#localMaq').html( Bool2Str(local.WebMaquinas));
    $('#localTec').html( Bool2Str((local.WebTecnausa||local.ControlTecnausa)));
 /*   $('#localComMaq').html(local.WebMaquinasComentarios);
    $('#localComCaja').html(local.WebApuestasComentarios);
    $('#localComPark').html(local.WebServicioParkingComentarios);*/
    $('#localComDisc').html(local.WebMinusvalidosComentarios);
    loadAdjuntos(local);
    loadOfertas(local);
}


function loadAdjuntos(local)
{
    $('#localImgList  li').remove();
    $('#dataImgList  div').remove();
    $('#lstCarusel').hide();
    $.ajax({
        url: url+"gest/local/la/?idl="+local.Id,
        type: "GET",
        contentType: "application/json;charset=UTF8",
        dataType: 'json',
        headers: {
            token: 1,
            'Content-Type':'application/json'
        },
        success: loadAdjuntosSuccess,
        error: loadAdjuntosError
    });
}

function loadAdjuntosSuccess(data)
{
    /*<li data-target="#myCarousel" data-slide-to="0" class="active"></li>
<div class="item active">
    <img src="la.jpg" alt="Los Angeles" style="width:100%;">
    </div>*/
    var lst = data;
    var first='';
    if(lst==null || lst.length==0) return;
    $('#lstCarusel').show();
    for(var i=0;i<lst.length;i++) {
        if(i==0) first='active';
        else first ='';
        $('#localImgList').append("<li data-target='lstCarusel' data-slide-to="+i+" class='"+first+"'></li>");
        GetAdjunto(lst[i]);
    }
    $('#lstCarusel').carousel();
}

function GetAdjunto(item)
{
    $.ajax({
        url: url+"gest/local/aa/?ida="+item.Id,
        type: "GET",
        contentType: "application/json;charset=UTF8",
        dataType: 'json',
        headers: {
            token: 1,
            'Content-Type':'application/json'
        },
        success: GetAdjuntosSuccess

    });
}

function GetAdjuntosSuccess(data)
{
    var first='';

        if($('#dataImgList div').length==0) first=' active';
        else first ='';
  //  var obj="<div class='item"+first+"'><img style='width:100%;height:100%' src='"+data+"'/></div>";
    var obj="<div class='item"+first+"'><img class='img-carusel' src='"+data+"'/></div>";
    $('#dataImgList').append(obj);
}

function loadAdjuntosError(data) {
 var err=data.responseText;
}


function loadOfertas(local)
{
    $('#localPromoList  li').remove();
    $('#dataPromoList  div').remove();
    $('#lstPromo').hide();
    $.ajax({
        url: url+"gest/local/gow/?idl="+local.Id,
        type: "GET",
        contentType: "application/json;charset=UTF8",
        dataType: 'json',
        headers: {
            token: 1,
            'Content-Type':'application/json'
        },
        success: loadOfertaSuccess,
        error: loadOfertasError
    });
}

function loadOfertaSuccess(data)
{
    var lst = data;
    var first='';
    if(lst==null || lst.length==0) return;
    $('#lstPromo').show();
    for(var i=0;i<lst.length;i++) {
        if(i==0) first='active';
        else first ='';
        $('#localPromoList').append("<li data-target='lstPromo' data-slide-to="+i+" class='"+first+"'></li>");
        var obj="<div class='item "+first+"'><img class='img-carusel' src='"+lst[i].ImagenOferta+"'/>"+
            "<div class='carousel-caption'><h3>"+lst[i].Texto+"</h3></div></div>";
        $('#dataPromoList').append(obj);
    }
    $('#lstPromo').carousel();
}


function loadOfertasError(data) {
    var err=data.responseText;
}

function searchLocals()
{

    makeMarkers();
}
