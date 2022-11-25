<?php
require_once( __DIR__ . '/../config/config.php' );
require_once( __DIR__ . '/../config/cors.php' );

function conectarBD()
 {
    $link = mysqli_connect( DBHOST, DBUSER, DBPASS, DBBASE );
    if ( $link === false ) {
        print 'Falló la conexión: ' . mysqli_connect_error();
        outputError( 500 );
    }
    mysqli_set_charset( $link, 'utf8' );
    return $link;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {    
   return 0;    
}  

date_default_timezone_set('America/Argentina/Buenos_Aires');

define ('JWT_KEY', 'DayR7RxvEM4T4efkoEZBSV4E5E47DArq8vxiB3O_zeL0yjMpogyFIV0pTqJv6llMkCOJK-ZW0rY3lVDjVqrmtdaQZHepj-D4L43GB7mzywkDtr7K-LpjvfKdRRGEqIcvYAPBjCVXOSKLa6tiiuj4KecC1fYPTwAuEjbkhVSEO57Q-X4mZ862gojPl4Jl6Ao6-pe2A0XnzvBwK7S34UmDh7Xabv-Tjb4_j80Te09uv4ppA_gwW611MlQnwCxX-3nWfeWafx6hq8bDm4ZuFy60mkwhGPqgJ-arFV3A4zja4SYfTdfGQjYFIhTcR3ZJCnHREBd1VY1M_y3KfTVcEIZW1A');
define ('JWT_ALG', 'HS256');
define ('JWT_EXP', 7200); // 2h -> 7200
 
if (!function_exists('getallheaders')) {
    function getallheaders()
    {
        $headers = array();
        $copy_server = array(
            'CONTENT_TYPE'   => 'Content-Type',
            'CONTENT_LENGTH' => 'Content-Length',
            'CONTENT_MD5'    => 'Content-Md5',
        );
        foreach ($_SERVER as $key => $value) {
            if (substr($key, 0, 5) === 'HTTP_') {
                $key = substr($key, 5);
                if (!isset($copy_server[$key]) || !isset($_SERVER[$key])) {
                    $key = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', $key))));
                    $headers[$key] = $value;
                }
            } elseif (isset($copy_server[$key])) {
                $headers[$copy_server[$key]] = $value;
            }
        }
        if (!isset($headers['Authorization'])) {
            if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['PHP_AUTH_USER'])) {
                $basic_pass = isset($_SERVER['PHP_AUTH_PW']) ? $_SERVER['PHP_AUTH_PW'] : '';
                $headers['Authorization'] = 'Basic ' . base64_encode($_SERVER['PHP_AUTH_USER'] . ':' . $basic_pass);
            } elseif (isset($_SERVER['PHP_AUTH_DIGEST'])) {
                $headers['Authorization'] = $_SERVER['PHP_AUTH_DIGEST'];
            }
        }
        return $headers;
    }

}

spl_autoload_register(function ($nombre_clase) {
    include __DIR__.'/'.str_replace('\\', '/', $nombre_clase) . '.php';
});

use \Firebase\JWT\JWT;

$metodo = strtolower($_SERVER['REQUEST_METHOD']);
$comandos = explode('/', strtolower($_GET['comando']));
$funcionNombre = $metodo.ucfirst($comandos[0]);

$parametros = array_slice($comandos, 1);
if(count($parametros) >0 && $metodo == 'get')
	$funcionNombre = $funcionNombre.'ConParametros';


if(function_exists($funcionNombre))
	call_user_func_array ($funcionNombre, $parametros);
else
	header(' ', true, 400);


function output($val, $headerStatus = 200){
	header(' ', true, $headerStatus);
	header('Content-Type: application/json');
	print json_encode($val);
	die;
}

function outputError($headerStatus, $mensaje=""){
	header(' ', true, $headerStatus);
	header('Content-Type: application/json');
	print json_encode($mensaje);
	die;
}

function outputJson($data, $codigo = 200)
{
    header('', true, $codigo);
    header('Content-type: application/json');
    print json_encode($data);
    die;
}

function requiereAutorizacion()
{
	try {
		$headers = getallheaders();
		if (!isset($headers['Authorization'])) {
			throw new Exception("Token requerido", 1);
		}
		list($jwt) = sscanf($headers['Authorization'], 'Bearer %s');
		$decoded = JWT::decode($jwt, JWT_KEY, [JWT_ALG]);
	} catch(Exception $e) {
		outputError(401);
	}
	return $decoded;
}

// ---------------------------------------------------------------------------------------------- //
function autenticar($usuario, $clave)
{
	$db = conectarBD();
    // Se verifica que coincida el email ingresado:
    $sql = "SELECT * FROM usuario WHERE email= '$usuario'";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
		return false;
    }
	$fila = mysqli_fetch_assoc( $result );
    // Se verifica que coincida la contraseña ingresada:
    if (!hash_equals($fila['password'], crypt($clave, $fila['password']))) {
        return false;
     }
    // Retorno de datos utiles:
	return [
		'email' => $fila['email'],
		'id'	 => $fila['_id'],
        'administrador' => $fila['administrador'],
        'username' => $fila['username'],
	];
	return false;
}

function postLogin()
{
	$loginData = json_decode(file_get_contents("php://input"), true);
	$logged = autenticar($loginData['email'], $loginData['clave']);
	if($logged===false) {
		outputError(401, "Las credenciales de acceso son incorrectas");
	}
	$payload = [
		'id'		=> $logged['id'],
		'email'	=> $logged['email'],
        'administrador' => $logged['administrador'],
        'username' => $logged['username'],
		'exp'		=> time() + JWT_EXP,
	];
	$jwt = JWT::encode($payload, JWT_KEY, JWT_ALG);
	output(['jwt'=>$jwt]);
}

// ---------------------------------------------------------------------------------------------- //
function getPrivado() {
	$payload = requiereAutorizacion();
	output([$payload->id, $payload->email, $payload->administrador, $payload->username]);
}

// ---------------------------------------------------------------------------------------------- //
function getPerfil()
{
	$payload = requiereAutorizacion();
	output(['id' => $payload->id, 'email' => $payload->email]);
}

// ---------------------------------------------------------------------------------------------- //
function postRefresh()
{
	$payload = requiereAutorizacion();
	$payload->exp = time() + JWT_EXP;
	$jwt = JWT::encode($payload, JWT_KEY);
	output(['jwt'=>$jwt]);
}

// ---------------------------------------------------------------------------------------------- //
function postUsuario()
 {
    $db = conectarBD();
    $data = json_decode( file_get_contents( 'php://input' ), true );
    // Validan datos ingresados:
    $username = mysqli_real_escape_string( $db, $data[ 'username' ] );
    $password = mysqli_real_escape_string( $db, $data[ 'password' ] );
    $email = mysqli_real_escape_string( $db, $data[ 'email' ] );
    $email = strtolower( $email );
    if ( $data[ 'password' ] == '' || $data[ 'email' ] == '' ) {
        outputError( 400, "Error en los datos ingresados" );
    }
    if ( $data[ 'password' ] != $data[ 'passwordAux' ] ) {
        outputError( 400, "Las contraseñas ingresadas no coinciden" );
    }
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    // Se verifica que no exista un usuario con el mismo email:
    $sql = "SELECT * FROM usuario WHERE email = '$email'";
    $result = mysqli_query( $db, $sql );
    if ( mysqli_num_rows($result) > 0 ) {
        outputError( 400, "Email ya registrado" );
    }
    mysqli_free_result( $result );
    // Se verifica que no exista un usuario con el mismo nombre de usuario:
    $sql = "SELECT * FROM usuario WHERE username = '$username'";
    $result = mysqli_query( $db, $sql );
    if ( mysqli_num_rows($result) > 0) {
        outputError( 400, "Nombre de usuario ya registrado" );
    }
    mysqli_free_result( $result );
    // Se crea el usuario:
    $sql = "INSERT INTO usuario ( password, email , username) VALUES ( '$password_hash', '$email', '$username' )";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500, "No se pudo crear el usuario" );
    }
    $id = mysqli_insert_id( $db );
    mysqli_close( $db );
    outputJson( [ 'id' => $id ] );
}

// ---------------------------------------------------------------------------------------------- //
function getUsernameConParametros($username)
{
    $db = conectarBD();
    $username = mysqli_real_escape_string( $db, $username );
    $sql = "SELECT _id, username, email, administrador
    FROM usuario
    WHERE username = '$username';";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500 );
    }
    $ret = [];
    while ( $fila = mysqli_fetch_assoc( $result ) ) {
        settype($fila['_id'], 'integer');
        settype($fila['anio'], 'integer');
        $ret[] = $fila;
    }
    mysqli_free_result( $result );
    mysqli_close( $db );
    outputJson( $ret );
}

// ---------------------------------------------------------------------------------------------- //
function getEmailConParametros($email)
{
    $db = conectarBD();
    $email = mysqli_real_escape_string( $db, $email );
    $sql = "SELECT _id, username, email, administrador
    FROM usuario
    WHERE email = '$email';";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500 );
    }
    $ret = [];
    while ( $fila = mysqli_fetch_assoc( $result ) ) {
        settype($fila['_id'], 'integer');
        settype($fila['anio'], 'integer');
        $ret[] = $fila;
    }
    mysqli_free_result( $result );
    mysqli_close( $db );
    outputJson( $ret );
}

// ---------------------------------------------------------------------------------------------- //
function getPelicula()
{
    $db = conectarBD();
    $sql = "SELECT * FROM pelicula ORDER BY anio DESC;";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500 );
    }
    $ret = [];
    while ( $fila = mysqli_fetch_assoc( $result ) ) {
        settype($fila['_id'], 'integer');
        settype($fila['anio'], 'integer');
        $ret[] = $fila;
    }
    mysqli_free_result( $result );
    mysqli_close( $db );
    outputJson( $ret );
}

// ---------------------------------------------------------------------------------------------- //
function getPeliculaTituloConParametros($titulo)
{
    $db = conectarBD();
    $sql = "SELECT * FROM pelicula WHERE titulo = '$titulo'";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500 );
    }
    $ret = [];
    while ( $fila = mysqli_fetch_assoc( $result ) ) {
        settype($fila['_id'], 'integer');
        settype($fila['anio'], 'integer');
        $ret[] = $fila;
    }
    mysqli_free_result( $result );
    mysqli_close( $db );
    outputJson( $ret );
}

// ---------------------------------------------------------------------------------------------- //
function getCantidadPeliculas()
{
    $db = conectarBD();
    $sql = "SELECT * FROM pelicula;";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500 );
    }
    $cantidad = mysqli_num_rows($result);
    mysqli_free_result( $result );
    mysqli_close( $db );
    outputJson( [ 'cantidad' => $cantidad ] );
}

// ---------------------------------------------------------------------------------------------- //
function postReview()
 {
    $db = conectarBD();
    $data = json_decode( file_get_contents( 'php://input' ), true );
    // Validan los datos ingresados:
    $descripcion = mysqli_real_escape_string( $db, $data[ 'descripcion' ] );
    $estrellas = $data[ 'estrellas' ] +0;
    $usuarioId = $data[ 'usuarioId' ] +0;
    $peliculaId = $data[ 'peliculaId' ] +0;
    $createdAt = date("Y-m-d");
    if ($descripcion == '' || $estrellas<0 || $estrellas>5) {
        outputError( 400, "Error en los datos ingresados" );
    }
    // Se crea la review:
    $sql = "INSERT INTO review ( peliculaId, descripcion, estrellas, createdAt, usuarioId ) VALUES ( '$peliculaId', '$descripcion', '$estrellas', '$createdAt', '$usuarioId' )";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500, "No se pudo crear la review" );
    }
    $id = mysqli_insert_id( $db );
    mysqli_close( $db );
    outputJson( [ 'id' => $id ] );
}

// ---------------------------------------------------------------------------------------------- //
function patchReview($id)
{
    $db = conectarBD();
    $data = json_decode( file_get_contents( 'php://input' ), true );
    // Validan los datos ingresados:
    $descripcion = mysqli_real_escape_string( $db, $data[ 'descripcion' ] );
    $estrellas = $data[ 'estrellas' ] +0;
    $peliculaId = $data[ 'peliculaId' ] +0;
    if ( $descripcion == '' || $estrellas<0 || $estrellas>5) {
        outputError( 400, "Error en los datos ingresados" );
    }
    // Se modifica la review:
    $sql = "UPDATE review SET peliculaId='$peliculaId', descripcion='$descripcion', estrellas='$estrellas' WHERE _id=$id";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500, "No se pudo modificar la review" );
    }
    mysqli_close( $db );
    outputJson( [] );
}

// ---------------------------------------------------------------------------------------------- //
function getReviewConParametros($usuarioId)
{
    $db = conectarBD();
    $sql = "SELECT r._id, r.descripcion, r.estrellas, p.titulo, r.peliculaId, r.createdAt FROM review AS r
    INNER JOIN pelicula AS p ON p._id = r.peliculaId 
    WHERE usuarioId = '$usuarioId'
    ORDER BY r._id DESC;";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500 );
    }
    $ret = [];
    while ( $fila = mysqli_fetch_assoc( $result ) ) {
        settype($fila['_id'], 'integer');
        settype($fila['estrellas'], 'integer');
        settype($fila['peliculaId'], 'integer');
        $ret[] = $fila;
    }
    mysqli_free_result( $result );
    mysqli_close( $db );
    outputJson( $ret );
}

// ---------------------------------------------------------------------------------------------- //
function deleteReview($id)
{
    $id +=0;
    $db = conectarBD();
    $sql = "DELETE FROM review WHERE _id = $id;";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500, "No se pudo eliminar la review");
    }
    if ( mysqli_affected_rows( $db ) == 0 ) {
        outputError( 404, "No se pudo eliminar la review");
    }
    mysqli_close( $db );
    outputJson( [] );
}

// ---------------------------------------------------------------------------------------------- //
function getReview()
{
    $db = conectarBD();
    $sql = "SELECT r._id, r.descripcion, r.estrellas, r.createdAt, u.username, p.titulo, p.img, p.anio
    FROM review AS r 
    INNER JOIN usuario AS u ON u._id = r.usuarioId
    INNER JOIN pelicula AS p ON p._id = r.peliculaId
    ORDER BY r._id DESC;";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500 );
    }
    $ret = [];
    while ( $fila = mysqli_fetch_assoc( $result ) ) {
        settype($fila['_id'], 'integer');
        settype($fila['estrellas'], 'integer');
        $ret[] = $fila;
    }
    mysqli_free_result( $result );
    mysqli_close( $db );
    outputJson( $ret );
}

// ---------------------------------------------------------------------------------------------- //
function getUsuarioNormal()
{
    $db = conectarBD();
    $sql = "SELECT _id, username, email FROM usuario
    WHERE administrador = 0;";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500 );
    }
    $ret = [];
    while ( $fila = mysqli_fetch_assoc( $result ) ) {
        settype($fila['_id'], 'integer');
        $ret[] = $fila;
    }
    mysqli_free_result( $result );
    mysqli_close( $db );
    outputJson( $ret );
}

// ---------------------------------------------------------------------------------------------- //
function deleteUsuario($id)
{
    $id +=0;
    $db = conectarBD();
    $sql = "DELETE FROM usuario WHERE _id = $id;";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500, "No se pudo eliminar el usuario");
    }
    if ( mysqli_affected_rows( $db ) == 0 ) {
        outputError( 404, "No se pudo eliminar el usuario");
    }
    mysqli_close( $db );
    outputJson( [] );
}

// ---------------------------------------------------------------------------------------------- //
function deletePelicula($id)
{
    $id +=0;
    $db = conectarBD();
    // Se verifica que se encuntre más de una pelicula en la BD:
    $sql = "SELECT * FROM pelicula";
    $result = mysqli_query( $db, $sql );
    if ( mysqli_num_rows($result) <= 1 ) {
        outputError( 404, "No se pudo eliminar la película, tiene que haber al menos 1 película registrada");
    }
	$fila = mysqli_fetch_assoc( $result );
    // Se elimina la pelicula:
    $sql = "DELETE FROM pelicula WHERE _id = $id;";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500, "No se pudo eliminar la película");
    }
    if ( mysqli_affected_rows( $db ) == 0 ) {
        outputError( 404, "No se pudo eliminar la película");
    }
    mysqli_close( $db );
    outputJson( [] );
}


// ---------------------------------------------------------------------------------------------- //
function postPelicula()
 {
    $db = conectarBD();
    $data = json_decode( file_get_contents( 'php://input' ), true );
    // Validan los datos ingresados:
    $img = mysqli_real_escape_string( $db, $data[ 'img' ] );
    $titulo = mysqli_real_escape_string( $db, $data[ 'titulo' ] );
    $anio = $data[ 'anio' ] +0;
    $actualYear = date("Y");
    if ($img == '' || $titulo == '' || $anio<1950 || $anio>$actualYear) {
        outputError( 400, "Error en los datos ingresados" );
    }
    // Se verifica que no exista una película con el mismo nombre y mismo año de estreno:
    $sql = "SELECT * FROM pelicula WHERE titulo = '$titulo' AND anio = '$anio';";
    $result = mysqli_query( $db, $sql );
    if ( mysqli_num_rows($result) > 0) {
        outputError( 400, "Película ya registrada" );
    }
    mysqli_free_result( $result );
    // Se crea la review:
    $sql = "INSERT INTO pelicula ( titulo, anio, img) VALUES ( '$titulo', '$anio', '$img');";
    $result = mysqli_query( $db, $sql );
    if ( $result === false ) {
        print mysqli_error( $db );
        outputError( 500, "No se pudo registrar la película" );
    }
    $id = mysqli_insert_id( $db );
    mysqli_close( $db );
    outputJson( [ 'id' => $id ] );
}