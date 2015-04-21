var API_URL= "https://api.github.com";
var USERNAME = "";
var PASSWORD = "";

USERNAME= localStorage.nombre;
PASSWORD= localStorage.password;

$.ajaxSetup({
    headers: { 'Authorization': "Basic "+ btoa(USERNAME+':'+PASSWORD) }
});

/*
Details about repository of GitHub API 
https://developer.github.com/v3/repos/
https://developer.github.com/guides/traversing-with-pagination/
http://tools.ietf.org/html/rfc5988
*/


//0. Comprobar usuario y contraseña


$("#buttom_testuser").click(function(e) {
	e.preventDefault();

	if($('#user').val() == "" || $('#key').val()== ""){
		console.log("hola");
		$('<div class="alert alert-danger"> <strong>Error!</strong> Debes proporcionar un usuario y contraseña </div>').appendTo($("#gist_result"));
	}else{
	USERNAME = $("#user").val();
	PASSWORD = $("#key").val();
	localStorage.nombre = document.getElementById("user").value;
	localStorage.password = document.getElementById("key").value;
	
	getUser();
	}
	
});

function getUser() {	

	var url = API_URL + '/users/' + USERNAME;
	$("#gist_result").text('');
	
	$.ajax({
		headers : {
			'Authorization' : "Basic " + btoa(USERNAME + ':' + PASSWORD)
		},
		url : url,
		type : 'GET',
		crossDomain : true,
		dataType : 'json',
	}).done(
		function(data, status, jqxhr) {

				var gist = data;
		$("#gist_result").text("Logeado");
		window.location= "logeo.html";
		
		
		}).fail(function() {
		$("#gist_result").text("Este usuario no existe");
	});
}
$('logeo.html').ready(function(){
		USERNAME= localStorage.nombre;
		$('<strong> Bienvenido, </strong> ' + USERNAME + '<br>').appendTo($('#logeo_result'));

});

//1. GET LISTA TODOS
$("#button_get_gists").click(function(e){
	e.preventDefault();
	
	var url = API_URL + '/users/' + USERNAME + '/gists?per_page=2';
	getGists(url);
});


function GistCollection(gistCollection){
	this.gists = gistCollection;

	var instance = this;

	this.buildLinks = function(header){
		if (header != null ) {
			this.links = weblinking.parseHeader(header);
		} else {
			this.links = weblinking.parseHeader('');
		}
	}

	this.getLink = function(rel){
                return this.links.getLinkValuesByRel(rel);
	}

	this.toHTML = function(){
		var html = '';
		$.each(this.gists, function(i, v) {
			var gist = v;
			html = html.concat('<br>');
			html = html.concat('<strong> ID: </strong>' + gist.id + '<br>');
			html = html.concat('<strong> URL: </strong>'  + gist.html_url + '<br>');
			html = html.concat('<strong> Usuario: </strong>' + gist.owner.login + '<br>');
			html = html.concat('<strong> Description: </strong>' + gist.description + '<br>');
			html = html.concat('<br>');
			
			
		});
		
		//html = html.concat(' <br> ');

                var prev = this.getLink('prev');
		if (prev.length == 1) {
			html = html.concat(' <a onClick="getGists(\'' + prev[0].href + '\');" style="cursor: pointer; cursor: hand;">[Anterior]</a> ');
			
		}
                var next = this.getLink('next');
		if (next.length == 1) {
			html = html.concat(' <a onClick="getGists(\'' + next[0].href + '\');" style="cursor: pointer; cursor: hand;">[Siguiente]</a> ');
		}
		

 		return html;	
	}
}


function getGists(url){

	$("#gists_result").text('');
	
	$.ajax({
		url : url,
		type : 'GET',
		crossDomain : true,
		dataType : 'json',
	}).done(function(data, status, jqxhr){
				var response = data;
				var gistCollection = new GistCollection(response);
				var linkHeader = jqxhr.getResponseHeader('Link');
                gistCollection.buildLinks(linkHeader);
				var html =gistCollection.toHTML();
				$("#gists_result").html(html);
				
	}).fail(function(jqXHR, textStatus) {
		console.log(textStatus);
	});
}


//2.Consultar Gist por id

$("#button_get_userGists").click(function(e) {
	
	e.preventDefault();
	if($('#gists').val() == ""){
		$('<div class="alert alert-danger"> <strong>Oh!</strong> Debes proporcionar una ID </div>').appendTo($("#gists_result_user"));
	}else{
	getGistid($("#gists").val());
	}
	
}); 

function getGistid(gists) {
	var url = API_URL + '/gists/' + gists;
	$("#gists_result_user").text('');

	$.ajax({
		url : url,
		type : 'GET',
		crossDomain : true,
		dataType : 'json',
	}).done(function(data, status, jqxhr) {

				var gist = data;

				$('<br>     </br>').appendTo($('#gists_result_user'));
				$('<p>').appendTo($('#gists_result_user'));	
				$('<strong> ID: </strong> ' + gist.id + '<br>').appendTo($('#gists_result_user'));
				$('<strong> URL: </strong> ' + gist.url + '<br>').appendTo($('#gists_result_user'));
				$('<strong> Usuario: </strong> ' + gist.owner.login + '<br>').appendTo($('#gists_result_user'));
				$('<strong> Description: </strong> ' + gist.description + '<br>').appendTo($('#gists_result_user'));
				$('</p>').appendTo($('#gists_result_user'));

			}).fail(function() {
				$('<div class="alert alert-danger"> <strong>Oh!</strong> Gist not found </div>').appendTo($("#gists_result_user"));
	});
}

//4. CREATE TODO
$("#button_create_gist").click(function(e){
	
	e.preventDefault();
	$("#gist_result").text('');
	
	var nuevoTodo ;
	
	if($('#description_gist').val() == "" || $('#comment_gist').val()=="" || $('#file_gist').val()==""){
		$('<div class="alert alert-info">Debes rellenar los campos Descripcion, Nombre de Archivo y Comentario</div>').appendTo($("#gist_result"));
	}
	else{
	
	var file = '"' + $('#file_gist').val() + '"';
	console.log (file);
		nuevoTodo = {
			"description" : $('#description_gist').val(),
			"public" : true,
			"files":{
				file :   {
					"content" : $('#comment_gist').val()
				}
			}
		}
		createGist(nuevoTodo);
		}
		
		
	
});

function createGist(nuevoTodo) {
	var url = API_URL + '/gists';
	var data = JSON.stringify(nuevoTodo);
	
	$("#gist_result").text('');

	$.ajax({
		url : url,
		type : 'POST',
		crossDomain : true,
		dataType : 'json',
		data : data,
	}).done(function(data, status, jqxhr) {
	console.log(data);
		$('<div class="alert alert-success"> <strong>Ok!</strong> Gist Created</div>').appendTo($("#gist_result"));	
        $("#description_gist").val("");
		$("#comment_gist").val("");		
  	}).fail(function() {
		$('<div class="alert alert-danger"> <strong>Oh!</strong> Error </div>').appendTo($("#gist_result"));
	});

	
	
}



//4. Editar Gist
$("#button_edit_gist").click(function(e) {
	e.preventDefault();

    var editGist;
	if($('#descripcion_gist').val() == "" || $('#comment_gist').val()=="" || $('#id_edit_gist').val()=="") {
		$('<div class="alert alert-info">Debes rellenar los campos ID, Descripcion y Comentario</div>').appendTo($("#edit_result"));
	}else{
	var id = $('#id_edit_gist').val()
	console.log(id)
	
	 editGist = {
	          "description" : $("#descripcion_gist").val(),
	          "files" : {
	          "archivo1" : {
	                "content" : $("#comment_gist").val()
	  }
	  }
	}
	updateGist(editGist, id);
	}
});


function updateGist(editGist, id) {
	var url = API_URL + '/gists/' + id;
	var data = JSON.stringify(editGist);

	$("#edit_result").text('');

	$.ajax({
		url : url,
		type : 'PATCH',
		crossDomain : true,
		dataType : 'json',
		data : data,
		statusCode: {
    		404: function() {$('<div class="alert alert-danger"> <strong>Oh!</strong> Page not found </div>').appendTo($("#edit_result"));}
    	}
	}).done(function(data, status, jqxhr) {
				var gist = data;
				//$("#repos_result").text('');
				$("#comment_gist").val(gist.comentario);
				$("#descripcion_gist").val(gist.descripcion);
	
				console.log(data);
		$('<div class="alert alert-success"> <strong>Ok!</strong> Gist Updated</div>').appendTo($("#edit_result"));				
  	}).fail(function() {
		$('<div class="alert alert-danger"> <strong>Oh!</strong> Error </div>').appendTo($("#edit_result"));
	});

}

//5.Eliminar Gist
$("#button_delete_userGist").click(function(e) {
	e.preventDefault();
	if($('#gists').val() == ""){
		$('<div class="alert alert-danger"> <strong>Error!</strong> Debes proporcionar una ID </div>').appendTo($("#gists_result_user"));
	}else{
	deleteGist($("#gists").val());
	}
	
});

function deleteGist(gists) {
	
	var url = API_URL + '/gists/' + gists;
	$("#gists_result_user").text('');

	$
			.ajax(
					{
						headers : {
							'Authorization' : "Basic "
									+ btoa(USERNAME + ':' + PASSWORD)
						},
						url : url,
						type : 'DELETE',
						crossDomain : true,
						dataType : 'json',
					})
			.done(
					function(data, status, jqxhr) {
						$(
								'<div class="alert alert-success"> <strong>Ok!</strong> Repositorio Borrado</div>')
								.appendTo($("#gists_result_user"));
					})
			.fail(
					function() {
						$(
								'<div class="alert alert-danger"> <strong>Lastima!</strong> Error al borrar gist </div>')
								.appendTo($("#gists_result_user"));
					});
}

